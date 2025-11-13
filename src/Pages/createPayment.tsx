import { useEffect, useState } from "react";
import loadjQuery2 from "./HPS3/Loadjquery";
import loadLatpayJS2 from "./HPS3/Hps3function";
import sha256 from "sha256";
import axios from "axios";
import { getUtcDate } from "../Components/UtcDate";

declare global {
  interface Window {
    //@ts-ignore
    LatpayCheckout: any;
    onPaymentAction?: (data: any) => void;
  }
}
interface openfunctiondata {
  publishableKey: string;
  currency: string;
  amount: any;
  type: string;
  data: any;
}
const CreatePayment = () => {
  const [initialLoader, setInitialLoader] = useState(true);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [processingLoader, setProcessingLoader] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    //console.log("inside useEffect - iFrame loading");

    const handleMessage = (event: MessageEvent) => {
      // Parse event data
      let data: openfunctiondata;
      try {
        data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        //console.log("Parsed data:", data);
      } catch (e) {
        console.error("Failed to parse event data:", event.data, e);
        return;
      }

      // Check for payment initiation props or similar
      if (
        data &&
        (data.type === "payment_initiate_props" ||
          data.type === "initiate_payment" ||
          data.type === "custom_provider_initiate_payment")
      ) {
        console.log(
          "GHL out put when page load : Received valid payment data:",
          data
        );
        setPaymentData(data.data || data); // Handle nested data
        var paymentData = data.data || data;
        var timeStampVal = getUtcDate();
        const xSignatureVal = sha256(timeStampVal + window?.env?.DB_SECRET_KEY);
        console.log("getsubtypeusing id request", {
          ...paymentData,
          timeStamp: timeStampVal,
        });
        axios({
          method: "post",
          url: "https://us-central1-cert-dev-f6b62.cloudfunctions.net/ghl_getSubTypeUsingOrderId",
          headers: {
            " X-Signature": xSignatureVal,
          },
          data: { ...paymentData, timeStamp: timeStampVal },
        })
          .then((subTyperes) => {
            console.log("sub type response from ghl", subTyperes.data);
            if (
              subTyperes.data.statuscode == "0" &&
              subTyperes.data.statusdesc.orderId == paymentData.orderId
            ) {
              if (subTyperes.data.statusdesc.subType === "upsell") {
                console.log(
                  "sub type value",
                  subTyperes.data.statusdesc.subType
                );
                console.log("upsellTransaction request value", {
                  contactId: paymentData.contact.id,
                  orderId: paymentData.orderId,
                  transactionId: paymentData.transactionId,
                  amount: paymentData.amount,
                  merchantId: paymentData.publishableKey.split("###")[0],
                  name: paymentData.contact.name,
                  email: paymentData.contact.email,
                });
                axios({
                  url: "https://us-central1-cert-dev-f6b62.cloudfunctions.net/ghl_doUpsellTransaction",
                  method: "post",
                  data: {
                    contactId: paymentData.contact.id,
                    orderId: paymentData.orderId,
                    transactionId: paymentData.transactionId,
                    amount: paymentData.amount,
                    merchantId: paymentData.publishableKey.split("###")[0],
                    name: paymentData.contact.name,
                    email: paymentData.contact.email,
                  },
                })
                  .then((upsellTransactionRes) => {
                    console.log(
                      "upsell transaction response",
                      upsellTransactionRes.data
                    );
                  })
                  .catch((err) => {
                    console.error(
                      "error while getting upsell transaction",
                      err
                    );
                  });
              }
            }
          })
          .catch((err) => {
            console.error("error while getting sub type from ghl", err);
          });
      } else {
        console.warn(
          "Unexpected message type or data:",
          data?.type || "No type"
        );
      }
    };

    window.addEventListener("message", handleMessage);

    const readyMessage = JSON.stringify({
      type: "custom_provider_ready",
      loaded: true,
    });

    // Delay ensures parent is ready to listen
    const sendReady = () => {
      //console.log("Sending ready message to parent");
      window.parent.postMessage(readyMessage, "*");
    };
    // waitForReady();
    if (document.readyState === "complete") {
      setTimeout(sendReady, 500);
    } else {
      window.addEventListener("load", () => setTimeout(sendReady, 500)); // change this to await maximum 10 seconds
    }
  }, []);

  const [transKey, setTransKey] = useState("");

  useEffect(() => {
    if (paymentData != null) {
      // console.log("publish key", paymentData.publishableKey);
      const inputString = `${paymentData.currency.toUpperCase()}${
        paymentData.amount
      }${paymentData.transactionId}Y${
        paymentData.publishableKey.split("###")[2]
      }`;
      //console.log("transkey generation", inputString);
      const hash = sha256(inputString);
      // console.log("hash value", hash);
      setTransKey(hash);
      loadjQuery2(() => {
        loadLatpayJS2(() => {
          //  console.log("loading");
          // Clear previous Latpay content
          const $ = (window as any).$;
          $("#latpay-element").empty();

          //function returns processing status to set load true
          window.onPaymentAction = (data: any) => {
            // console.log("inside the onpayment function", data);
            if (
              data?.status?.statusdesc == "Card payment processing..." &&
              data?.status?.responsetype == "0"
            ) {
              setProcessingLoader(true);
            }

            if (
              data?.status?.statusdesc == "Googlepay payment processing..." &&
              data?.status?.responsetype == "1"
            ) {
              setProcessingLoader(true);
            }

            if (
              data?.status?.statusdesc == "Card payment validation failed" &&
              data?.status?.responsetype == "1"
            ) {
              setButtonLoader(false);
            }
          };

          // after 3d secure payemnt function got procced and it response is passed to this function
          window.LatpayCheckout.OnPaymentCompleted = (val: any) => {
            console.log("Output from Hps : Payment completed:", val);
            // console.log("publishable key", paymentData.publishableKey);
            setButtonLoader(false);

            //transaction success call

            //pass ghl success message
            if (val.errorcode == "00") {
              const successMessage = JSON.stringify({
                type: "custom_element_success_response",
                // publicshablekey / amount / currency / transactionID / Data key / reference hps call
                chargeId: `${paymentData.publishableKey.split("###")[0]}###${
                  paymentData.publishableKey.split("###")[1]
                }###${paymentData.publishableKey.split("###")[2]}###${
                  paymentData.amount
                }###${paymentData.currency.toUpperCase()}###${
                  paymentData.transactionId
                }`,
              });
              window.parent.postMessage(successMessage, "*");
            } else {
              //pass ghl failure message
              // transaction rejection call
              const rejectedMessage = JSON.stringify({
                type: "custom_element_error_response",
                error: {
                  description: "Transaction got rejected", // Error message to be shown to the user
                },
              });
              //console.log("rejected message", rejectedMessage);
              window.parent.postMessage(rejectedMessage, "*");
            }
            // console.log("request structure", {
            //   timeStamp: timeStampVal,
            //   locationId: paymentData.locationId,
            //   transactionId: paymentData.transactionId,
            //   orderId: paymentData.orderId,
            // });
            //api call to get the transaction details from firebase
            // axios({
            //   method: "post",
            //   url: window.env.DB_GET_TRANSACTIONDETAIL,
            //   headers: {
            //     " X-Signature": xSignatureVal,
            //   },
            //   data: {
            //     timeStamp: timeStampVal,
            //     locationId: paymentData.locationId,
            //     transactionId: paymentData.transactionId,
            //     orderId: paymentData.orderId,
            //   },
            // })
            //   .then((transactionDetailsRes: any) => {
            //     console.log("accesstoken check", val);
            //     console.log("transaction details", transactionDetailsRes.data);
            //     // var transResul=transactionDetailsRes.data;
            //     // var xSignatureVal = sha256(
            //     //   timeStampVal + window?.env?.DB_SECRET_KEY
            //     // );
            //     // console.log('xsignature value', xSignatureVal);
            //     // console.log("token url", window.env.DB_TOKEN);
            //     // console.log('time stamp value', timeStampVal);
            //     // console.log('request structure', { action: 'get', mode: 'live', timeStamp: timeStampVal, locationId: payloadValue?.activeLocation });

            //     //api call to get the access token from firebase
            //   // {axios({
            //   //   method: "post",
            //   //   url: window.env.DB_TOKEN,
            //   //   headers: {
            //   //     "X-Signature": xSignatureVal,
            //   //   },
            //   //   data: {
            //   //     mode: "live",
            //   //     action: "get",
            //   //     timeStamp: timeStampVal,
            //   //     locationId: transactionDetailsRes.data.statusdesc.altId,
            //   //   },
            //   // })
            //   //   .then((accessTokenRes) => {
            //   //     //console.log("token detils", transactionDetailsRes.data);
            //   //     if (accessTokenRes.data.statuscode == "0") {
            //   //       console.log("token detials inside statuscode check", accessTokenRes.data);

            //   //       console.log(
            //   //         "accestoken from db",
            //   //         accessTokenRes.data.statusdesc.accessToken
            //   //       );
            //   //       console.log(
            //   //         "order id from db",
            //   //         transactionDetailsRes.data.statusdesc._id
            //   //       );
            //   //       // axios({
            //   //       //   method: "post",
            //   //       //   url: `https://services.leadconnectorhq.com/payments/orders/${transactionDetailsRes.data.statusdesc._id}`,
            //   //       //   headers: {
            //   //       //     "Content-Type": "application/json",
            //   //       //     Accept: "application/json",
            //   //       //     Authorization: `Bearer ${accessTokenRes.data.statusdesc.access_token}`,
            //   //       //     Version: "2021-07-28",
            //   //       //   },
            //   //       // })
            //   //       //   .then((orderRes) => {
            //   //       //     console.log("order response", orderRes.data);
            //   //       //   })
            //   //       //   .catch((err) => {
            //   //       //     console.error("order details error", err);
            //   //       //   });
            //   //     }
            //   //   })
            //   //   .catch((err) => {
            //   //     console.error(err);
            //   //   });}

            //   })
            //   .catch((err) => {
            //     console.error("error format : ", err);
            //   });
          };

          //calling latpay checkout part with the required details
          window.LatpayCheckout.open({
            merchantuserid: paymentData.publishableKey.split("###")[0],
            publickey: paymentData.publishableKey.split("###")[1],
            currency: paymentData.currency.toUpperCase(), // make uppercase
            amount: paymentData.amount,
            reference: paymentData.transactionId, // add trans id
            description: paymentData.transactionId, // add trans id

            status: () => {
              // console.log("status", status);
              setInitialLoader(false);
            },
          });
        });
      });
    }
  }, [paymentData]);

  const handleCheckout = () => {
    // console.log("payment data values - ", paymentData);
    setButtonLoader(true);

    if (
      !window.LatpayCheckout ||
      typeof window.LatpayCheckout.secure3DPayment !== "function"
    ) {
      console.error("LatpayCheckout is not available.");
      return;
    }

    //console.log("trans key generated : ", transKey);

    window.LatpayCheckout.secure3DPayment({
      amount: paymentData.amount,
      currency: paymentData.currency.toUpperCase(),
      reference: paymentData.transactionId,
      description: paymentData.transactionId,
      firstname: paymentData.contact.name.split(" ")[0],
      lastname: paymentData.contact.name.split(" ")[1],
      email: paymentData.contact.email,
      datakey: paymentData.publishableKey.split("###")[2],
      transkey: transKey,
      is3dcheck: "Y",
    });
  };

  return (
    <div>
      {paymentData ? (
        processingLoader ? (
          <div className="flex justify-center items-center">
            <div className="w-8 h-8 mb-3 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          <div>
            {initialLoader ? (
              <div className="flex justify-center items-center">
                <div className="w-8 h-8 mb-3 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
              </div>
            ) : (
              ""
            )}
            <div id="latpay-element" />
            <button
              type="button"
              onClick={handleCheckout}
              disabled={buttonLoader}
              className={`relative inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 rounded text-sm font-semibold transition-all duration-150 ease-in-out bg-gradient-to-r from-green-500 to-green-600 text-white  hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg ${
                buttonLoader ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <span className={buttonLoader ? "opacity-70 pl-4" : ""}>
                {buttonLoader ? "Processing..." : "Checkout"}
              </span>
            </button>
          </div>
        )
      ) : (
        <p>Waiting for payment initiation...</p>
      )}
    </div>
  );
};

export default CreatePayment;
