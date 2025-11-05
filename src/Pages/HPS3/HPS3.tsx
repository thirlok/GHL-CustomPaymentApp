import { useEffect, useState } from "react";
import loadjQuery2 from "./Loadjquery";
import loadLatpayJS2 from "./Hps3function";
import "../HPS3/customcss.css";
import sha256 from "sha256";
//@ts-ignore
//import { CircularProgress } from "@mui/material";

//type for function
declare global {
  interface Window {
    //@ts-ignore
    LatpayCheckout: any;
    onPaymentAction?: (data: any) => void;
  }
}

type StatusType = {
  responsetype: string;
  statuscode: string;
  originalcode: string;
  errorcode: string;
  errordesc: string;
};

type FinalDataType = {
  merchantid: string;
  cardexpiry: string;
  responsekey: string;
  reference: string;
  amount: string;
  currency: string;
  banktransaction_no: string;
  bankauth_no: string;
  transactiondate: string;
  transid: string;
  statuscheckid: string;
  cardbin: string;
  cardlast4: string;
  bankcode: string;
  bankmsg: string;
  cardtoken: string;
  customeremail: string;
  cardtype: string;
  paymenttype: string;
  status: StatusType;
};

const HPS3 = () => {
  const [testLoader, setTestLoader] = useState(false);
  const [selected, setSelected] = useState("");
  const options = ["Select", "HPS3"];
  

  //state to show check payby latpay
  const [paybyLatpay, setpaybyLatpay] = useState(false);

  //state to show and hide showcard form
  const [showCardForm, setshowCardForm] = useState(false);

  // formvalues state
  const [formValues, setFormValues] = useState([
    //normal transaction
    { label: "Merchant User Id", value: "test_tbVT_3d" },
    { label: "PublicKey", value: "test" },
    { label: "DataKey", value: "test" },

    {
      label: "TransKey",
      value: "",
    },

    {
      label: "AuthStatusCheck",
      value: "53fbf38df3862b1914adce78aa738ca8a22e8fbadb9e530ce192752b95c38eb3",
    },

    { label: "Amount", value: "0.01" },
    { label: "Surcharge", value: "0.00" },
    { label: "Currency", value: "EUR" },
    { label: "Description", value: "lpstest123" },
    { label: "Reference", value: "lpstest123" },
    { label: "Email", value: "hps@lpsmail.com" },
    { label: "Firstname", value: "NA" },
    { label: "Lastname", value: "NA" },
  ]);

  // trans key Generation
  useEffect(() => {
    const getValue = (label: string) =>
      formValues.find((item) => item.label === label)?.value || "";

    const currency = getValue("Currency");
    const amount = getValue("Amount");
    const reference = getValue("Reference");
    const threedCheck = "Y";
    const dataKey = getValue("DataKey");

    const inputString = `${currency}${amount}${reference}${threedCheck}${dataKey}`;

    const hash = inputString;

    // Only update if TransKey is different
    setFormValues((prevValues) =>
      prevValues.map((item) =>
        item.label === "TransKey" && item.value !== hash
          ? { ...item, value: hash }
          : item
      )
    );
  }, [
    formValues.find((item) => item.label === "Currency")?.value,
    formValues.find((item) => item.label === "Amount")?.value,
    formValues.find((item) => item.label === "Reference")?.value,
    formValues.find((item) => item.label === "DataKey")?.value,
  ]);


   // trans key Generation
  useEffect(() => {
    const getValue = (label: string) =>
      formValues.find((item) => item.label === label)?.value || "";

    const currency = getValue("Currency");
    const amount = getValue("Amount");
    const reference = getValue("Reference");
    const threedCheck = "Y";
    const dataKey = getValue("DataKey");

    const inputString = `${currency}${amount}${reference}${threedCheck}${dataKey}`;

    const hash = sha256(inputString);

    // Only update if TransKey is different
    setFormValues((prevValues) =>
      prevValues.map((item) =>
        item.label === "TransKey" && item.value !== hash
          ? { ...item, value: hash }
          : item
      )
    );
  }, [
    formValues.find((item) => item.label === "Currency")?.value,
    formValues.find((item) => item.label === "Amount")?.value,
    formValues.find((item) => item.label === "Reference")?.value,
    formValues.find((item) => item.label === "DataKey")?.value,
  ]);

  //authstatus check generation
  useEffect(() => {
    const getValue = (label: string) =>
      formValues.find((item) => item.label === label)?.value || "";

    const currency = getValue("Currency");
    const amount = getValue("Amount");
    const reference = getValue("Reference");
    const dataKey = getValue("DataKey");

    const inputString = `${currency}${amount}${reference}${dataKey}`;

    const hash = sha256(inputString);

    // Only update if TransKey is different
    setFormValues((prevValues) =>
      prevValues.map((item) =>
        item.label === "AuthStatusCheck" && item.value !== hash
          ? { ...item, value: hash }
          : item
      )
    );
  }, [
    formValues.find((item) => item.label === "Currency")?.value,
    formValues.find((item) => item.label === "Amount")?.value,
    formValues.find((item) => item.label === "Reference")?.value,
    formValues.find((item) => item.label === "DataKey")?.value,
  ]);

  //function to update the form values
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: string
  ) => {
    const value = e.target.value;

    // Optional validation
    if (index === "Amount" && !/^\d*\.?\d*$/.test(value)) return;
    if (index === "Surcharge" && !/^\d*\.?\d*$/.test(value)) return;
    if (index === "Currency" && !/^[a-zA-Z]*$/.test(value)) return;

    const updated = formValues.map((field) =>
      field.label === index ? { ...field, value: e.target.value } : field
    );
    setFormValues(updated);
  };

  //state to manage loader
  const [loader, setLoader] = useState(false);

  //useeffect to change  show card state
  useEffect(() => {
    setshowCardForm(paybyLatpay ? !showCardForm : false);
  }, [paybyLatpay]);

  const [openFuntionResult, setOpenFuntionResult] = useState("");
  //useffect to call latoay open function
  useEffect(() => {
    if (!showCardForm) return;

    loadjQuery2(() => {
      loadLatpayJS2(() => {
        //console.log("loading");
        // Clear previous Latpay content
        const $ = (window as any).$;
        $("#latpay-element").empty();

        //function returns processing status to set load true
        window.onPaymentAction = (data: any) => {
          //console.log(data);
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
        window.LatpayCheckout.OnPaymentCompleted = () => {
          //console.log("Payment completed:", val);

          // here we are calling handlepayment function to do authstatus check
          handlePaymentCompleted();
        };

        // Prepare data from formValues array
        const mappedValues = Object.fromEntries(
          formValues.map((field) => [
            field.label.replace(/\s/g, "_"),
            field.value,
          ])
        );

        // open function to load payment form
        window.LatpayCheckout.open({
          merchantuserid: mappedValues.Merchant_User_Id,
          publickey: mappedValues.PublicKey,
          currency: mappedValues.Currency,
          amount: mappedValues.Amount,
          reference: mappedValues.Reference,
          description: mappedValues.Description,

          status: (status: any) => {
            //console.log("status", status);
            setOpenFuntionResult(status);
            setTestLoader(false);
          },
        });

        // Optional: enable logs
        // window.LatpayCheckout.logenable("true");
      });
    });
  }, [showCardForm, formValues]);

  // function not in use
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // const formattedData = formValues.reduce((acc, field) => {
    //   acc[field.label] = field.value;
    //   return acc;
    // }, {} as Record<string, string>);
    //console.log("Submitted Data:", formattedData);
  };

  const [buttonLoader, setButtonLoader] = useState(false);
  // console.log(buttonLoader);
  //function to call 3d secure payment
  const handleCheckout = () => {
    setButtonLoader(true);
    // Delay the secure3DPayment call until after loader renders
    setTimeout(() => {
      const formData = formValues.reduce((acc, field) => {
        acc[field.label.replace(/\s/g, "")] = field.value;
        return acc;
      }, {} as Record<string, string>);

      if (
        !window.LatpayCheckout ||
        typeof window.LatpayCheckout.secure3DPayment !== "function"
      ) {
        console.error("LatpayCheckout is not available.");
        return;
      }

      //console.log("formdata", formData.TransKey);

      window.LatpayCheckout.secure3DPayment({
        amount: formData.Amount,
        currency: formData.Currency,
        reference: formData.Reference,
        description: formData.Description,
        firstname: formData.Firstname,
        lastname: formData.Lastname,
        email: formData.Email,
        datakey: formData.DataKey,
        transkey: formData.TransKey,
        is3dcheck: "Y",
      });
    }, 0); // wait until next render cycle
  };

  const [finalData, setFinalData] = useState<FinalDataType | null>(null);
  const [resultContainer, setResultContainer] = useState(false);

  //fucntion to do auth status check
  const handlePaymentCompleted = () => {
    // Convert formValues array to object for easy access
    const formData = formValues.reduce((acc, field) => {
      acc[field.label.replace(/\s/g, "_")] = field.value;
      return acc;
    }, {} as Record<string, string>);

    //requeset for authstatus check
    const authRequest = {
      merchantid: formData.Merchant_User_Id,
      amount: formData.Amount,
      currency: formData.Currency,
      reference: formData.Reference,
      transactionkey: formData.AuthStatusCheck,
    };

    // console.log("Auth Request Payload:", authRequest);
    // console.log("auth url", window.env.AUTH_CHECK_URL);
    fetch(window.env.AUTH_CHECK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(authRequest),
    })
      .then((response) => response.json())
      .then((data) => {
       // console.log(data);
        setFinalData(data);
        setLoader(false);
        setResultContainer(true);
        setshowCardForm(false);
        setButtonLoader(false);
      })
      .catch((err) => {
        console.error("Error in Auth Status Check:", err);
      });
  };

  const [finalDataResult, setFinalDataResult] = useState("");

  // useffect to handle 3dcheckout result error
  useEffect(() => {
    if (!finalData?.status) return;

    const { statuscode, errorcode } = finalData.status;

    //this has different status code compate to below status code
    if (statuscode === "0" && errorcode === "00") {
      setFinalDataResult("success");
      return;
    }

    // these three errorcode has same status code
    const errorMap: Record<string, string> = {
      "1022": "Transkey invalid", // get this while changing data in worng order while generating trans key
      "05": "Card rejected",
      "9001": "Prescreen Error",
    };

    if (statuscode === "1" && errorMap[errorcode]) {
      setFinalDataResult(errorMap[errorcode]);
    }
    if (statuscode === "1") {
      setFinalDataResult("Rejected");
    }
  }, [finalData]);

  //console.log(formValues);
  // console.log(finalData);

  const resetAll = () => {
    setSelected("");
    setpaybyLatpay(false);
    setFinalDataResult("");
    setResultContainer(false);
    setFinalData(null);
  };
  //console.log("testVar", localStorage.getItem("username"));
  return (
    <div className="flex flex-col md:flex-row gap-4 px-2 sm:px-4 md:px-6 lg:px-8 py-4">
      {/* slect option*/}
      <div className="w-full h-[30%] max-w-full md:max-w-[20%] bg-white p-4 md:p-6 rounded-lg shadow-md">
        <select
          id="dropdown"
          className="w-full  px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {options.map((val, index) => (
            <option key={index} value={val}>
              {val}
            </option>
          ))}
        </select>

        {/* check box to toggle form */}
        <div className="mt-4 flex items-center gap-2">
          {selected === "HPS3" ? (
            <>
              {" "}
              <input
                id="checkbox"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                onChange={(e) => {
                  setpaybyLatpay(e.target.checked);
                  setTestLoader(true);
                }}
              />
              <label htmlFor="checkbox" className="text-sm text-gray-700">
                Pay By Latpay
              </label>
            </>
          ) : (
            ""
          )}
        </div>
      </div>

      <div className="sm-w-full px-2 sm:px-4 md:px-8 overflow-x-auto text-left">
        {/* Main Form (80%) */}
        {selected === "HPS3" && !resultContainer ? (
          showCardForm ? (
            <div>
              {loader ? (
                <div className="bg-gray-200  rounded-md p-6 sm:p-8 relative shadow-sm text-sm mb-6 flex justify-center items-center min-h-[120px]">
                  <div className="flex justify-center items-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : ["errorcode_9001", "errorcode_1001"].includes(
                  openFuntionResult
                ) ? (
                <div className="text-center p-4 py-8 bg-gray-200 rounded-lg  font-semibold flex">
                  Card checkout is not possible try another method{" "}
                </div>
              ) : (
                // loading latpay form
                <div className="gap-4 md:flex">
                  <div className="bg-gray-200 text-gray-800 rounded-md p-3 sm:p-5 relative shadow-sm text-sm mb-4 flex flex-col items-center justify-center w-full">
                    {testLoader ? (
                      <div className="flex items-center justify-center min-h-[100px]">
                        <div className="flex justify-center items-center">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
                        </div>
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

                  {/* order details */}
                  <div className="w-full h-[30%] md:max-w-xs  bg-white rounded-lg shadow-md">
                    <div className="bg-gray-200 rounded-t-lg">
                      <p className="text-sm font-semibold  px-3 py-2   text-gray-800 leading">
                        Payment Details
                      </p>
                    </div>
                    <div className="p-4 md:p-6 space-y-2 text-sm text-gray-700 text-left">
                      {["Merchant User Id", "Amount", "Email"].map((label) => (
                        <div
                          className="flex flex-col sm:flex-row sm:justify-between gap-1"
                          key={label}
                        >
                          <span className="font-semibold">
                            {formValues.find((f) => f.label === label)?.label}
                          </span>
                          <span>
                            {formValues.find((f) => f.label === label)?.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full px-4 md:px-8 overflow-x-auto text-left">
              <form onSubmit={handleSubmit} className="w-full">
                <div className="bg-gray-200 p-4 sm:p-6 rounded-lg shadow-inner">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {formValues
                      .filter(
                        (field) =>
                          !["TransKey", "AuthStatusCheck"].includes(field.label)
                      )
                      .map((field, index) => (
                        <div key={index} className="flex flex-col">
                          <label className=" font-semibold mb-1">
                            {field.label}
                          </label>
                          <input
                            type="text"
                            name={field.label}
                            value={field.value}
                            onChange={(e) => handleChange(e, field.label)}
                           className="w-full px-4 py-2 border rounded-md bg-white"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </form>
            </div>
          )
        ) : finalDataResult == "success" ? (
          <div className="text-center px-4 py-8 bg-gray-200 rounded-lg  font-semibold ">
            <p className="">Success</p>
            <button
              className="bg-green-700 p-2.5 text-white rounded mt-1"
              onClick={resetAll}
            >
              go to checkout
            </button>
          </div>
        ) : finalDataResult == "Transkey invalid" ? (
          <p className="text-center p-4 py-8 bg-gray-200 rounded-lg  font-semibold flex">
            Transkey Invalid
          </p>
        ) : finalDataResult == "Card rejected" ? (
          <div className="text-center p-4 py-8 bg-gray-200 rounded-lg  font-semibold ">
            <p>Request Declined please check with another card</p>
            <button
              className="bg-green-700 p-3 rounded-lg mt-4"
              onClick={resetAll}
            >
              go to checkout
            </button>
          </div>
        ) : finalDataResult == "Prescreen Error" ? (
          <p className="text-center p-4 py-8 bg-gray-200 rounded-lg  font-semibold flex">
            Prescreen Error
          </p>
        ) : finalDataResult == "Rejected" ? (
          <p className="text-center p-4 py-8 bg-gray-200 rounded-lg  font-semibold flex">
            Transaction got rejected
          </p>
        ) : (
          ""
        )}
      </div>

      {resultContainer && finalDataResult == "success" ? (
        <div className="fixed bottom-4 left-4 max-w-lg max-h-40 overflow-auto break-words whitespace-pre-wrap bg-[#f2efe5] p-4 rounded-lg shadow-inner text-sm z-50">
          status code {finalData?.status?.statuscode} and error code{" "}
          {finalData?.status?.errorcode} returned from latpay
        </div>
      ) : ["errorcode_1001", "errorcode_9001"].includes(openFuntionResult) ? (
        <p className="fixed bottom-4 left-4 max-w-lg max-h-40 overflow-auto break-words whitespace-pre-wrap bg-[#f2efe5] p-4 rounded-lg shadow-inner text-sm z-50 font-semi">
          {openFuntionResult} is acquired in open function please check
        </p>
      ) : finalData !== null && finalData?.status?.errorcode !== "00" ? (
        <p className="fixed bottom-4 left-4 max-w-lg max-h-40 overflow-auto break-words whitespace-pre-wrap bg-[#f2efe5] p-4 rounded-lg shadow-inner text-sm z-50 font-semi">
          Latpay has returned {finalData?.status?.errorcode} error code, please
          investigate
        </p>
      ) : (
        ""
      )}
    </div>
  );
};

export default HPS3;
