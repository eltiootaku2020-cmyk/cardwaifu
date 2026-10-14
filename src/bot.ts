import "dotenv/config";
import { Bot } from "grammy";
const token=process.env.BOT_TOKEN;if(!token){console.error("Configura BOT_TOKEN en .env");process.exit(1);}
const bot=new Bot(token);
bot.command("start",ctx=>ctx.reply("✦ UMBRA: Card Frontier\nTu archivo de leyendas está despertando. La Mini App sigue en desarrollo.",{reply_markup:{inline_keyboard:[[{text:"Abrir UMBRA",web_app:{url:process.env.MINI_APP_URL??"https://example.com"}}]]}}));
bot.command("help",ctx=>ctx.reply("Comandos:\n/start — abrir UMBRA\n/help — ayuda"));
bot.catch(err=>console.error("Error del bot:",err.message));bot.start();
