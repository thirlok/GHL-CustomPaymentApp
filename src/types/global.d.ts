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
      baseUrl: string;
      clientId: string;
      clientSecret: string;
      sos: string;
      code: string;
      access_token: string;
      refreshToken: string;
      userType: string;
      companyId: string;
      locationId: string;
      scope: string;
      expires_in: NUmber;
      userId: string;
      AUTH_CHECK_URL:string,
      HPS_URL:string,
      SECRETKEY:string,
      GET_GHL_TOKEN:string,
      SAVE_TOKEN:string
    };
  }
}
