const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const VERIFY_TOKEN = "myverifytoken";

const PAGE_ACCESS_TOKEN =
  "EAAc4cUMHMhIBRfvicusptZB9bLty2sHx9MaXMZCO7BsfH5XxMiEhYCCck0aG4EbnfV16HksYmfcN89fgWMYYFluVLeIsaZAgFDS3UsikGs0xVOq6pVMQnyPx6aoIZAVgEaSJmKKYDdZCnHo6eWSZBqV8Ug2rg6lZAMHoVuqoBtxVXyENajbvEK4d2ctXthqzjfRROzEksnc0OZCsaaouHF5jmAfE8ghug6cdXl151K5uf5C5JAo5h3hhL97nMWeEjgYe2onJRFu4bgnhDpldQL5M";

app.get("/", (req, res) => {
  res.send("Facebook Auto Reply Bot Running");
});

app.get("/webhook", (req, res) => {

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("VERIFY REQUEST:", req.query);

  if (
    mode === "subscribe" &&
    token === VERIFY_TOKEN
  ) {

    console.log("WEBHOOK VERIFIED");

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

              let commentId = value.comment_id;

              console.log(
                "FULL COMMENT ID:",
                commentId
              );

              // Facebook sends combined IDs
              // Example:
              // 1400531292095331_1597157325743333

              if (commentId.includes("_")) {

                commentId =
                  commentId.split("_")[1];
              }

              console.log(
                "FINAL COMMENT ID:",
                commentId
              );

              console.log(
                "SENDING PRIVATE REPLY..."
              );

              const response =
                await axios.post(
                  `https://graph.facebook.com/v25.0/${commentId}/private_replies`,
                  {
                    message:
                      "Thank you for your comment ❤️",
                    access_token:
                      PAGE_ACCESS_TOKEN
                  }
                );

              console.log(
                "FACEBOOK RESPONSE:",
                response.data
              );

              console.log(
                "PRIVATE REPLY SENT SUCCESSFULLY"
              );
            }
          }
        }
      }
    }

    return res.sendStatus(200);

  } catch (err) {

    console.log(
      "ERROR SENDING PRIVATE REPLY"
    );

    if (err.response) {

      console.log(
        "FACEBOOK ERROR:",
        JSON.stringify(
          err.response.data,
          null,
          2
        )
      );

    } else {

      console.log(err.message);
    }

    return res.sendStatus(500);
  }
});

const PORT =
  process.env.PORT || 10000;

app.listen(PORT, () => {

  console.log(
    `SERVER RUNNING ON PORT ${PORT}`
  );
});
