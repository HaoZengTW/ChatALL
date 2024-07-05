import AsyncLock from "async-lock";
import Bot from "@/bots/Bot";
import axios from "axios";

function parseResponse(resp) {
  let data = resp.split("\n", "\r");
  data = JSON.parse(data[0][2]);
  if (!data) {
    throw new Error("Failed to parse Bard response");
  }

  const ids = [...data[1], data[4][0][0]];

  let text = data[4][0][1][0];
  const images = data[4][0][4];
  if (images) {
    images.forEach((image) => {
      const url = image[0][0][0];
      const alt = image[0][4];
      const link = image[1][0][0];
      const placeholder = image[2];
      text = text.replace(
        placeholder,
        `[![${alt}](${url})](${link} "${link}")`,
      );
    });
  }

  return { text, ids };
}
export default class ChainRagBase extends Bot {
  static _brandId = "BaseRAG"; // Brand id of the bot, should be unique. Used in i18n.
  static _className = "BaseRAGBot"; // Class name of the bot
  static _logoFilename = "default-logo.svg"; // Place it in public/bots/
  static _loginUrl = "https://example.com/";
  static _lock = new AsyncLock(); // AsyncLock for prompt requests

  constructor() {
    super();
  }

  /**
   * Check whether the bot is logged in, settings are correct, etc.
   * @returns {boolean} - true if the bot is available, false otherwise.
   */
  async _checkAvailability() {
    // Check:
    // 1. Whether the bot is logged in as needed
    // 2. Whether the bot settings are correct (e.g. API key is valid)
    // If yes:
    //   return true;
    // else:
    //   return false;

    return true; // For simplicity, default to true
  }

  /**
   * Send a prompt to the bot and call onResponse(response, callbackParam)
   * when the response is ready.
   * @param {string} prompt
   * @param {function} onUpdateResponse params: callbackParam, Object {content, done}
   * @param {object} callbackParam - Just pass it to onUpdateResponse() as is
   */
  async _sendPrompt(prompt, onUpdateResponse, callbackParam) {
    const context = await this.getChatContext();
    return new Promise((resolve, reject) => {
      axios
        .post("http://127.0.0.1:9000/rag_base/stream", {
          input: "上水有哪些主管",
          config: {},
          kwargs: {},
        })
        .then(({ data: resp }) => {
          const { text, ids } = parseResponse(resp);
          context.contextIds = ids;
          this.setChatContext(context);
          onUpdateResponse(callbackParam, { content: text, done: true });
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Should implement this method if the bot supports conversation.
   * The conversation structure is defined by the subclass.
   * @param null
   * @returns {any} - Conversation structure. null if not supported.
   */
  async createChatContext() {
    return null;
  }
}
