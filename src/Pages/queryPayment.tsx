// export const querypayment = functions.https.onRequest(async (req, res) => {
//   try {
//     const { transactionId, apiKey, chargeId, subscriptionId } = req.body;

//     console.log("Received GHL POST:", req.body);
//     // Extract details from chargeId
//     const parts = chargeId.split("###");
//     const merchantid = parts[0];
//     const amount = parts[1];
//     const currency = parts[2];
//     const reference = parts[3];
//     const dataKey = parts[4];

//     const transactionkey = sha256(`${currency}${amount}${reference}${dataKey}`);

//     // 1️⃣ Prepare authRequest for your backend
//     const authRequest = {
//       merchantid,
//       amount,
//       currency,
//       reference,
//       transactionkey,
//     };

//     // 2️⃣ Call your backend AUTH_CHECK_URL
//     const response = await fetch(process.env.AUTH_CHECK_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json; charset=utf-8",
//       },
//       body: JSON.stringify(authRequest),
//     });

//     const data = await response.json();
//     console.log("AUTH_CHECK_URL response:", data);

//     // 3️⃣ Send GHL response based on errorcode
//     if (data?.status?.errorcode === "00") {
//       res.json({ success: true }); //  transaction success
//     } else {
//       res.json({
//         success: false,
    
//       }); //  transaction failed
//     }
//   } catch (err) {
//     console.error("Error in Query Payment:", err);
//     res.json({
//       success: false,
//       error: "Internal server error",
//     });
//   }
// });




const QueryPayment = () => {
  return (
    <div>
      
    </div>
  )
}

export default QueryPayment

