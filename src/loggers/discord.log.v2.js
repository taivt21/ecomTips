"use strict";
const { Client, GatewayIntentBits } = require("discord.js");
const { CHANEL_ID_DISCORD, TOKEN_DISCORD } = process.env;

class LoggerService {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.client.on("messageCreate", (message) => {
      console.log(`Received message: ${message.content}`);

      // Xử lý tin nhắn ở đây (ví dụ: gửi tin nhắn phản hồi)
    });

    this.client.on("error", (error) => {
      console.error(`Bot encountered an error: ${error}`);
    });

    //add chanelId
    this.channelId = CHANEL_ID_DISCORD;

    this.client.on("ready", () => {
      console.log(`Logged is as ${this.client.user.tag}!`);
    });
    this.client.login(TOKEN_DISCORD);
  }

  sendToFormatCode(logData) {
    const {
      code,
      message = "This is some info",
      title = "Code exam",
    } = logData;

    // if(1 === 1){  //prudct and dev
    // }
    const codeMessage = {
      content: message,
      embeds: [
        {
          color: parseInt("00ff00", 16), //convert hex color code to integer
          title,
          description: "```json\n" + JSON.stringify(code, null, 2) + "\n```",
        },
      ],
    };
    this.sendToMessage(codeMessage);
  }

  sendToMessage(message = "message") {
    const channel = this.client.channels.cache.get(this.channelId);
    if (!channel) {
      console.error(`Could not find the channel...`, this.channelId);
      return;
    }

    //message use chat gpt api call
    channel.send(message).catch((e) => console.error(e));
  }
}

module.exports = new LoggerService();
