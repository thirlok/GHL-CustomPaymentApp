import { useEffect, useState } from "react";
import loadjQuery2 from "./HPS3/Loadjquery";
import loadLatpayJS2 from "./HPS3/Hps3function";
import sha256 from "sha256";

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
      if (
        event.origin.includes("gohighlevel.com") ||
        event.origin.includes("leadconnectorhq.com") ||
        event.origin.includes("lpstest.co.uk") ||
        event.origin.includes("ghlatpay.web.app") // Include your domain
      ) {
        // Parse event data
        let data: openfunctiondata;
        try {
          data =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
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
          //console.log("Received valid payment data:", data);
          setPaymentData(data.data || data); // Handle nested data
        } else {
          console.warn(
            "Unexpected message type or data:",
            data?.type || "No type"
          );
        }
      } else {
        console.error("Invalid origin:", event.origin);
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
            //console.log("Payment completed:", val);
           // console.log("publishable key", paymentData.publishableKey);
            // console.log(
            //   "publish key : ",
            //   `${paymentData.publishableKey.split("###")[0]}###${
            //     paymentData.publishableKey.split("###")[1]
            //   }###${paymentData.publishableKey.split("###")[2]}###${
            //     paymentData.amount
            //   }###${paymentData.currency.toUpperCase()}###${
            //     paymentData.transactionId
            //   }`
            //);
            setButtonLoader(false);

            if (val.errorcode == "00") {
              //console.log("in");
              //transaction success call
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

              //pass ghl success message
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
