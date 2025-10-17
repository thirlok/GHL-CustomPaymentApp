const loadLatpayJS2 = (callback: () => void) => {
  const existingScript = document.getElementById("latpayJS2");
  if (!existingScript) {
    const script = document.createElement("script");
    // // //staging code
    // script.src =
    //   "https://lateralpayments.com/checkout-staging/Scripts/Latpay3.js";

    //live code
    script.src = window?.env?.HPS_URL;


    script.id = "latpayJS2";
    document.body.appendChild(script);
    script.onload = () => {
      if (callback) callback();
    };
  }
  if (existingScript && callback) callback();
};
export default loadLatpayJS2;
