import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GhlPage = () => {
  const [showChild, setShowChild] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [latpayResponse, setLatpayResponse] = useState("");
  const [finalResponse, setFinalresponse] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();
  const payload = (location.state as any)?.success;

  useEffect(() => {
    if (payload) {
      setFinalresponse(true);
    }
  }, [payload]);

  // Listen for messages from child iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "Latpay-response") {
        const payload = event.data.payload;
        console.log("Parent received data from child:", payload);
        setLatpayResponse(payload);
        // Hide the child after receiving data
        setShowChild(false);
        var queryQrl = {
          type: "verify",
          transactionId: payload.chargeId.split("###")[3],
          apiKey: "test_DSS###test",
          chargeId: payload.chargeId,
          subscriptionId: "ghl_subscription_id",
        };

        if (
          payload?.type === "custom_element_success_response" &&
          payload?.chargeId
        ) {
          navigate("/querypage", { state: { queryQrl } });
        }
      }

      if (event.data?.type == "custom_provider_ready") {
        console.log("Child iframe is ready ✅");

        // Send JSON to child iframe
        const message = {
          type: "custom_provider_init",
          config: {
            type: "payment_initiate_props",
            publishableKey: "test_tbVT_3d###test###test", // merchantid/datakey/publickey
            amount: "0.01", // Amount in decimal currency with max 2 decimal places
            currency: "EUR", // Standard 3 letter notation for currencies ex. USD, INR
            mode: "String", // Payment mode: subscription/payment
            productDetails: { productId: "string", priceId: "string" }, // productId and priceId for recurring products. More details can be fetched using the public api for Products/Prices
            contact: {
              // Customer details for customer placing the order
              id: "String", // Customer id in GHL
              name: "String", // Full name of the customer
              email: "String",
              contact: "String", // Contact Number of customer with country code
            },
            orderId: "String", // GHL internal orderId for given order
            transactionId: "GHLtest", // GHL internal transactionId for the given transaction
            subscriptionId: "String", // GHL internal subscriptionId passed in case of a recurring product
            locationId: "String", // Sub-account id for which the given order is created.
          },
        };
        iframeRef.current?.contentWindow?.postMessage(message, "*");
        console.log("Parent sent init config to child:", message);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
      <div>
        <h1>GHL Page</h1>
        <button
          className="px-6 py-2 rounded shadow-md bg-blue-600
                        text-white font-semibold transition-all duration-300"
          onClick={() => {
            setShowChild(true);
            setLatpayResponse("");
          }}
        >
          Checkout
        </button>
        <p>{latpayResponse != "" ? JSON.stringify(latpayResponse) : ""}</p>
        {showChild && (
          <iframe
            ref={iframeRef}
            src="/latpaypage" // Child page served from public folder
            style={{
              width: "600px",
              height: "400px",
              border: "1px solid gray",
              marginTop: "20px",
            }}
            title="Child Iframe"
          />
        )}
        {finalResponse ? (
          <div className="mt-4 p-4 rounded-xl w-[40%] bg-green-100 border border-green-300 text-green-800 text-lg font-semibold shadow-md mx-auto">
            ✅ Payment Completed Successfully
          </div>
        ) : (
          ""
        )}
      </div>
  );
};

export default GhlPage;
