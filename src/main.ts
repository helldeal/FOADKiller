import { app, BrowserWindow, ipcMain, desktopCapturer } from "electron";
import path from "path";
import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("list-sources", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen", "window"],
  });
  return sources.map((s) => ({ id: s.id, name: s.name }));
});

ipcMain.handle("ask-gpt", async (_event, { text, question }) => {
  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content:
          "Tu es un assistant qui aide à répodre aux questions basées sur du texte OCR extrait d'images.",
      },
      {
        role: "user",
        content: `Texte OCR : ${text}\n\nQuestion : ${question}`,
      },
    ],
  });
  return response;
});
