import { Client, EmbedBuilder, Events } from "discord.js";

// TODO: crear interfaz o algo parecido para la función de registro de una feature
export default function (client: Client) {
	client.on(Events.MessageCreate, (message) => {
		if (message.author.bot) return;
		if (message.content.toLowerCase().includes("ayaya")) {
			const ayaya = new EmbedBuilder()
				.setTitle("AYAYAAAA")
				.setImage("https://media1.tenor.com/m/n-UEUl1g18QAAAAd/ayaya-saturated-triggered-scream.gif");

			message.channel.send({ embeds: [ayaya] });
		}
	});
}
