# FraudWatch WhatsApp Chatbot

This project provides a simple and efficient solution for automating interactions with WhatsApp using the `whatsapp-web.js` library. It integrates with external APIs to handle various tasks such as sending messages, transcribing audio files, and responding to user input dynamically.

## Features

- **WhatsApp Client Integration**: Scans a QR code to connect and authenticate the WhatsApp Web client.
- **Automated Message Handling**:
  - Responds to specific text commands (e.g., "report").
  - Processes and transcribes audio or document messages.
  - Interacts with Agent.ai webhooks to generate meaningful responses.
- **Express API**:
  - Endpoint to send messages to WhatsApp chat IDs via HTTP POST requests.
- **External API Integration**:
  - Sends and retrieves data from external APIs for advanced functionality like transcription and fraud reporting.

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v14 or later)
- **Google Chrome or Chromium**
- **npm** (comes with Node.js)

Additionally, you need a `.env` file with the following variables:

```plaintext
AGENT_AI_SERVER=<Your-Agent-AI-Server-URL>
```
