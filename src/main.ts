import env from "@env";
import client from "./client";
import { Events } from "discord.js";
import fs from "fs";

function main() {
	const featuresDir = fs.readdirSync(__dirname + "/features");
	featuresDir.forEach((featureGroupRoute) => {
		const featuresDir = fs.readdirSync(__dirname + `/features/${featureGroupRoute}`);
		featuresDir.forEach(async (featureRoute) => {
			// reads each feature directory, import module and inject the client module
			(await import(`./features/${featureGroupRoute}/${featureRoute}`)).default(client);
		});
	});

	client.once(Events.ClientReady, (currentClient) => {
		console.log(`Logged in as ${currentClient.user.tag}`);
	});

	client.login(env.APP_TOKEN);
}
main();
