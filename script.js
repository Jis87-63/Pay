const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(".")); // serve index.html

const API_KEY = "Cuy61kzECCw705vCNO2xWhXYsIcGfhi4";
const BASIC_AUTH = Buffer.from(API_KEY + ":").toString("base64");
const BASE_URL = "https://openapi.m-pesa.com";

async function gerarSession() {
  const response = await axios.get(
    `${BASE_URL}/sandbox/ipg/v2/vodacomMOZ/getSession/`,
    { headers: { Authorization: "Basic " + BASIC_AUTH, Origin: "*" } }
  );
  return response.data.output_SessionID;
}

app.post("/pagar", async (req, res) => {
  const msisdn = req.body.msisdn || "25884XXXXXXX";

  try {
    const session = await gerarSession();
    const pagamento = await axios.post(
      `${BASE_URL}/sandbox/ipg/v2/vodacomMOZ/c2bPayment/singleStage/`,
      {
        input_Amount: "10",
        input_Country: "MOZ",
        input_Currency: "MZN",
        input_CustomerMSISDN: msisdn,
        input_ServiceProviderCode: "000000",
        input_ThirdPartyConversationID: "abc" + Date.now(),
        input_TransactionReference: "T" + Date.now(),
        input_PurchasedItemsDesc: "Teste HTML"
      },
      { headers: { Authorization: "Bearer " + session, "Content-Type": "application/json" } }
    );

    res.json(pagamento.data);

  } catch (error) {
    res.json(error.response?.data || error.message);
  }
});

app.listen(3000, () => console.log("Abra http://localhost:3000"));
