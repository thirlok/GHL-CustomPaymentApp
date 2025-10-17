import { useEffect, useState } from "react";
import loadjQuery2 from "./HPS3/Loadjquery";
import loadLatpayJS2 from "./HPS3/Hps3function";
import sha256 from "sha256";

const Latpaypage = () => {
  const [config, setConfig] = useState<any>(null);
  const [loader, setLoader] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  
  useEffect(() => {
    // 1. Notify parent when iframe is ready
    window.parent.postMessage(
      { type: "custom_provider_ready", loaded: true },
      "*"
    );

    // 2. Listen for messages from parent
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "custom_provider_init") {
        console.log("Child received config from parent:", event.data.config);
        setConfig(event.data.config);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const [TransKey, setTransKey] = useState("");
  useEffect(() => {
    if (config) {
      console.log(config);
      const inputString = `${config.currency}${config.amount}${
        config.transactionId
      }Y${config.publishableKey.split("###")[1]}`;
      console.log("transkey generation", inputString);
      const hash = sha256(inputString);

      setTransKey(hash);

      loadjQuery2(() => {
        loadLatpayJS2(() => {
          console.log("loading");
          // Clear previous Latpay content
          const $ = (window as any).$;
          $("#latpay-element").empty();

          //function returns processing status to set load true
          window.onPaymentAction = (data: any) => {
            console.log(data);
            if (
              data?.status?.statusdesc == "Card payment processing..." &&
              data?.status?.responsetype == "0"
            ) {
              setLoader(true);
            }

            if (
              data?.status?.statusdesc == "Googlepay payment processing..." &&
              data?.status?.responsetype == "1"
            ) {
              setLoader(true);
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
            console.log("Payment completed:", val);
            setButtonLoader(false);
            if (val.errorcode == "00") {
              const payload = {
                type: "custom_element_success_response",
                chargeId: `${config.publishableKey.split("###")[0]}###${
                  config.amount
                }###${config.currency}###${config.transactionId}`, //
                //configUsed: config,
              };

              window.parent.postMessage(
                { type: "Latpay-response", payload },
                "*"
              );
            } else {
              const payload = {
                type: "custom_element_error_response",
                error: {
                  description: "String", // Error message to be shown to the user
                },
              };

              window.parent.postMessage({ type: payload }, "*");
            }
            // here we are calling handlepayment function to do authstatus check
            //handlePaymentCompleted();
          };

          console.log(
            "test",
            config.publishableKey.split("###")[0],
            config.publishableKey.split("###")[1]
          );
          // Prepare data from formValues array
          const mappedValues = {
            Merchant_User_Id: config.publishableKey.split("###")[0],
            PublicKey: config.publishableKey.split("###")[1],
            Currency: config.currency,
            Amount: config.amount,
            Reference: config.transactionId,
          };

          // open function to load payment form
          window.LatpayCheckout.open({
            merchantuserid: mappedValues.Merchant_User_Id,
            publickey: mappedValues.PublicKey,
            currency: mappedValues.Currency,
            amount: mappedValues.Amount,
            reference: mappedValues.Reference,

            status: (status: any) => {
              console.log("status", status);
            },
          });

          // Optional: enable logs
          // window.LatpayCheckout.logenable("true");
        });
      });
    }
  }, [config]);

  const handleCheckout = () => {
    setButtonLoader(true);

    setTimeout(() => {
      window.LatpayCheckout.secure3DPayment({
        amount: config.amount,
        currency: config.currency,
        reference: config.transactionId,
        description: config.transactionId,
        firstname: "NA",
        lastname: "NA",
        email: "fromGHL@latpay.com",
        transkey: TransKey,
        is3dcheck: "Y",
      });
    }, 0);
  };
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h2>Latpay Payment Page</h2>
      {loader ? (
        <div className="bg-gray-200  rounded-md p-6 sm:p-8 relative shadow-sm text-sm mb-6 flex justify-center items-center min-h-[120px]">
          <div className="flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
          </div>
        </div>
      ) : (
        <div>
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
      )}
    </div>
  );
};

export default Latpaypage;
