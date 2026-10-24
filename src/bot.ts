import "dotenv/config";
import { Bot } from "grammy";

const token = process.env.BOT_TOKEN?.trim();
if (!token) {
  console.error("Configura BOT_TOKEN en .env para iniciar el bot de Telegram.");
  process.exit(1);
}

const bot = new Bot(token);

function getMiniAppUrl(): string | null {
  const configured = process.env.MINI_APP_URL?.trim();
  if (!configured) return null;
  try {
    const url = new URL(configured);
    if (url.protocol !== "https:") return null;
    if (url.hostname === "example.com" || url.hostname.endsWith(".example.com")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

bot.command("start", async ctx => {
  const miniAppUrl = getMiniAppUrl();
  if (!miniAppUrl) {
    await ctx.reply(
      "✦ UMBRA: Card Frontier\nEl bot está iniciado, pero la Mini App todavía no tiene una URL HTTPS configurada. No se ha creado un botón de acceso falso."
    );
    return;
  }

  await ctx.reply(
    "✦ UMBRA: Card Frontier\nTu archivo de leyendas está despertando.",
    {
      reply_markup: {
        inline_keyboard: [[{ text: "Abrir UMBRA", web_app: { url: miniAppUrl } }]]
      }
    }
  );
});

bot.command("help", ctx => ctx.reply("Comandos:\n/start — abrir UMBRA\n/help — ayuda"));
bot.catch(error => console.error("Error del bot:", error.message));
bot.start();
