import axios from "axios";

const getAppdata = () => {
  const params = {
    client_id: window.env.clientId,
    client_secret: window.env.clientSecret,
    grant_type: "authorization_code", // or refresh_token
    code: "", // if grant_type = authorization_code
    refresh_token: window.env.clientId, // if grant_type = refresh_token
    user_type: window.env.clientId, // required by HighLevel
  };

  axios
    .get("https://services.leadconnectorhq.com/oauth/token", {
      params,
      headers: {
        Accept: "application/json",
      },
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error.response?.data || error.message);
    });
  return <div></div>;
};

export default getAppdata;
