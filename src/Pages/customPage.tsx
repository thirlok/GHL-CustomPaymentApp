import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import sha256 from "sha256";
import { getUtcDate } from "../Components/UtcDate";
import { useLocation } from "react-router-dom";

interface LatpayFormInputs {
  merchant_id: string;
  public_key: string;
  data_key: string;
}

const CustomPage = () => {
  const location = useLocation();
  const ghlData = location.state?.configCallCredential;
  console.log('this is donfig call credential',ghlData)

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

  useEffect(() => {
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
       console.log("token detils", res.data);
        if (res.data.statuscode == "0") {
          setTokenCredential((prev) => ({
            ...prev,
            accessToken: res.data.statusdesc.accessToken,
            refreshToken: res.data.statusdesc.refreshToken,
          }));
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };
  useEffect(() => {
    if (tokenCredential?.accessToken !== "") {
      createPaymentConfig();
    }
  }, [tokenCredential]);

  const createPaymentConfig = () => {
    let data = {
      name: "Latpay Integration",
      description:
        "This payment gateway supports payments in UK and AU via cards and wallets.",
      paymentsUrl: "https://ghlatpay.web.app/createpayment",
      queryUrl:
        "https://us-central1-cert-dev-f6b62.cloudfunctions.net/ghl_queryPayment",
      imageUrl:
        "https://latpay.com/wp-content/uploads/2017/11/lat-pay-logo-300x135.png",
      supportsSubscriptionSchedule: true,
    };
    axios({
      method: "post",
      url: "https://services.leadconnectorhq.com/payments/custom-provider/provider",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoQ2xhc3MiOiJMb2NhdGlvbiIsImF1dGhDbGFzc0lkIjoieXoyWWZYTDM3ekRwMTJlUldhNEQiLCJzb3VyY2UiOiJJTlRFR1JBVElPTiIsInNvdXJjZUlkIjoiNjhiODBkNjQ1OTRmNTQzMzY2YzUyNGFjLW1mNTQxM3NyIiwiY2hhbm5lbCI6Ik9BVVRIIiwicHJpbWFyeUF1dGhDbGFzc0lkIjoieXoyWWZYTDM3ekRwMTJlUldhNEQiLCJvYXV0aE1ldGEiOnsic2NvcGVzIjpbInBheW1lbnRzL29yZGVycy5yZWFkb25seSIsInBheW1lbnRzL29yZGVycy53cml0ZSIsInBheW1lbnRzL3N1YnNjcmlwdGlvbnMucmVhZG9ubHkiLCJwYXltZW50cy90cmFuc2FjdGlvbnMucmVhZG9ubHkiLCJwYXltZW50cy9jdXN0b20tcHJvdmlkZXIucmVhZG9ubHkiLCJwYXltZW50cy9jdXN0b20tcHJvdmlkZXIud3JpdGUiLCJwcm9kdWN0cy5yZWFkb25seSIsInByb2R1Y3RzL3ByaWNlcy5yZWFkb25seSJdLCJjbGllbnQiOiI2OGI4MGQ2NDU5NGY1NDMzNjZjNTI0YWMiLCJ2ZXJzaW9uSWQiOiI2OGI4MGQ2NDU5NGY1NDMzNjZjNTI0YWMiLCJjbGllbnRLZXkiOiI2OGI4MGQ2NDU5NGY1NDMzNjZjNTI0YWMtbWY1NDEzc3IifSwiaWF0IjoxNzYwNjA1MTc3Ljc2NiwiZXhwIjoxNzYwNjkxNTc3Ljc2Nn0.c5hD4qB3HyXjvCF2fuIBoS8aovE01OZQow0dh25XrSA-nCdQpcXMc44pAyI-vhM-Tg48WhXlh95arbD7g4_OYPRnz_EPN8nrMPj_Va0opiatJVZU8SNsWhbeIP9lHzkiMbQ9qSQ6CpV-x-P9zYXC7ccXll2vVAomZJ5itTofJHaicEA2P_-WT_GWWlMM4iNvB06UVrOH0JIEdIgUTcc57bhvXoGbxgewpKsuz533qY1n3xK9yTy-eil8_6eOrIhSEm50cTbdPDBirMi2wmgnfPToGpJcARhsS0gO8ARyQxlwP8caFayYGeS8bD4Kea1nuDm6i5YCjJeIFekCV6LlZeOwqnvjq7u4tFOKygZcCD6zSxIFTz02uHjAxxQ9lHqq0XJ3l0yxZwgEjKLhGykYOIOp1bkCVzBmXvDaLwmU1JnGNSEtDTYhS1ViExLsTQgZYb66IASD5bJoDV2cAHR0ckM062AO6_hKmp3HEzdSrU_uKaniIFLKVRseHIFCCgYChL9quBVxyaV3QWhm0oZSl0gZJpuxclaq5NdeVd4CZfErxW5ZTz_6yDUU6yREKb0iuwXBFZ9TE3Hm_be8pA-YiQs9ana1qRiAwfw9gZxccJg5HgCKBgU20LqBt2q7XfM0AwDunZ7OPY-7YjhtZOgWUrfrWJg-NIZ42OErDB1hi-k`,
        Version: "2021-07-28",
      },

      data: data,
      params: { locationId: "yz2YfXL37zDp12eRWa4D" },
    })
      .then((res) => {
        console.log("payment provider created", res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

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
      params: { locationId: "yz2YfXL37zDp12eRWa4D" },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoQ2xhc3MiOiJMb2NhdGlvbiIsImF1dGhDbGFzc0lkIjoieXoyWWZYTDM3ekRwMTJlUldhNEQiLCJzb3VyY2UiOiJJTlRFR1JBVElPTiIsInNvdXJjZUlkIjoiNjhiODBkNjQ1OTRmNTQzMzY2YzUyNGFjLW1mNTQxM3NyIiwiY2hhbm5lbCI6Ik9BVVRIIiwicHJpbWFyeUF1dGhDbGFzc0lkIjoieXoyWWZYTDM3ekRwMTJlUldhNEQiLCJvYXV0aE1ldGEiOnsic2NvcGVzIjpbInBheW1lbnRzL29yZGVycy5yZWFkb25seSIsInBheW1lbnRzL29yZGVycy53cml0ZSIsInBheW1lbnRzL3N1YnNjcmlwdGlvbnMucmVhZG9ubHkiLCJwYXltZW50cy90cmFuc2FjdGlvbnMucmVhZG9ubHkiLCJwYXltZW50cy9jdXN0b20tcHJvdmlkZXIucmVhZG9ubHkiLCJwYXltZW50cy9jdXN0b20tcHJvdmlkZXIud3JpdGUiLCJwcm9kdWN0cy5yZWFkb25seSIsInByb2R1Y3RzL3ByaWNlcy5yZWFkb25seSJdLCJjbGllbnQiOiI2OGI4MGQ2NDU5NGY1NDMzNjZjNTI0YWMiLCJ2ZXJzaW9uSWQiOiI2OGI4MGQ2NDU5NGY1NDMzNjZjNTI0YWMiLCJjbGllbnRLZXkiOiI2OGI4MGQ2NDU5NGY1NDMzNjZjNTI0YWMtbWY1NDEzc3IifSwiaWF0IjoxNzYwNjA1MTc3Ljc2NiwiZXhwIjoxNzYwNjkxNTc3Ljc2Nn0.c5hD4qB3HyXjvCF2fuIBoS8aovE01OZQow0dh25XrSA-nCdQpcXMc44pAyI-vhM-Tg48WhXlh95arbD7g4_OYPRnz_EPN8nrMPj_Va0opiatJVZU8SNsWhbeIP9lHzkiMbQ9qSQ6CpV-x-P9zYXC7ccXll2vVAomZJ5itTofJHaicEA2P_-WT_GWWlMM4iNvB06UVrOH0JIEdIgUTcc57bhvXoGbxgewpKsuz533qY1n3xK9yTy-eil8_6eOrIhSEm50cTbdPDBirMi2wmgnfPToGpJcARhsS0gO8ARyQxlwP8caFayYGeS8bD4Kea1nuDm6i5YCjJeIFekCV6LlZeOwqnvjq7u4tFOKygZcCD6zSxIFTz02uHjAxxQ9lHqq0XJ3l0yxZwgEjKLhGykYOIOp1bkCVzBmXvDaLwmU1JnGNSEtDTYhS1ViExLsTQgZYb66IASD5bJoDV2cAHR0ckM062AO6_hKmp3HEzdSrU_uKaniIFLKVRseHIFCCgYChL9quBVxyaV3QWhm0oZSl0gZJpuxclaq5NdeVd4CZfErxW5ZTz_6yDUU6yREKb0iuwXBFZ9TE3Hm_be8pA-YiQs9ana1qRiAwfw9gZxccJg5HgCKBgU20LqBt2q7XfM0AwDunZ7OPY-7YjhtZOgWUrfrWJg-NIZ42OErDB1hi-k`,
        Version: "2021-07-28",
      },
      data: credentials,
    })
      .then((res) => {
        console.log('response after the payment configration',res.data);
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
