const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "my_verify_token";

const PAGE_ACCESS_TOKEN = "EAANzZBcUsXkwBRVk5TAhtpCwTrfJpKmMYNnxl8pJuLI1Olk3iuoxTstZBm54el4OPyneNzyNSlApq3d04k6tQ0tNR0sfkQCPTdxo6kfZCWoywGvs56ZAProhVBKhalGEbscM1dfXDVt0FMSqOaRQ3j0OmKMnW19bv2NCPdCeq4KKdwgpATZBd4wCzDGVusCZBZCpunqNAZDZD";



// VERIFY WEBHOOK
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

    console.log("=================================");
    console.log("NEW FACEBOOK EVENT RECEIVED");

    try {

        const entry = req.body.entry?.[0];
        const changes = entry?.changes?.[0];

        if (changes?.field === "feed") {

            const value = changes.value;

            console.log(value);

            // COMMENT EVENT
            if (value.item === "comment") {

                const commentId = value.comment_id;

                console.log("COMMENT ID:", commentId);

                // SEND AUTO REPLY
                const response = await axios.post(
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
                console.log(response.data);
            }
        }

        res.status(200).send("EVENT_RECEIVED");

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



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
