const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "my_verify_token";

/* PASTE YOUR NEW PAGE TOKEN BELOW */
const PAGE_ACCESS_TOKEN = "EAAX2v9peWNoBRYn01cWmKU3FpldaTOOWhswv2YNoUAww9ZB92DuJ9cEZBEZAE785eAQZBXXO0UA2jVfLNpZBdKamT4jRrn9E9ySZAbwCHDZCVFxTF3QMZBHHiG8LdZC45tSnZAG3MvS6LZA6snmnjygsbdT2Ek3gmL2gao0qvWemKZCrFOjLIetHZB83QMhyg8GfcZByw9lh9oWwZDZD";

/* WEBHOOK VERIFY */
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

/* RECEIVE EVENTS */
app.post("/webhook", async (req, res) => {
  console.log("NEW FACEBOOK EVENT RECEIVED");

  try {
    const body = req.body;

    if (body.object === "page") {
      body.entry.forEach(async (entry) => {
        const changes = entry.changes;

        if (changes) {
          changes.forEach(async (change) => {

            if (
              change.field === "feed" &&
              change.value.item === "comment" &&
              change.value.verb === "add"
            ) {

              console.log("COMMENT RECEIVED");

              const commentId = change.value.comment_id;

              console.log("COMMENT ID:", commentId);

              await axios.post(
                `https://graph.facebook.com/v25.0/${commentId}/comments`,
                {
                  message: "Thanks for your comment ❤️"
                },
                {
                  params: {
                    access_token: PAGE_ACCESS_TOKEN
                  }
                }
              );

              console.log("AUTO REPLIED SUCCESSFULLY");
            }
          });
        }
      });

      res.status(200).send("EVENT_RECEIVED");

    } else {
      res.sendStatus(404);
    }

  } catch (error) {
    console.log("ERROR:");

    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
