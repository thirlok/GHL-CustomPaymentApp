import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import sha256 from "sha256";

const QueryPage = () => {
  const location = useLocation();
  const payload = (location.state as any)?.queryQrl;

  var navigate=useNavigate()

  useEffect(() => {
    const inputString = `${payload.chargeId.split("###")[2]}${
      payload.chargeId.split("###")[1]
    }${payload.transactionId}${payload.apiKey.split("###")[1]}`;
    console.log(inputString)
    const hash = sha256(inputString);//currenct / amount / reference / datakey
    var authstatuscheck = hash;

    //requeset for authstatus check
    const authRequest = {
      merchantid: payload.chargeId.split("###")[0],
      amount: payload.chargeId.split("###")[1],
      currency: payload.chargeId.split("###")[2],
      reference: payload.transactionId,
      transactionkey: authstatuscheck,
    };

    console.log("Auth Request Payload:", authRequest);
    console.log("auth url", window.env.AUTH_CHECK_URL);
    fetch(window.env.AUTH_CHECK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(authRequest),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if(data.status.errorcode){
          console.log(data.status.errorcode)
           window.parent.postMessage({ type: "query_success", payload: { success: true } }, "*");

          // Optionally navigate back
         navigate("/ghlpage", { state: { success: true } });
        }
         
      })
      .catch((err) => {
        console.error("Error in Auth Status Check:", err);
      });
    console.log(inputString);
  }, [payload]);
  return (
    <div>
      <p>Query Page</p>
    </div>
  );
};

export default QueryPage;
