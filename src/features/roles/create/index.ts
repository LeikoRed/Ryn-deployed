import fetch from "node-fetch";
import { generateRandomColorResolvable } from "@/utils/colors";
import { Client, Events, AttachmentBuilder, EmbedBuilder, TextChannel } from "discord.js";
import { createCanvas, Canvas, CanvasRenderingContext2D, loadImage } from "canvas";
import sharp from "sharp";

export default function (client: Client) {
  client.once(Events.ClientReady, () => {
    setInterval(() => {
      client.guilds.cache.forEach((guild) => {
        guild.roles.cache.forEach((role) => {
          if (role.name.startsWith("dropsaia")) {
            role.edit({ color: generateRandomColorResolvable() });
          }
        });
      });
    }, 1000 * 10);
  });

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith("!rolecreate")) {
      const name = message.content.slice("!rolecreate".length).trim();
      if (!name) {
        message.reply("debes de poner un nombre para el role");
        return;
      }
      const role = await message.guild!.roles.create({
        name: name,
        color: generateRandomColorResolvable(),
      });
      message.reply(`el role ${role.name} ha sido creado`);
    }
  });

  const channelIds = [
    "883145300787753000",
    "883145327442550825",
    "925158820945223720",
    "1165519948664283296",
    "884627776576053298",
    "884627846386032720",
    "970478274109116466",
    "970478392036184165",
    "987880771492675664",
    "883150434657763338",
    "929926209415032873",
    "908409171387510804",
  ];
  const allowedChannelId = "1276648776869613690";
  const phrases: string[] = [
    "¿Saben que hay **rifa** activa?",
    "Sabes que eres de **dinámicas** cuando tienes **dislexia**.",
    "Amando a Nekotina con los **panas**.",
    "A veces, lo único que necesito es una siesta de 14 horas.",
    "El chocolate no te hace preguntas, el chocolate te entiende.",
    "Para sorteos ganar, un **baño** no hay que dar.",
  ];
  const allowedRoleId = "1276647485032628315";
  let correctPhrase: string | null = null;
  let challengeChannelId: string | null = null;
  let firstResponderId: string | null = null;
  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    if (message.content === "-start") {
      if (!message.member?.roles.cache.has(allowedRoleId)) {
        return;
      }
      if (message.channel.id !== allowedChannelId) {
        return;
      }
      const randomChannelId = channelIds[Math.floor(Math.random() * channelIds.length)];
      const randomChannel = (await client.channels.fetch(randomChannelId)) as TextChannel;
      correctPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      const embed = new EmbedBuilder().setTitle("¡Desafío!").setDescription(correctPhrase).setFooter({ text: "-responder <frase exacta>" });
      await randomChannel.send({ embeds: [embed] });
      challengeChannelId = randomChannelId;
      firstResponderId = null;
      message.channel.send(`El desafío ha sido enviado a <#${randomChannelId}>.`);
    }
    if (message.content.startsWith("-responder")) {
      if (challengeChannelId === null) {
        return message.channel.send("No se ha iniciado ningún desafío.");
      }
      const userResponse = message.content.replace("-responder ", "").trim();
      if (userResponse === correctPhrase) {
        if (firstResponderId === null) {
          firstResponderId = message.author.id;
          try {
            const challengeChannel = (await client.channels.fetch(challengeChannelId)) as TextChannel;
            await challengeChannel.send(`${message.author} ¡Felicidades! Has ganado el desafío.`);
          } catch (error) {
            console.error("Error al enviar el mensaje de felicitación:", error);
            message.channel.send("Hubo un error al enviar el mensaje de felicitación. Inténtalo de nuevo.");
          }
        }
      } else {
        message.channel.send("Lo siento, la frase es incorrecta. Inténtalo de nuevo.");
      }
    }
  });

  client.on(Events.MessageCreate, async (message) => {
    if (message.content.startsWith("!user")) {
      try {
        // Obtén el usuario mencionado o el autor del mensaje
        const user = message.mentions.users.first() || message.author;

        // Crea un canvas
        const canvas = createCanvas(1018, 468);
        const contexto = canvas.getContext("2d");

        try {
          // Carga la imagen de fondo
          const backgroundUrl = "https://i.imgur.com/2v8gfP2.png"; // URL de imagen pública
          const background = await loadImage(backgroundUrl);
          contexto.drawImage(background, 0, 0, canvas.width, canvas.height);
        } catch (error) {
          console.error("Error al cargar la imagen de fondo:", error);
          message.channel.send("No se pudo cargar la imagen de fondo.");
          return; // Salir del comando si hay un error con la imagen de fondo
        }

        try {
          // Configura el texto
          contexto.fillStyle = "#ffffff";
          contexto.font = "100px Arial";
          contexto.fillText(`${user.username}`, 460, 260);
        } catch (error) {
          console.error("Error al configurar el texto:", error);
          message.channel.send("No se pudo configurar el texto en la imagen.");
          return; // Salir del comando si hay un error con el texto
        }

        // Configura el avatar
        try {
          contexto.beginPath();
          contexto.arc(247, 238, 175, 0, Math.PI * 2, true);
          contexto.closePath();
          contexto.clip();
        } catch (error) {
          console.error("Error al configurar el contexto para el avatar:", error);
          message.channel.send("No se pudo configurar el contexto para el avatar.");
          return; // Salir del comando si hay un error con el contexto
        }
        const buffer = canvas.toBuffer();
        try {
          const avatarUrl = user.displayAvatarURL({ size: 1024 }); // Asegúrate de especificar el formato y el tamaño
          console.log("Avatar URL:", avatarUrl);
          const response = await fetch(avatarUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const avatarBuffer = await response.buffer(); // Usa .buffer() para obtener un Buffer
          const avatarPngBuffer = await sharp(avatarBuffer).toFormat("png").toBuffer();
          const avatar = await loadImage(avatarPngBuffer);
          console.log("Avatar:", avatar);
          contexto.drawImage(avatar, 72, 63, 350, 350);
        } catch (error) {
          console.error("Error al cargar o dibujar el avatar:", error);
          message.channel.send("No se pudo cargar el avatar del usuario.");
          return; // Salir del comando si hay un error con el avatar
        }

        try {
          // Convierte el canvas a un buffer de imagen
          const buffer = canvas.toBuffer();

          // Crea un attachment con el buffer
          const attachment = new AttachmentBuilder(buffer, { name: "usuario.png" });

          // Envía el attachment al canal
          await message.channel.send({ files: [attachment] });
        } catch (error) {
          console.error("Error al convertir el canvas a buffer o enviar el attachment:", error);
          message.channel.send("Hubo un problema al procesar la imagen.");
        }
      } catch (error) {
        console.error("Error general en el comando:", error);
        message.channel.send("Hubo un problema al procesar el comando.");
      }
    }
  });
}
