const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "sriniketan";
const PAGE_ACCESS_TOKEN = "EAAX2v9peWNoBRYn01cWmKU3FpldaTOOWhswv2YNoUAww9ZB92DuJ9cEZBEZAE785eAQZBXXO0UA2jVfLNpZBdKamT4jRrn9E9ySZAbwCHDZCVFxTF3QMZBHHiG8LdZC45tSnZAG3MvS6LZA6snmnjygsbdT2Ek3gmL2gao0qvWemKZCrFOjLIetHZB83QMhyg8GfcZByw9lh9oWwZDZD";

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    console.log("NEW FACEBOOK EVENT RECEIVED");
    console.log(JSON.stringify(body, null, 2));

    if (body.entry) {
      for (const entry of body.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {

            const value = change.value;

            if (value.item === "comment") {

              const postId = value.post_id;
              const commentText = value.message || "";

              console.log("POST ID:", postId);
              console.log("COMMENT:", commentText);

              await axios.post(
                `https://graph.facebook.com/v25.0/${postId}/comments`,
                {
                  message: `Thanks for commenting 💛`
                },
                {
                  params: {
                    access_token: PAGE_ACCESS_TOKEN
                  }
                }
              );

              console.log("REPLIED SUCCESSFULLY");
            }
          }
        }
      }
    }

    res.sendStatus(200);

  } catch (err) {
    console.log("ERROR:");
    console.log(err.response?.data || err.message);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 10000, () => {
  console.log("Server running on port 10000");
});
