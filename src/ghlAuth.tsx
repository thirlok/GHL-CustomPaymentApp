function redirectToGhlOAuth() {
  try {
    // Load config.json from public folder
  

    const options = {
      requestType: "code",
      redirectUri: "https://ghlatpay.web.app/ghlconfig", // update if deployed
      clientId: window.env.clientId,
      scopes: [
        "payments/orders.readonly",
        "payments/orders.write",
        "payments/subscriptions.readonly",
        "payments/transactions.readonly",
        "payments/custom-provider.readonly",
        "payments/custom-provider.write",
        "products.readonly",
        "products/prices.readonly"
      ]
    };

    // Build redirect URL
    const redirectUrl =
      `${window?.env?.BASE_URL}/oauth/chooselocation?` +
      new URLSearchParams({
        response_type: options.requestType,
        redirect_uri: options.redirectUri,
        client_id: options.clientId,
        scope: options.scopes.join(" ")
      }).toString();

    // Redirect browser
    window.location.href = redirectUrl;
  } catch (error) {
    console.error("OAuth redirect failed:", error);
  }
}


import { useEffect } from 'react'

const GhlAuth = () => {
  useEffect(()=>{
    redirectToGhlOAuth()
  },[])
  return (
    <div>
      
    </div>
  )
}

export default GhlAuth
