import { useEffect, useState } from "react";
import axios from "axios";
import {  Row } from "react-bootstrap";
// import { redirectToGhlOAuth } from "./ghlAuth";
import { useNavigate } from "react-router-dom";
import sha256 from "sha256";
import { getUtcDate } from "./Components/UtcDate";
// import { redirectToGhlOAuth } from "./ghlAuth";

// Types
interface AppConfig {
  clientId?: string;
  clientSecret?: string;
}

interface AccessTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  [key: string]: any;
}

const GhlTestPage = () => {
  //const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [config, setConfig] = useState<AppConfig>({
    clientId: "",
    clientSecret: "",
  });

  const [configCallCredential,setConfigCallCredential]=useState({
    accessToken:'',
    locationId:''
  })
  const [tokenData, setTokenData] = useState<any>("");
  // const [error, setError] = useState<string | null>(null);

  // Runs on page load
  useEffect(() => {
    getCredential();
  }, []);


    //api call to get the client id and secret id from firebase
  const getCredential = () => {
    //console.log('token', window.env.GET_GHL_TOKEN)
    var xSignatureVal = sha256(getUtcDate() + window?.env?.SECRETKEY);
    //console.log('signature',xSignatureVal);
    axios({
      method: "post",
      url: window.env.GET_GHL_TOKEN,
      headers: {
        " X-Signature": xSignatureVal,
      },
      data: {
        mode: "live",
        timeStamp: getUtcDate(),
      },
    })
      .then((res) => {
        console.log('credential details',res.data);
        if (res.data.statuscode == "0") {
          setConfig((prev) => ({
            ...prev,
            clientId: res.data.statusdesc.clientId,
            clientSecret: res.data.statusdesc.clientSecret,
          }));
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  
  useEffect(() => {
    if (config.clientId !== "") {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        // If ?code exists, fetch access token
        fetchAccessToken(code);
      }
    }
  }, [config]);

 // console.log('testing',tokenData);
  // Fetch access token from GHL
  const fetchAccessToken = (code: string) => {
    //setLoading(true);
   // console.log("🔹 Starting fetchAccessToken with code:", code);

    if (!config?.clientId || !config?.clientSecret) {
      throw new Error("Missing clientId or clientSecret in config.js");
    }

    //console.log("🔹 Sending request to OAuth token endpoint...");
    axios
      .post<AccessTokenResponse>(
        "https://services.leadconnectorhq.com/oauth/token",
        new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          grant_type: "authorization_code",
          code,
          user_type: "Location",
        }),
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((res) => {
        console.log("✅ Token response received:", res.data);
        localStorage.setItem('locationId',res.data.locationId)
        setTokenData(res.data);
  // Extract relevant fields from response
  const { access_token, locationId } = res.data;
    setConfigCallCredential({
    accessToken: access_token,
    locationId: locationId,
  });
        if (!res.data.access_token) {
          throw new Error(
            "No access_token found in response. Full response: " +
              JSON.stringify(res.data)
          );
        }

        //console.log("🔹 Saving access_token to state and localStorage...");
        setAccessToken(res.data.access_token);
        //localStorage.setItem("ghl_access_token", res.data.access_token);

        //console.log("✅ Access token saved successfully!");
        //setLoading(false);
      });
  };



  useEffect(() => {
    if (tokenData !== "") {
      saveTokenData();
    }
  }, [tokenData]);

  const saveTokenData = () => {
    var xSignatureVal = sha256(getUtcDate() + window?.env?.SECRETKEY);
    axios({
      method: "post",
      url: window.env.SAVE_TOKEN,
      headers: {
        "X-Signature": xSignatureVal,
      },
      data: {
        action: "save",
        timeStamp: getUtcDate(),
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
      },
    })
      .then((res) => {
        console.log('token submitted',res.data)
        if (res.data.statuscode == "0") {
          //console.log("submission response", res.data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const navigate = useNavigate();

  const buttons = [{ label: "Custom Page Testing", path: "/custom-page" }];

 // console.log('tokent data',tokenData)
  return (
    <div style={{ padding: "2rem" }}>
      <Row style={{ justifyContent: "center", marginBottom: "2rem" }}>
        <h3 style={{ fontWeight: "bold", color: "#253370" }}>
          GHL OAuth & Access Token Demo
        </h3>
      </Row>

      {/* {loading && <p>Loading access token...</p>} */}
      {/* {error && <p style={{ color: "red" }}>Error: {error}</p>} */}
      {accessToken && (
        <div>
          <h3>Successfully integrated </h3>
          <p>Feel free to close the page </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            {buttons.map((btn, index) => (
              <button
                key={index}
                onClick={() => navigate(btn.path,{state:{configCallCredential}})}
                className="px-6 py-3 rounded-2xl shadow-md bg-white 
                       text-indigo-600 font-semibold transition-all duration-300"
              >
                {btn.label}
              </button>
            ))}
          </div>
          {/* <pre
            style={{
              backgroundColor: "#f2f2f2",
              padding: "1rem",
              borderRadius: "6px",
              wordWrap: "break-word",
            }}
          >
            {accessToken}
          </pre> */}
        </div>
      )}

      {/* {!accessToken && !loading && (
        <Button onClick={redirectToGhlOAuth} style={{ marginTop: "1rem" }}>
          Redirect to GHL OAuth
        </Button>
      )} */}
    </div>
  );
};

export default GhlTestPage;
