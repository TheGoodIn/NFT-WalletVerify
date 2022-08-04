const messages = require("../utils/messages");
const Discord = require('discord.js')
var request = require('request');
const web3 = require('web3')
const fs = require('fs')
module.exports = {

    description: 'Add a contract to sync with the bots verification',

    options: [
        {
            name: 'contract',
            description: 'Enter the ETH Contract Address',
            type: 'STRING',
            required: true
        },
        {
            name: 'role',
            description: 'Tag the role you want users to gain when verifying',
            type: 'ROLE',
            required: true
        },
        {
            name: 'channel',
            description: 'Tag the channel you want for the bot to post the verification message',
            type: 'CHANNEL',
            required: true
        }
    ],

    run: async (client, interaction) => {

        if(!interaction.member.permissions.has('MANAGE_MESSAGES')){
            return interaction.reply({
                content: ':x: You need to have the manage messages permissions to edit settings.',
                ephemeral: true
            });
        }

        // If the member doesn't have enough permissions
  
    
        const contract = interaction.options.getString('contract');
        const roleid = interaction.options.getRole('role');
        const channelid = interaction.options.getChannel('channel');

    
        if(web3.utils.isAddress(contract) == true){
         
    
          
    
          let rawdata = fs.readFileSync("data.json");
          let infoset = JSON.parse(rawdata);
        
          var result = infoset.Data.filter(
            (obj) => obj.contractcombine == `${contract}_${interaction.guild.id}`
          );
        
          const isEmpty = Object.keys(result).length === 0;
          if(isEmpty == false){
            const embed = new Discord.MessageEmbed()
            .setTitle('Setup Fail.') 
            .setDescription(`This contract is already linked`)
            .setColor('#2f3136')
          return interaction.reply({ embeds: [embed], ephemeral: true })
          }
          if (isEmpty == true) {

            fs.readFile('data.json', async function (err, dataz) {
                var jsontemp = JSON.parse(dataz)
  
            jsontemp.Data.push({ "contractcombine": `${contract}_${interaction.guild.id}`, "guildid": interaction.guild.id, "roleid": roleid.id, "contract": contract})
            fs.writeFileSync("data.json", JSON.stringify(jsontemp))
            });
          
           
            const embed = new Discord.MessageEmbed()
            .setTitle('Setup Done.') 
            .setDescription(`Linked <@&${roleid.id}> to ${contract}`)
            .setColor('#2f3136')
          interaction.reply({ embeds: [embed], ephemeral: true })
        
          const Embed = new Discord.MessageEmbed()
          .setTitle(`Wallet Verification`)
          .setDescription(`Click the button below to verify your wallet holdings`)
          .setColor('#2f3136')
      
          const Row = new Discord.MessageActionRow();
          Row.addComponents(
              new Discord.MessageButton()
              .setCustomId("start-verify")
              .setStyle('SECONDARY')
              .setLabel(`Start Verification`)
          )
      
       client.channels.cache.get(channelid.id).send({ embeds: [Embed], components: [Row]})
        }
    }
             
        
                
              
          
        
          
     
        
         
        
        if(web3.utils.isAddress(contract) == false){
            const failembed = new Discord.MessageEmbed()
            .setTitle(`Sorry that Address isn't valid`)
            .setFooter(`Please try again. Only ETH Addresses work`)
            .setColor('#2f3136')
            return interaction.reply({embeds: [failembed], ephemeral: true });
       
        }
        

    }
};
