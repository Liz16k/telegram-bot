const { Scenes, Markup } = require("telegraf");
const { cafeSearch } = require("../../services/recommendService");

const cafeScene = new Scenes.BaseScene("cafe");
cafeScene.enter(async (ctx) => {
  try {
    ctx.reply(
      "Поделитесь своим местоположением",
      Markup.keyboard([
        Markup.button.locationRequest("Отправить местоположение"),
      ])
        .resize()
        .oneTime()
    );
  } catch (error) {
    console.log(error.message);
  }
});

cafeScene.on("message", async (ctx) => {
  try {
    if (ctx.message.location) {
      const { latitude: lat, longitude: lon } = ctx.message.location;
      const data = await cafeSearch({ lat, lon });

      ctx.reply("Данные загружаются...");
      ctx.reply("Ближайшие кафе:");

      for (const place of data.entries()) {
        const { formatted, distance } = place.properties;
        await ctx.replyWithHTML(` 🥞 <b>${formatted}</b>\n${distance}м`);
      }

      return await ctx.scene.leave();
    } else {
      ctx.reply("Отправьте свое местоположение");
    }
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = { cafeScene };