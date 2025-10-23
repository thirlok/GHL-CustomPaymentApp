import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import sha256 from "sha256";
import { getUtcDate } from "../Components/UtcDate";

interface LatpayFormInputs {
  merchant_id: string;
  public_key: string;
  data_key: string;
}

interface ghlPayload {
  locationId: string;
  accessToken: string;
}
const CustomPage = () => {
  const [tokenCredential, setTokenCredential] = useState({
    accessToken: "",
    refreshToken: "",
  });
  // Test form
  const {
    register: registerTest,
    handleSubmit: handleSubmitTest,
    formState: { errors: errorsTest },
  } = useForm<LatpayFormInputs>();

  // Live form
  // const {
  //   register: registerLive,
  //   handleSubmit: handleSubmitLive,
  //   formState: { errors: errorsLive },
  // } = useForm<LatpayFormInputs>();

  const[payloadValue,setPayloadValue]=useState('')
  console.log('payload value : ',payloadValue)
  useEffect(() => {
    const getUserData = async () => {
      try {
        const payload = await new Promise<ghlPayload>(() => {
          // Timeout if no response in 10s
          const timeoutId = setTimeout(() => {
            window.removeEventListener("message", handleMessage);
          }, 10000);

          // Handle messages from parent
          const handleMessage = (event: MessageEvent) => {
            const data =
              typeof event.data === "string"
                ? JSON.parse(event.data)
                : event.data;

            // Only process trusted origin messages (optional: adjust as needed)
            if (
              event.origin.includes("gohighlevel.com") ||
              event.origin.includes("leadconnectorhq.com") ||
              event.origin.includes("lpstest.co.uk") ||
              event.origin.includes("ghlatpay.web.app")
            ) {
              if (data?.message === "REQUEST_USER_DATA_RESPONSE") {
                clearTimeout(timeoutId);
                window.removeEventListener("message", handleMessage);
                console.log("✅ Received GHL user data:", data);


                axios({
                  method: "post",
                  url: "https://a23d4a8edb5f.ngrok-free.app/cert-dev-f6b62/us-central1/ghl_decryptSSO",
                  data: {
                    ssoPayload: data.payload,
                  },
                })
                  .then((res: any) => {
                    console.log("decrypted successfully", res.data);
                    setPayloadValue(res.data)
                  })
                  .catch((err) => {
                    console.error("error", err);
                  });
              }
            }
          };

          // Listen for messages
          window.addEventListener("message", handleMessage);

          // Send request to parent after 500ms
          setTimeout(() => {
            console.log("📨 Sending REQUEST_USER_DATA to parent");
            window.parent.postMessage({ message: "REQUEST_USER_DATA" }, "*");
          }, 500);
        });

        console.log("payload value", payload);
      } catch (err) {
        console.error(err);
      }
    };

    getUserData();
    getAccessToken();
  }, []);

  const getAccessToken = () => {
    var xSignatureVal = sha256(getUtcDate() + window?.env?.SECRETKEY);
    //console.log("token", window.env.SAVE_TOKEN);
    axios({
      method: "post",
      url: window.env.SAVE_TOKEN,
      headers: {
        "X-Signature": xSignatureVal,
      },
      data: {
        mode: "live",
        action: "get",
        timeStamp: getUtcDate(),
        accessToken: "",
        refreshToken: "",
      },
    })
      .then((res) => {
        // console.log("token detils", res.data);
        if (res.data.statuscode == "0") {
          setTokenCredential((prev) => ({
            ...prev,
            accessToken: res.data.statusdesc.accessToken,
            refreshToken: res.data.statusdesc.accessToken,
          }));
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };
  // useEffect(() => {
  //   if (tokenCredential?.accessToken !== "") {
  //     createPaymentConfig();
  //   }
  // }, [tokenCredential]);

  // const createPaymentConfig = () => {
  //   let data = {
  //     name: "Latpay Integration",
  //     description:
  //       "This payment gateway supports payments in UK and AU via cards and wallets.",
  //     paymentsUrl: "https://ghlatpay.web.app/createpayment",
  //     queryUrl:
  //       "https://us-central1-cert-dev-f6b62.cloudfunctions.net/ghl_queryPayment",
  //     imageUrl:
  //       "https://latpay.com/wp-content/uploads/2017/11/lat-pay-logo-300x135.png",
  //     supportsSubscriptionSchedule: true,
  //   };
  //   axios({
  //     method: "post",
  //     url: "https://services.leadconnectorhq.com/payments/custom-provider/provider",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Accept: "application/json",
  //       Authorization: `Bearer ${tokenCredential.accessToken}`,
  //       Version: "2021-07-28",
  //     },

  //     data: data,
  //     params: { locationId: "3NM82unan0ZeRq0Rd8eU" },
  //   })
  //     .then(() => {
  //       //console.log("payment provider created", res.data);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //     });
  // };

  const [showResult, setShowResult] = useState(false);
  //   test function submit
  const onSubmitTest = handleSubmitTest((data) => {
    // console.log("Test credentials submitted:", data);
    newConfigTestCredential(data);
  });

  //funtion  calling configration api
  const newConfigTestCredential = (data: any) => {
    let credentials = {
      test: {
        apiKey: data.merchant_id + "###" + data.data_key,
        publishableKey:
          data.merchant_id + "###" + data.public_key + "###" + data.data_key,
      },
    };
    //console.log(credentials);

    axios({
      method: "post",
      url: "https://services.leadconnectorhq.com/payments/custom-provider/connect",
      params: { locationId: "3NM82unan0ZeRq0Rd8eU" },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${tokenCredential.accessToken}`,
        Version: "2021-07-28",
      },
      data: credentials,
    })
      .then((res) => {
        //console.log(res.data);
        if (res.data !== "") {
          setShowResult(true);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  //live funtion submit
  // const onSubmitLive = handleSubmitLive((data) => {
  //   console.log("Live credentials submitted:", data);
  //   newConfigLiveCredential(data);
  // });

  //function callingconfiguration api
  // const newConfigLiveCredential = (data: any) => {
  //   let credentials = {
  //     live: {
  //       apiKey: data.merchant_id + "###" + data.data_key,
  //       publishableKey: data.merchant_id + "###" + data.public_key+"###"+data.data_key,
  //     },

  //   };
  //   console.log(credentials);

  //   axios({
  //     method: "post",
  //     url: "https://services.leadconnectorhq.com/payments/custom-provider/connect",
  //     params: { locationId: "3NM82unan0ZeRq0Rd8eU" },
  //     headers: {
  //       "Content-Type": "application/json",
  //       Accept: "application/json",
  //       Authorization: `Bearer ${tokenCredential.accessToken}`,
  //       Version: "2021-07-28",
  //     },

  //     data: credentials,
  //   })
  //     .then((res) => {
  //       console.log(res.data);
  //       fetchPaymentConfig();
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //     });
  // };

  // function to fetch the payment fonfigration
  // const fetchPaymentConfig = () => {
  //   axios({
  //     method: "post",
  //     url: "https://services.leadconnectorhq.com/payments/custom-provider/connect",
  //     params: { locationId: "3NM82unan0ZeRq0Rd8eU" },
  //     headers: {
  //       Accept: "application/json",
  //       Authorization: `Bearer ${tokenCredential.accessToken}`,
  //       Version: "2021-07-28",
  //     },
  //   })
  //     .then((res) => {
  //       console.log("Payment configuration Data : ", res.data);
  //     })
  //     .catch((err) => {
  //       console.error("error response : ", err);
  //     });
  // };

  return (
    <div className="text-left p-3">
      {showResult ? (
        <div className="flex flex-col items-center justify-center text-center py-10 px-6">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-md w-full max-w-md">
            <h2 className="text-2xl font-semibold text-green-700 mb-2">
              Configuration Updated
            </h2>
            <p className="text-sm">
              Your test credentials have been successfully saved.
            </p>
          </div>
        </div>
      ) : (
        <div>
          {" "}
          {/* Heading */}
          <div className="border-b border-gray-300 pb-3 mb-1">
            <p className="text-2xl font-bold">Latpay Configuration</p>
            <p className="text-sm">
              please update the test credentials below to use the payment
              gateway
            </p>
          </div>
          <div className="px-4 sm:px-6 lg:px-10 py-8">
            {/* Test Credentials*/}
            <div className="flex flex-row gap-10 border-b border-gray-200 pb-6 mb-6">
              {/* label */}
              <div className="w-1/3">
                <p className="font-semibold text-gray-500">Test Credentials</p>
                <p className="text-sm">Update test credentials here</p>
              </div>
              {/* form */}
              <div className="w-2/3">
                <form onSubmit={onSubmitTest} className="flex flex-col gap-4">
                  {/* Merchant ID */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Merchant ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...registerTest("merchant_id", {
                        required: "Merchant ID is required",
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errorsTest.merchant_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {errorsTest.merchant_id.message}
                      </p>
                    )}
                  </div>

                  {/* Public Key */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Public Key <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      {...registerTest("public_key", {
                        required: "Secret Key is required",
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errorsTest.public_key && (
                      <p className="text-red-500 text-sm mt-1">
                        {errorsTest.public_key.message}
                      </p>
                    )}
                  </div>

                  {/* Data Key */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Data Key <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      {...registerTest("data_key", {
                        required: "Data Key is required",
                      })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errorsTest.data_key && (
                      <p className="text-red-500 text-sm mt-1">
                        {errorsTest.data_key.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="flex justify-center mt-3 ">
                    <button
                      type="submit"
                      className="w-auto bg-blue-600 text-white py-2 px-6 rounded-2xl hover:bg-blue-700 transition"
                      style={{ borderRadius: "12px" }}
                    >
                      Connect
                    </button>
                  </div>
                </form>
              </div>

              {/* empty */}
              <div className="w-3/3"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomPage;

{
  /* Live Credentials */
}
// <div className="flex flex-row gap-10">
//   {/* label */}
//   <div className="w-1/3">
//     <p className="font-semibold text-gray-500">Live Credentials</p>
//     <p className="text-sm">Update live credentials here</p>
//   </div>
//   {/* form */}
//   <div className="w-2/3">
//     <form onSubmit={onSubmitLive} className="flex flex-col gap-4">
//       {/* Merchant ID */}
//       <div>
//         <label className="block text-sm font-medium mb-1">
//           Merchant ID <span className="text-red-500">*</span>
//         </label>
//         <input
//           type="text"
//           {...registerLive("merchant_id", {
//             required: "Merchant ID is required",
//           })}
//           className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         {errorsLive.merchant_id && (
//           <p className="text-red-500 text-sm mt-1">
//             {errorsLive.merchant_id.message}
//           </p>
//         )}
//       </div>

//       {/* Public Key */}
//       <div>
//         <label className="block text-sm font-medium mb-1">
//           Public Key <span className="text-red-500">*</span>
//         </label>
//         <input
//           type="password"
//           {...registerLive("public_key", {
//             required: "Public Key is required",
//           })}
//           className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         {errorsLive.public_key && (
//           <p className="text-red-500 text-sm mt-1">
//             {errorsLive.public_key.message}
//           </p>
//         )}
//       </div>

//       {/* Data Key */}
//       <div>
//         <label className="block text-sm font-medium mb-1">
//           Data Key <span className="text-red-500">*</span>
//         </label>
//         <input
//           type="password"
//           {...registerLive("data_key", {
//             required: "Data Key is required",
//           })}
//           className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         {errorsLive.data_key && (
//           <p className="text-red-500 text-sm mt-1">
//             {errorsLive.data_key.message}
//           </p>
//         )}
//       </div>

//       {/* Submit */}
//       <div className="flex justify-center mt-3">
//         <button
//           type="submit"
//           className="w-auto bg-blue-600 text-white py-2 px-6 rounded-2xl hover:bg-blue-700 transition"
//           style={{ borderRadius: "12px" }}
//         >
//           Connect
//         </button>
//       </div>
//     </form>
//   </div>
//   {/* empty */}
//   <div className="w-3/3"></div>
// </div>
