const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "my_verify_token";

/*
PASTE YOUR PAGE ACCESS TOKEN HERE
*/
const PAGE_ACCESS_TOKEN = "PASTE_YOUR_PAGE_ACCESS_TOKEN";


// WEBHOOK VERIFICATION
app.get("/webhook", (req, res) => {

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK VERIFIED");
      res.status(200).send(challenge);

    } else {
      res.sendStatus(403);
    }
  }
});



// RECEIVE EVENTS
app.post("/webhook", async (req, res) => {

  console.log("NEW FACEBOOK EVENT RECEIVED");

  try {

    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];

    if (changes?.field === "feed") {

      const value = changes.value;

      console.log(value);

      // NEW COMMENT DETECTED
      if (value.item === "comment") {

        const commentId = value.comment_id;

        console.log("COMMENT ID:", commentId);

        // AUTO REPLY
        await axios.post(

          `https://graph.facebook.com/v25.0/${commentId}/comments`,
          {
            message: "Thank you for your comment kindly check inbox ❤️"
          },
          {
            params: {
              access_token: PAGE_ACCESS_TOKEN
            }
          }

        );

        console.log("AUTO REPLY SENT");
      }
    }

    res.status(200).send("EVENT_RECEIVED");

  } catch (error) {

    console.log("ERROR:");
    console.log(error.response?.data || error.message);

    res.sendStatus(500);
  }
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
