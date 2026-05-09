const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const VERIFY_TOKEN = "myverifytoken";

const PAGE_ACCESS_TOKEN =
  "EAAc4cUMHMhIBRTITiHBVXsz2ZAMD54mM9g1SjNanZA5eGBUYNaBlIVGNOg9UMtZAX72WEnwDTCfW3LlQZAYXr1ZA7XeoovITNgPQyEolWfEQWsf4Ec2k7qckbXFsaa1GUlT440Ll1PcDFGSX4wvAzA8BZCAZCD26Sj342OsFZBezNCR1ZAK5hxw47QNI0ZAxcgMNCyYI0ZAjgZDZD";

app.get("/", (req, res) => {
  res.send("Facebook Bot Running");
});

app.get("/webhook", (req, res) => {

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("VERIFY WEBHOOK:", req.query);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {

    console.log("WEBHOOK VERIFIED SUCCESSFULLY");

    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {

  console.log(
    "NEW FACEBOOK EVENT:",
    JSON.stringify(req.body, null, 2)
  );

  try {

    if (req.body.object === "page") {

      for (const entry of req.body.entry) {

        for (const change of entry.changes || []) {

          if (change.field === "feed") {

            const value = change.value;

            if (
              value.item === "comment" &&
              value.verb === "add"
            ) {

              const commentId = value.comment_id;

              console.log("COMMENT ID:", commentId);

              console.log("SENDING PRIVATE REPLY...");

              const response = await axios.post(
                `https://graph.facebook.com/v25.0/${commentId}/private_replies`,
                {
                  message: "Thank you for your comment ❤️"
                },
                {
                  headers: {
                    Authorization: `Bearer ${PAGE_ACCESS_TOKEN}`
                  }
                }
              );

              console.log("FACEBOOK RESPONSE:", response.data);

              console.log("PRIVATE AUTO REPLY SENT");
            }
          }
        }
      }
    }

    return res.sendStatus(200);

  } catch (err) {

    console.log("ERROR SENDING PRIVATE REPLY");

    if (err.response) {

      console.log(
        "FACEBOOK ERROR:",
        JSON.stringify(err.response.data, null, 2)
      );

    } else {

      console.log(err.message);
    }

    return res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {

  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
