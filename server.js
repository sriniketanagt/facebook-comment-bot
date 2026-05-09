const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

const VERIFY_TOKEN = "my_verify_token";

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK VERIFIED");
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
});

// Receive webhook events
app.post("/webhook", (req, res) => {
  console.log("=================================");
  console.log("NEW FACEBOOK EVENT RECEIVED");
  console.log(JSON.stringify(req.body, null, 2));
  console.log("=================================");

  return res.sendStatus(200);
});

// Home route
app.get("/", (req, res) => {
  res.send("Facebook Comment Bot Running");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
