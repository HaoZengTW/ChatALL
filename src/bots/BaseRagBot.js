import AsyncLock from "async-lock";
import Bot from "@/bots/Bot";
import axios from "axios";

export default class BaseRagBot extends Bot {
  static _brandId = "BaseRag"; // Brand id of the bot, should be unique. Used in i18n.
  static _className = "BaseRagBot"; // Class name of the bot
  static _logoFilename = "openai-4o-logo.png"; // Place it in public/bots/
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
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          await axios
            .post("http://127.0.0.1:9000/rag_base/invoke", {
              input: prompt,
              config: {},
              kwargs: {},
            })
            .then((res) => {
              console.log(res);
              let content = res.data.output;
              onUpdateResponse(callbackParam, { content, done: true });
              resolve();
            });
        } catch (err) {
          reject(err);
        }
      })();
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
