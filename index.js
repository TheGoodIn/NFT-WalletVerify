const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client({ intents: 32767 }); // Create a Discord Client
const discordModals = require('discord-modals'); // Define the discord-modals package!
discordModals(client); 
const { Modal, TextInputComponent, SelectMenuComponent } = require('discord-modals'); // Import all
const web3 = require('web3')
const delay = ms => new Promise(res => setTimeout(res, ms));
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'data.sqlite' });
const request = require('request')
const synchronizeSlashCommands = require('discord-sync-commands');

const openseamodal = new Modal() // We create a Modal
.setCustomId('opensea-modal')
.setTitle(`OpenSea Wallet Address Submit`)
.addComponents(
  new TextInputComponent() // We create a Text Input Component
  .setCustomId('wallet')
  .setLabel(`What is your wallet address?`)
  .setPlaceholder('0x....')
  .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
  .setRequired(true), // If it's required or not
);

const looksraremodal = new Modal() // We create a Modal
.setCustomId('looksrare-modal')
.setTitle(`Looksrare Wallet Address Submit`)
.addComponents(
  new TextInputComponent() // We create a Text Input Component
  .setCustomId('wallet')
  .setLabel(`What is your wallet address?`)
  .setPlaceholder('0x....')
  .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
  .setRequired(true), // If it's required or not
);




const config = require('./config.json');
const { info } = require('console');
client.config = config;
client.commmands = new Discord.Collection();
client.buttons = new Discord.Collection();
client.context = new Discord.Collection();
client.events = new Discord.Collection();

///const Handlers = ["Events", "Commands", "Buttons", "Context", "Database"];
///Handlers.forEach(
  ///  async (Handlers) => await require(`./Handlers/${Handlers}`)(client, Ascii, PG)
///);

client.commands = new Discord.Collection();
fs.readdir("./commands/", (_err, files) => {
    files.forEach((file) => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        client.commands.set(commandName, {
            name: commandName,
            ...props
        });
        console.log(`👌 Command loaded: ${commandName}`);
    });
    synchronizeSlashCommands(client, client.commands.map((c) => ({
        name: c.name,
        description: c.description,
        options: c.options,
        type: 'CHAT_INPUT'
    })), {
        debug: true,
        guildId: config.guildId
    });
});
fs.readdir("./events/", (_err, files) => {
  files.forEach((file) => {
      if (!file.endsWith(".js")) return;
      const event = require(`./events/${file}`);
      let eventName = file.split(".")[0];
      console.log(`👌 Event loaded: ${eventName}`);
      client.on(eventName, event.bind(null, client));
      delete require.cache[require.resolve(`./events/${file}`)];
  });
});



client.on('interactionCreate', async interaction => {
    if(interaction.customId == "opensea"){
      discordModals.showModal(openseamodal, {
        client: client, // Client to show the Modal through the Discord API.
        interaction: interaction // Show the modal with interaction data.
      });
    }
    if(interaction.customId == "looksrare"){
      discordModals.showModal(looksraremodal, {
        client: client, // Client to show the Modal through the Discord API.
        interaction: interaction // Show the modal with interaction data.
      });
    }

    if(interaction.customId == "start-verify"){
      
      let rawdata = fs.readFileSync("data.json");
        let infoset = JSON.parse(rawdata);
      
        var result = infoset.Data.filter(
          (obj) => obj.guildid == interaction.guild.id
        );
       
        const isEmpty = Object.keys(result).length === 0;

        if(isEmpty){
          const Embed1 = new Discord.MessageEmbed()
          .setTitle('Server Error')
          .setDescription('Server isn\'t setup correct. Contact a server admin')
          .setColor('#2f3136')
          return interaction.reply({embeds: [Embed1], ephemeral: true })
        }
      console.log(interaction.user.id)
    const dbcheck = await db.get(`verify_${interaction.user.id}`)
      if (dbcheck == null || dbcheck.verify == false) {
        const Embed1 = new Discord.MessageEmbed()
        .setTitle('Pick your trading platform')
        .setDescription('Below click the button of the platform you want to verify your wallet address on.')
        .setColor('#2f3136')
        const Row = new Discord.MessageActionRow();
        Row.addComponents(
            new Discord.MessageButton()
            .setCustomId("opensea")
            .setStyle('SECONDARY')
            .setLabel(`Verify OpenSea`),
            new Discord.MessageButton()
            .setCustomId("looksrare")
            .setStyle('SECONDARY')
            .setLabel(`Verify LooksRare`),
        )
        interaction.reply({embeds: [Embed1], components: [Row], ephemeral: true });
      }else {

        
        var options2 = {
          'method': 'GET',
          'url': `https://api.reservoir.tools/users/${dbcheck.address}/tokens/v2?collection=${result[0].contract}&sortDirection=desc&offset=0&limit=20`,
          'headers': {
            'x-api-key': config.reservoirAPIKey
          }
        };
        request(options2, async function (error2, response2) {
          const json2 = await JSON.parse(response2.body)
          if(json2.tokens.length == 0){
            const embedfail = new Discord.MessageEmbed()
            .setTitle('❌ Failed!')
            .setDescription(`${dbcheck.address} has succesfully been verified using OpenSea.\nSadly, you don't hold any of the tokens\n\nIf you want to switch addresses, use /walletreset`)
            .setColor('#2f3136')
            
            await interaction.reply({embeds: [embedfail], ephemeral: true });
          
          }else{
            const embedworks = new Discord.MessageEmbed()
            .setTitle('✅ Success!')
            .setDescription(`Wallet: ${dbcheck.address}\n Holdings: ${json2.tokens.length} Tokens\nRole Added: <@&${result[0].roleid}>\n\nIf you want to switch addresses, use /walletreset`)
            .setColor('#2f3136')

            interaction.member.roles.add("1002448322105180161")
            await interaction.reply({embeds: [embedworks], ephemeral: true });
          }
          });
      }
    }
    if(interaction.customId == "start"){
        discordModals.showModal(modal, {
            client: client, // Client to show the Modal through the Discord API.
            interaction: interaction // Show the modal with interaction data.
          });
    }

    if(interaction.customId == "opensea-verifycheck"){
      let rawdata = fs.readFileSync("data.json");
      let infoset = JSON.parse(rawdata);
    
      var result = infoset.Data.filter(
        (obj) => obj.guildid == interaction.guild.id
      );
     
      const dbinfo = await db.get(`verify_${interaction.user.id}`)
      const embedload = new Discord.MessageEmbed()
      .setTitle('Loading...')
      .setDescription(`Please wait while we process your request\n\nEstimated Wait Time: 5-10 Seconds\n`)
      .setColor('#2f3136')

      const message = await interaction.reply({embeds: [embedload], ephemeral: true });


      var options = {
        'method': 'GET',
        'url': `https://api.modulenft.xyz/api/v1/opensea/user/info?user=${dbinfo.address}`,
        'headers': {
          'x-bypass-cache': 'true',
          'x-api-key': config.moduleAPIKey
        }
      };
      request(options, async function (error, response) {
        if(error)return console.log(response.body)
        const json = await JSON.parse(response.body)
        console.log(json)
        if(!json.error){
          if(json.info.bio.includes(dbinfo.code)){
            var options2 = {
              'method': 'GET',
              'url': `https://api.reservoir.tools/users/${dbinfo.address}/tokens/v2?collection=${result[0].contract}&sortDirection=desc&offset=0&limit=20`,
              'headers': {
                'x-api-key': config.reservoirAPIKey
              }
            };
            request(options2, async function (error2, response2) {
              const json2 = await JSON.parse(response2.body)
              if(json2.tokens.length == 0){
                const embedfail = new Discord.MessageEmbed()
                .setTitle('❌ Failed!')
                .setDescription(`${dbinfo.address} has succesfully been verified using OpenSea.\nSadly, you don't hold any of the tokens\n `)
                .setColor('#2f3136')
                
                await interaction.editReply({embeds: [embedfail], ephemeral: true });
              
              }else{
                const embedworks = new Discord.MessageEmbed()
                .setTitle('✅ Success!')
                .setDescription(`Wallet: ${dbinfo.address}\n Holdings: ${json2.tokens.length} Tokens\nRole Added: <@&${result[0].roleid}>`)
                .setColor('#2f3136')

                interaction.member.roles.add(result[0].roleid)
                await db.set(`verify_${interaction.user.id}.verify`, true)
                await interaction.editReply({embeds: [embedworks], ephemeral: true });
              }
            });
            
          }
        }
      });

  }

  if(interaction.customId == "looksrare-verifycheck"){
    let rawdata = fs.readFileSync("data.json");
    let infoset = JSON.parse(rawdata);
  
    var result = infoset.Data.filter(
      (obj) => obj.guildid == interaction.guild.id
    );
   
    const dbinfo = await db.get(`verify_${interaction.user.id}`)
    const embedload = new Discord.MessageEmbed()
    .setTitle('Loading...')
    .setDescription(`Please wait while we process your request\n\n Estimated Wait Time: 5-10 Seconds`)
    .setColor('#2f3136')

    const message = await interaction.reply({embeds: [embedload], ephemeral: true });


    var options = {
      'method': 'GET',
      'url': `https://api.modulenft.xyz/api/v1/looksrare/user/info?user=${dbinfo.address}`,
      'headers': {
        'x-bypass-cache': 'true',
        'x-api-key': config.moduleAPIKey
      }
    };
    request(options, async function (error, response) {
      if(error)return console.log(response.body)
      const json = await JSON.parse(response.body)
      console.log(json)
      if(!json.error){
        if(json.info.bio.includes(dbinfo.code)){
          var options2 = {
            'method': 'GET',
            'url': `https://api.reservoir.tools/users/${dbinfo.address}/tokens/v2?collection=${result[0].contract}&sortDirection=desc&offset=0&limit=20`,
            'headers': {
              'x-api-key': config.reservoirAPIKey
            }
          };
          request(options2, async function (error2, response2) {
            const json2 = await JSON.parse(response2.body)
            if(json2.tokens.length == 0){
              const embedfail = new Discord.MessageEmbed()
              .setTitle('❌ Failed!')
              .setDescription(`${dbinfo.address} has succesfully been verified using OpenSea.\nSadly, you don't hold any of the tokens\n `)
              .setColor('#2f3136')
              
              await interaction.editReply({embeds: [embedfail], ephemeral: true });
            
            }else{
              const embedworks = new Discord.MessageEmbed()
              .setTitle('✅ Success!')
              .setDescription(`Wallet: ${dbinfo.address}\n Holdings: ${json2.tokens.length} Tokens\nRole Added: <@&${result[0].contract}>`)
              .setColor('#2f3136')

              interaction.member.roles.add(result[0].contract)
              await db.set(`verify_${interaction.user.id}.verify`, true)
              await interaction.editReply({embeds: [embedworks], ephemeral: true });
            }
          });
          
        }
      }
    });

}


});

client.on('modalSubmit', async (modal) => {
    if(modal.customId == "opensea-modal"){
      const walletResponse = modal.getTextInputValue('wallet');

      if(web3.utils.isAddress(walletResponse) == false){
        const failembed = new Discord.MessageEmbed()
        .setTitle(`Sorry that Address isn't valid`)
        .setFooter(`Please try again. ENS will not work`)
        .setColor('#2f3136')
        return modal.reply({embeds: [failembed], ephemeral: true });

      }

      const testing = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
      const verifystring = `VerifyWallet-${testing}`
      const embed2 = new Discord.MessageEmbed()
      .setTitle(`${walletResponse} Wallet Verification`)
      .setDescription(`Set your OpenSea Bio to the below text to verify your wallet holdings.\nClick **Complete** below after updating your bio.\n\n \`\`\`${verifystring}\`\`\``)
      .setColor('#2f3136')
      await db.set(`verify_${modal.user.id}`, { verify: false, code: verifystring, address: walletResponse})

      const Row = new Discord.MessageActionRow();
      Row.addComponents(
          new Discord.MessageButton()
          .setCustomId("opensea-verifycheck")
          .setStyle('SECONDARY')
          .setLabel(`Complete`)
      )
      modal.reply({embeds: [embed2], components: [Row], ephemeral: true });
    }

    if(modal.customId == "looksrare-modal"){
      const walletResponse = modal.getTextInputValue('wallet');

      if(web3.utils.isAddress(walletResponse) == false){
        const failembed = new Discord.MessageEmbed()
        .setTitle(`Sorry that Address isn't valid`)
        .setFooter(`Please try again. ENS will not work`)
        .setColor('#2f3136')
        return modal.reply({embeds: [failembed], ephemeral: true });

      }

      const testing = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
      const verifystring = `VerifyWallet-${testing}`
      const embed2 = new Discord.MessageEmbed()
      .setTitle(`${walletResponse} Wallet Verification`)
      .setDescription(`Set your Looksrare Bio to the below text to verify your wallet holdings.\nClick **Complete** below after updating your bio.\n\n \`\`\`${verifystring}\`\`\``)
      .setColor('#2f3136')
      await db.set(`verify_${modal.user.id}`, { verify: false, code: verifystring, address: walletResponse})

      const Row = new Discord.MessageActionRow();
      Row.addComponents(
          new Discord.MessageButton()
          .setCustomId("looksrare-verifycheck")
          .setStyle('SECONDARY')
          .setLabel(`Complete`)
      )
      modal.reply({embeds: [embed2], components: [Row], ephemeral: true });
    }

    
  });
  
client.login(config.token);