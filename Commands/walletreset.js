const messages = require("../utils/messages");
const Discord = require('discord.js')
var request = require('request');
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: 'data.sqlite' });
module.exports = {

    description: 'Deletes Account in our System',

 

    run: async (client, interaction) => {

        if(!interaction.member.permissions.has('MANAGE_MESSAGES')){
            return interaction.reply({
                content: ':x: You need to have the manage messages permissions to start giveaways.',
                ephemeral: true
            });
        }

        await db.delete(`verify_${interaction.user.id}`)
        // If the member doesn't have enough permissions
  
        const embed = new Discord.MessageEmbed()

        .setTitle('Wallet Successfully Reset.') 
        .setDescription('You are now able to relink your wallet.')
        .setColor('#2f3136')
        interaction.reply({ embeds: [embed], ephemeral: true })
    
      
        

    }
};
