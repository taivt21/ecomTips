"use strict";

const { Client, GatewayIntentBits } = require("discord.js");

const { CHANEL_ID_DISCORD, TOKEN_DISCORD } = process.env;

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`Logged is as ${client.user.tag}!`);
});

client.login(TOKEN_DISCORD);

client.on("messageCreate", (message) => {
  console.log(`Received message: ${message.content}`);

  if (message.author.bot) return;
  if (message.content === "hello") {
    console.log(`Replying to "hello" message.`);
    message.reply(`Hello! How can I assist you?`);
  }
});

client.on("error", (error) => {
  console.error(`Bot encountered an error: ${error}`);
});
