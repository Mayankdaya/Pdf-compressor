import { Client, GatewayIntentBits } from 'discord.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the user has setup the .env file with correct tokens
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!DISCORD_TOKEN) {
  console.log('⚠️ [ERROR] DISCORD_TOKEN is missing in your .env file!');
  console.log('Skipping Discord Bot initialization. Web server will continue to run.');
} else if (!GEMINI_API_KEY) {
  console.log('⚠️ [ERROR] GEMINI_API_KEY is missing in your .env file!');
  console.log('Skipping Discord Bot initialization. Web server will continue to run.');
} else {

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "You are a highly capable AI assistant like J.A.R.V.I.S. You speak in a mix of Hindi and English (Hinglish), address the user respectfully as 'Boss' or 'Bhai', and are extremely helpful, witty, and smart. You are an expert in coding, automation, and handling technical tasks."
});

// Create Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// Chat history to maintain context
const chatHistory = [];

client.on('ready', () => {
  console.log(`🚀 [SUCCESS] System Online! Logged in as ${client.user.tag}`);
  console.log(`🤖 AI Brain Connected. J.A.R.V.I.S mode is active. Waiting for commands on Discord...`);
});

client.on('messageCreate', async (message) => {
  // Ignore messages from other bots
  if (message.author.bot) return;

  // Let the user know the AI is "typing"
  await message.channel.sendTyping();

  try {
    const prompt = message.content;
    
    // Create chat session or use existing
    const chat = model.startChat({
      history: chatHistory.length > 0 ? chatHistory : [
         {
           role: "user",
           parts: [{ text: "Hello, tum kon ho?" }],
         },
         {
           role: "model",
           parts: [{ text: "Main aapka personal AI assistant hoon, Boss! Main ek J.A.R.V.I.S ki tarah kaam karta hoon. Boliye, aaj kya code likhna hai ya automate karna hai?" }],
         },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.9,
      },
    });

    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();

    // Save to history (keep recent 10 messages)
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    chatHistory.push({ role: "model", parts: [{ text: responseText }] });
    if(chatHistory.length > 20) chatHistory.splice(0, 2);

    // Discord has a 2000 character limit per message
    if (responseText.length > 2000) {
      const chunks = responseText.match(/[\\s\\S]{1,1999}/g) || [];
      for (const chunk of chunks) {
         await message.channel.send(chunk);
      }
    } else {
      await message.reply(responseText);
    }

  } catch (error) {
    console.error("AI Error:", error);
    await message.reply("Sorry boss, mere brain (AI Engine) mein abhi kuch issue aagaya hai. Zara system check kijiye.");
  }
});

// Login to Discord
client.login(DISCORD_TOKEN);
}
