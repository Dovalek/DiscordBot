const { Client, Intents, Collection } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, clientId, guildId } = require('./config.json');
const fs = require('fs');
const commands = [];
const commandFiles = fs.readdirSync('./COMMANDS').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./COMMANDS/${file}`);
	commands.push(command.data.toJSON());
	client.commands.set(command.data.name, command);
	console.log(`${file}`)
}
const rest = new REST({ version: '9' }).setToken(token);
client.once('ready', () => {
	console.log('Ready!')});
client.login(token);
(async () => {
	try {
		console.log('Started refreshing application (/) commands.');
		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);
		console.log('Successfully reloaded application (/) commands.')} 
	catch (error) {console.error(error);}
})();
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {await command.execute(interaction)}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })}
});
