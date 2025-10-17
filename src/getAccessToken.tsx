import axios from "axios";

interface AppConfig {
  clientId: string;
  clientSecret: string;
}

interface AccessTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  [key: string]: any;
}

export async function getAccessTokenPage(): Promise<void> {
  try {
    // Load config.json
    const configRes = await fetch("/config.json");
    if (!configRes.ok) throw new Error("Config file not found");
    const appConfig: AppConfig = await configRes.json();

    // Get ?code from URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) throw new Error("No authorization code found in URL");

    // Exchange code for access token
    const response = await axios.post<AccessTokenResponse>(
      "https://services.leadconnectorhq.com/oauth/token",
      new URLSearchParams({
        client_id: appConfig.clientId,
        client_secret: appConfig.clientSecret,
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
    );

   // console.log("✅ Access token received:", response.data);

    // Optional: store in localStorage or do something with the token
    localStorage.setItem("ghl_access_token", response.data.access_token);
    localStorage.setItem('ghl_locationid',response.data.locationId)
  } catch (err: any) {
    console.error("❌ Error fetching access token:", err.message || err);
  }
}
