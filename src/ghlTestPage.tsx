//GHL TEST PAGE

import { useEffect, useState } from "react";
import axios from "axios";
import { Row } from "react-bootstrap";
import sha256 from "sha256";
import { getUtcDate } from "./Components/UtcDate";

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
  const timeStampVal = getUtcDate();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [config, setConfig] = useState<AppConfig>({
    clientId: "",
    clientSecret: "",
  });

  // const [configCallCredential, setConfigCallCredential] = useState({
  //   accessToken: "",
  //   locationId: "",
  // });
  const [tokenData, setTokenData] = useState<any>("");
  // const [error, setError] = useState<string | null>(null);

  // Runs on page load
  useEffect(() => {
    getCredential();
  }, []);

  //api call to get the client id and secret id from firebase
  const getCredential = () => {
    //console.log('token', window.env.GET_GHL_TOKEN)
    const xSignatureVal = sha256(timeStampVal + window?.env?.DB_SECRET_KEY);
    //console.log('signature',xSignatureVal);
    axios({
      method: "post",
      url: window.env.DB_GET_CREDENTIALS,
      headers: {
        " X-Signature": xSignatureVal,
      },
      data: {
        mode: "live",
        timeStamp: timeStampVal,
      },
    })
      .then((res) => {
        console.log("credential details", res.data);
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
        window.env.GHL_FETCH_USER_DETAILS,
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
        setTokenData(res.data);
        // Extract relevant fields from response
        //const { access_token, locationId } = res.data;
        // setConfigCallCredential({
        //   accessToken: access_token,
        //   locationId: locationId,
        // });
        if (!res.data.access_token) {
          throw new Error(
            "No access_token found in response. Full response: " +
            JSON.stringify(res.data)
          );
        }
        setAccessToken(res.data.access_token);
      });
  };

  useEffect(() => {
    if (tokenData !== "") {
      console.log("token data", tokenData);

      saveTokenData();
    }
  }, [tokenData]);

  const saveTokenData = () => {
    var xSignatureVal = sha256(timeStampVal + window?.env?.DB_SECRET_KEY);
    axios({
      method: "post",
      url: window.env.DB_TOKEN,
      headers: {
        "X-Signature": xSignatureVal,
      },
      data: {
        action: "save",
        timeStamp: timeStampVal,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
      },
    })
      .then((res) => {
        console.log("token submitted", res.data);
        if (res.data.statuscode == "0") {
          //console.log("submission response", res.data);
          createPaymentConfig(tokenData);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const createPaymentConfig = (tokenData: any) => {
    console.log("inside function accesstoken", tokenData.access_token);
    console.log("inside function locationid", tokenData.locationId);
    let data = {
      name: "Latpay Integration",
      description:
        "This payment gateway supports payments in UK and AU via cards and wallets.",
      paymentsUrl: window.env.CREATE_PAYMENT_URL,
      queryUrl:
        window.env.QUERY_PAYMENT_URL,
      imageUrl:
        window.env.IMAGE_URL,
      supportsSubscriptionSchedule: true,
    };
    axios({
      method: "post",
      url: window.env.GHL_CREATEPAYMENT_CONFIG,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
        Version: "2021-07-28",
      },

      data: data,
      params: { locationId: tokenData.locationId },
    })
      .then((res) => {
        console.log("payment provider created", res.data);
      })
      .catch((err) => {
        console.error(
          "getting error response while creating payment configuration",
          err
        );
      });
  };

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
