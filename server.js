"use strict";

const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const VERIFY_TOKEN =
  process.env.VERIFY_TOKEN || "myverifytoken";

const PAGE_ACCESS_TOKEN =
  process.env.PAGE_ACCESS_TOKEN;

const GRAPH_API_VERSION =
  process.env.GRAPH_API_VERSION || "v25.0";

const PUBLIC_REPLY_MESSAGE =
  process.env.PUBLIC_REPLY_MESSAGE ||
  "Thank you for your comment ❤️";

const PORT =
  process.env.PORT || 10000;

const repliedComments = new Set();

app.get("/", (req, res) => {

  res.send("Facebook Comment Bot Running");
});

app.get("/webhook", (req, res) => {

  const mode =
    req.query["hub.mode"];

  const token =
    req.query["hub.verify_token"];

  const challenge =
    req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === VERIFY_TOKEN
  ) {

    console.log("WEBHOOK VERIFIED");

    return res
      .status(200)
      .send(challenge);
  }

  return res.sendStatus(403);
});

async function sendCommentReply(commentId) {

  const url =
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${commentId}/comments`;

  return axios.post(
    url,
    {
      message: PUBLIC_REPLY_MESSAGE
    },
    {
      params: {
        access_token:
          PAGE_ACCESS_TOKEN
      }
    }
  );
}

app.post("/webhook", async (req, res) => {

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

      for (
        const change of
        entry.changes || []
      ) {

        if (
          change.field !== "feed"
        ) {
          continue;
        }

        const value =
          change.value || {};

        if (
          value.item !== "comment" ||
          value.verb !== "add"
        ) {
          continue;
        }

        const commentId =
          value.comment_id;

        if (!commentId) {
          continue;
        }

        if (
          repliedComments.has(
            commentId
          )
        ) {

          console.log(
            "ALREADY REPLIED"
          );

          continue;
        }

        console.log(
          "REPLYING TO COMMENT:",
          commentId
        );

        const response =
          await sendCommentReply(
            commentId
          );

        repliedComments.add(
          commentId
        );

        console.log(
          "COMMENT REPLY SENT:",
          response.data
        );
      }
    }

  } catch (err) {

    console.log(
      "ERROR SENDING REPLY"
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
});

app.listen(PORT, () => {

  console.log(
    `SERVER RUNNING ON PORT ${PORT}`
  );
});
