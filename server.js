"use strict";

const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const VERIFY_TOKEN = "myverifytoken";

const PAGE_ID =
  "524548834272410";

const PAGE_ACCESS_TOKEN =
  "EAAc4cUMHMhIBRfvicusptZB9bLty2sHx9MaXMZCO7BsfH5XxMiEhYCCck0aG4EbnfV16HksYmfcN89fgWMYYFluVLeIsaZAgFDS3UsikGs0xVOq6pVMQnyPx6aoIZAVgEaSJmKKYDdZCnHo6eWSZBqV8Ug2rg6lZAMHoVuqoBtxVXyENajbvEK4d2ctXthqzjfRROzEksnc0OZCsaaouHF5jmAfE8ghug6cdXl151K5uf5C5JAo5h3hhL97nMWeEjgYe2onJRFu4bgnhDpldQL5M";

const GRAPH_API_VERSION = "v25.0";

const PRIVATE_REPLY_MESSAGE =
  "Thank you for your comment.";

const PORT = 10000;

const repliedComments = new Set();

app.get("/", (_req, res) => {

  res.send(
    "Facebook Auto Reply Bot Running"
  );
});

app.get("/webhook", (req, res) => {

  const mode =
    req.query["hub.mode"];

  const token =
    req.query["hub.verify_token"];

  const challenge =
    req.query["hub.challenge"];

  console.log(
    "VERIFY REQUEST:",
    req.query
  );

  if (
    mode === "subscribe" &&
    token === VERIFY_TOKEN
  ) {

    console.log(
      "WEBHOOK VERIFIED"
    );

    return res
      .status(200)
      .send(challenge);
  }

  return res.sendStatus(403);
});

async function sendPrivateReply(
  pageId,
  commentId
) {

  const url =
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/messages`;

  const response =
    await axios.post(
      url,
      {
        recipient: {
          comment_id:
            commentId
        },
        message: {
          text:
            PRIVATE_REPLY_MESSAGE
        }
      },
      {
        headers: {
          Authorization:
            `Bearer ${PAGE_ACCESS_TOKEN}`,
          "Content-Type":
            "application/json"
        }
      }
    );

  return response.data;
}

app.post(
  "/webhook",
  async (req, res) => {

    console.log(
      "NEW FACEBOOK EVENT:",
      JSON.stringify(
        req.body,
        null,
        2
      )
    );

    res.sendStatus(200);

    try {

      if (
        req.body.object !== "page"
      ) {
        return;
      }

      for (
        const entry of
        req.body.entry || []
      ) {

        const pageId =
          entry.id || PAGE_ID;

        for (
          const change of
          entry.changes || []
        ) {

          const value =
            change.value || {};

          if (
            change.field !==
              "feed" ||
            value.item !==
              "comment" ||
            value.verb !==
              "add" ||
            !value.comment_id
          ) {
            continue;
          }

          const commentId =
            value.comment_id;

          const commenterId =
            value.from?.id ||
            value.sender_id;

          console.log(
            "COMMENT ID:",
            commentId
          );

          if (
            commenterId ===
            pageId
          ) {

            console.log(
              "SKIPPED: PAGE COMMENT"
            );

            continue;
          }

          if (
            repliedComments.has(
              commentId
            )
          ) {

            console.log(
              "SKIPPED: ALREADY REPLIED"
            );

            continue;
          }

          console.log(
            "SENDING PRIVATE REPLY..."
          );

          const fbResponse =
            await sendPrivateReply(
              pageId,
              commentId
            );

          repliedComments.add(
            commentId
          );

          console.log(
            "FACEBOOK RESPONSE:",
            fbResponse
          );

          console.log(
            "PRIVATE REPLY SENT SUCCESSFULLY"
          );
        }
      }

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

        console.log(
          err.message
        );
      }
    }
  }
);

app.listen(PORT, () => {

  console.log(
    `SERVER RUNNING ON PORT ${PORT}`
  );
});
