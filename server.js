const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "myverifytoken";

const PAGE_ACCESS_TOKEN =
"EAAc4cUMHMhIBRWpz578NCHnGiPUEDoef2iaTNQlI6hpcDwUzcJbVCP81XArjBWI0dwof57bh7JtYuRbgBz1g8rXpBg5baEJlIroQJ24iJ7NCa6ucqSOVzPYmA6tkKcnZCX0AeG2ZBYQA3vraLc978qz9PXIHTdvzkguUFP0fqj5xQPIZB8P61rsmlLQLnCTlRxWIAZDZD";

app.get("/", (req, res) => {
  res.send("Bot Running");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("VERIFY REQUEST:", req.query);

  if (mode && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  console.log("NEW EVENT:", JSON.stringify(req.body, null, 2));

  try {
    if (req.body.object === "page") {
      for (const entry of req.body.entry) {
        for (const change of entry.changes || []) {

          if (change.field === "feed") {

            const value = change.value;

            if (value.item === "comment" && value.verb === "add") {

              const commentId = value.comment_id;

              console.log("COMMENT ID:", commentId);

              await axios.post(
  `https://graph.facebook.com/v25.0/${value.post_id}/comments`,
  {
    message: `@${value.from.name} Thank you for your comment ❤️`
  },
  {
    params: {
      access_token: PAGE_ACCESS_TOKEN
    }
  }
);

              console.log("AUTO REPLIED");
            }
          }
        }
      }
    }

    res.sendStatus(200);

  } catch (err) {
    console.log("ERROR:");
    console.log(err.response ? err.response.data : err.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
