require("dotenv").config();
const { Client, MessageTypes, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const axios = require("axios");
const qrcode = require("qrcode-terminal");

// Initialize WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox"],
    executablePath: "/usr/bin/google-chrome-stable", // Update path as per your OS
  },
});

console.log("Initializing WhatsApp Client...");

// Express Setup
const app = express();
app.use(express.json());

// Utility Function for HTTP POST Requests
/**
 * Sends a POST request with the given payload and configuration.
 * @param {string} url - The target URL.
 * @param {Object} payload - The request payload.
 * @param {Object} [config] - Optional Axios configuration (e.g., headers).
 * @returns {Promise<Object>} - Response data.
 * @throws {Error} - Error if the request fails.
 */
const postRequest = async (url, payload, config = {}) => {
  try {
    const response = await axios.post(url, payload, {
      ...config,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error during POST request:", error.message);
    throw error;
  }
};

// Event: QR Code Generation
client.on("qr", (qr) => {
  console.log("QR Code generated. Scan it with your phone:");
  qrcode.generate(qr, { small: true });
});

// Event: Client Ready
client.on("ready", () => {
  console.log("WhatsApp Client is ready!");
});

// Event: Incoming Messages
client.on("message", async (msg) => {
  try {
    if (msg.body === "report") {
      const transcript = await postRequest(
        `${process.env.AGENT_AI_SERVER}/get-last-transcript`,
        {
          chat_id: msg.from,
        },
      );

      const payload = { fraud_call_transcript: transcript };
      const finalReply = await postRequest(
        "https://api-lr.agent.ai/v1/agent/3z9ylgnmh2sexyvf/webhook/5b0e204e",
        payload,
      );

      return msg.reply(finalReply);
    }

    if ([MessageTypes.AUDIO, MessageTypes.DOCUMENT].includes(msg.type)) {
      msg.reply("Transcribing 👷🏻‍♂️");

      const base64file = await msg.downloadMedia();
      const transcript = await postRequest(
        `${process.env.AGENT_AI_SERVER}/transcribe-audio`,
        {
          file: base64file.data,
        },
      );

      msg.reply(transcript);

      const payload = { fraud_call_transcript: transcript };
      const finalReply = await postRequest(
        "https://api-lr.agent.ai/v1/agent/716m4yphidwvc4rp/webhook/ff0cdeb7",
        payload,
      );

      return msg.reply(finalReply);
    }

    if (msg.type === MessageTypes.TEXT) {
      const payload = { fraud_question: msg.body };
      const finalReply = await postRequest(
        "https://api-lr.agent.ai/v1/agent/gikzi3kaxxsjhkpa/webhook/109cc01c",
        payload,
      );

      return msg.reply(finalReply);
    }
  } catch (error) {
    console.error("Error processing message:", error.message);
    msg.reply(`We encountered an issue: ${error.message}`);
  }
});

// Express Routes
app.get("/", (req, res) => res.status(200).send("We are live!").end());

app.post("/message", async (req, res) => {
  try {
    const { chat_id, message } = req.body;
    await client.sendMessage(chat_id, message);
    res.status(200).send("Message Sent").end();
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).send("Internal Server Error while sending message").end();
  }
});

// Start Express Server
app.listen(3000, () => {
  console.log("Express server listening on port 3000");
});

// Initialize WhatsApp Client
client.initialize();
