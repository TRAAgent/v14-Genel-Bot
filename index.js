require('dotenv').config();

const fs = require("fs");
const http = require('http');
const express = require('express');
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");
const db = require('croxydb');
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

// Discord Client oluştur
const client = new Client({
  intents: 3276543,
  partials: Object.values(Partials),
  allowedMentions: {
    parse: ["users", "roles", "everyone"]
  },
  retryLimit: 3
});

global.client = client;
client.commands = [];

/* SLASH COMMANDS */
console.log(`[-] ${fs.readdirSync("./commands").length} komut algılandı.`);

for (let commandName of fs.readdirSync("./commands")) {
  if (!commandName.endsWith(".js")) continue;

  const command = require(`./commands/${commandName}`);
  client.commands.push({
    name: command.name.toLowerCase(),
    description: command.description.toLowerCase(),
    options: command.options,
    dm_permission: false,
    type: 1
  });

  console.log(`[+] ${commandName} komutu başarıyla yüklendi.`);
}

/* EVENTS */
console.log(`[-] ${fs.readdirSync("./events").length} olay algılandı.`);

for (let eventName of fs.readdirSync("./events")) {
  if (!eventName.endsWith(".js")) continue;

  const event = require(`./events/${eventName}`);
  client.on(event.name, (...args) => {
    event.run(client, ...args);
  });

  console.log(`[+] ${eventName} olayı başarıyla yüklendi.`);
}

/* Slash Komutları Yükle */
client.once("ready", async () => {
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: client.commands,
    });
    console.log(`Slash komutlar yüklendi.`);
  } catch (error) {
    console.error(error);
  }
});

/* Express Uptime Sunucusu */
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot çalışıyor!');
});

app.listen(PORT, () => {
  console.log(`Uptime server ${PORT} portunda çalışıyor.`);
});

/* Kendini pingle */
setInterval(() => {
  http.get('https://profuse-halved-oriole.glitch.me', res => {
    console.log(`Kendini pingledi, durum kodu: ${res.statusCode}`);
  }).on('error', err => {
    console.error('Ping hatası:', err.message);
  });
}, 270000); // 4.5 dakika

/* Discord bot login */
client.login(process.env.TOKEN).then(() => {
  console.log(`[-] Discord API'ye istek gönderiliyor.`);
}).catch(() => {
  console.log(`[x] Discord API'ye istek gönderimi başarısız (token yok veya hatalı).`);
});
