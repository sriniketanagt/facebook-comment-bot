const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();

app.use(bodyParser.json());

const VERIFY_TOKEN = "my_verify_token";

const PAGE_ACCESS_TOKEN =
  "EAANzZBcUsXkwBRVk5TAhtpCwTrfJpKmMYNnxl8pJuLI1Olk3iuoxTstZBm54el4OPyneNzyNSlApq3d04k6tQ0tNR0sfkQCPTdxo6kfZCWoywGvs56ZAProhVBKhalGEbscM1dfXDVt0FMSqOaRQ3j0OmKMnW19bv2NCPdCeq4KKdwgpATZBd4wCzDGVusCZBZCpunqNAZDZD";

// VERIFY WEBHOOK
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

// RECEIVE EVENTS
app.post("/webhook", async (req, res) => {

  console.log("NEW FACEBOOK EVENT");

  try {

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    console.log(value);

    // NEW COMMENT
    if (value?.item === "comment" && value?.verb === "add") {

      const parentId = value.parent_id;

      console.log("PARENT ID:", parentId);

      // REPLY TO COMMENT
      const response = await axios.post(

        `https://graph.facebook.com/v25.0/${parentId}/comments`,

        {
          message: "Thanks for your comment ❤️"
        },

        {
          params: {
            access_token: PAGE_ACCESS_TOKEN
          }
        }
      );

      console.log("REPLY SENT");
      console.log(response.data);
    }

    res.sendStatus(200);

  } catch (error) {

    console.log("ERROR:");

    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});
