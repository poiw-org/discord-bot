const {prefix,color} = require('../Configs/botconfig.json')
const discord = require('discord.js')
const config = require('../Managers/configManager')()

const error = require('../Utils/error')
const path = require('path')
const db = require('quick.db');
const request = require(`request`);
const fs = require(`fs`);
const rssParser = require('../Utils/Parsers/rss')
const emojis = require('../Configs/emojis.json')


module.exports = {
    name: "message",
    execute: async(bot) => {
        bot.on('message',(msg) => {
            parseMiddleware(msg,bot)
            let message = msg.content
            if(!message.startsWith(prefix)) return
            let args = message.slice(prefix.length).trim().split(' ')
            let cmdName = args.shift().toLowerCase()
            let commandToExecute = bot.commands.get(cmdName) || Array.from(bot.commands.values()).find(cmdFile => cmdFile.aliases && cmdFile.aliases.map(alias => alias.toLowerCase()).includes(cmdName.toLowerCase()))
            if(commandToExecute){
                msg.delete()
                let permissions = db.has("Permissions") ? db.get("Permissions") : {}
                if(!permissions[msg.author.id]){
                    db.set(`Permissions.${msg.author.id}`,{perm:1})
                }
                let userPerm = db.has(`Permissions.${msg.author.id}`) ? db.get(`Permissions.${msg.author.id}`).perm : 1
                if(userPerm >=  commandToExecute.permission){
                    commandToExecute.execute(bot,msg,args)
                }else{
                    error.send(bot,msg.channel,"You dont have permission to do that")
                }
            }
        })
    }
}

async function parseMiddleware(message,bot){
    if(!message.author.bot && message.attachments.first() && message.attachments.first().name.endsWith(".json") && message.channel.id === config.parsers_settings.channelId){
        let load = bot.emojis.resolve(emojis["loading_dark"])
        let embed = new discord.MessageEmbed()
            .setColor(color)
            .setAuthor(`${message.author.tag}`,message.author.displayAvatarURL())
            .setDescription(`Processing ${load}`)
            .setTimestamp()
        let awaitEmbed = await message.channel.send(embed)
        let fileName = await download(message.attachments.first().url)
        if(!fileName) return awaitEmbed.delete()
        let fileraw =  await fs.readFileSync(fileName)
        let file;
        try{
            file = await JSON.parse(fileraw)
        }catch (e){
            await error.send(bot,message.channel,"Malformed JSON file")
            return awaitEmbed.delete()
        }
        if(!file || !file.url) return awaitEmbed.delete()
        let parsed = await rssParser.default.rssParser(file.url).catch(e=>{
             error.send(bot,message.channel,`RSS parser Error Info: ${e} `)
        })
        if(!parsed) {
            await error.send(bot,message.channel,"Malformed JSON file or some provided data are wrong")
            return awaitEmbed.delete()
        }
        let resultPath = path.resolve(__dirname,`../Configs/Downloads/result.json`)
        await fs.writeFileSync(resultPath,JSON.stringify(parsed,null,4))
        await message.channel.send(`Result`,{
            files: [`${resultPath}`]
        })
        await awaitEmbed.delete()

    }


}
async function download(url){
    return new Promise(((resolve, reject) => {
        let fileName = path.resolve(__dirname,`../Configs/Downloads/parserExample_${Date.now()}.json`)
         request.get(url)
            .on('error', console.error)
            .pipe(fs.createWriteStream(fileName))
            .on("finish",()=>{
                resolve(fileName)
            });
    }))
}