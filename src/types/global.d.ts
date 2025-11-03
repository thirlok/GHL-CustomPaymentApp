export {};

declare global {
  interface Window {
    LatpayCheckout: {
      open: (options: {
        merchantuserid: string;
        publickey: string;
        currency: string;
        amount: string | number;
        reference: string;
        description:string
        status?: (status: string) => void;
      }) => void;

      secure3DPayment: (options: {
        amount: string | number;
        currency: string;
        reference: string;
        description?: string;
        firstname?: string;
        lastname?: string;
        email?: string;
        transkey: string;
        datakey:string
        is3dcheck?: "Y" | "N";
      }) => void;

    };
    env: {
      BASE_URL: string;
      clientId: string;
      clientSecret:string,
      AUTH_CHECK_URL:string,
      HPS_URL:string,
      DB_SECRET_KEY:string,
      DB_GET_CREDENTIALS:string,
      DB_TOKEN:string,
      DB_DECRYPT_SSO_PAYLOAD:string,
      QUERY_PAYMENT_URL:string,
      CREATE_PAYMENT_URL:string,
      IMAGE_URL:string,
      GHL_CREATEPAYMENT_CONFIG:string,
      GHL_CREATEPAYMENT_INTEGRATION:string,
      GHL_FETCH_USER_DETAILS:string,
    };
  }
}
