const fetchMessages = require('../Managers/MessageFetcher')
const embedSetupSupport = require('../EmbedSetups/supportChatEmbedSetup')
const embedSetupBeta = require('../EmbedSetups/betatestChatEmbedSetup')
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
require('ffmpeg-inject');
const IceParser = require("../Utils/IceParser")
const axios = require("axios");
const botLogs = require('../Utils/botLogs')
const {GuildScheduledEventEntityTypes, GuildScheduledEventPrivacyLevels} = require("discord.js");
const {DateTime} = require("luxon")

let bootTime = DateTime.now();
module.exports = {
    name: "ready",
    execute: async (bot) => {
        bot.on('ready', async () => {

            fetchMessages.fetch(bot).then(fetchedMessages =>{
                let loaded = fetchedMessages.reduce((a, b) => a + b, 0)
                console.log(`Successfully fetched ${loaded} Messages`)
                embedSetupSupport.setup(bot)
                embedSetupBeta.setup(bot)
            })

            let i = 0
            let instance

            let getUsers = () => new Promise(resolve => {
                bot.guilds.cache.forEach(async guild => {
                    resolve(
                        guild.roles.cache.get("886993717725102103").members.size + guild.roles.cache.get("993612908074381352").members.size
                    )
                });
            })



            setInterval(async ()=>{
                findNewArticles(bot)

                if(instance) clearInterval(instance)

                if(i == 3) bot.user.setActivity(`Επεξεργασμένα μηνύματα: ${process.env.processedMessages || 0}`)
                else if(i == NaN) bot.user.setActivity(`Μέλη στον σέρβερ: ${await getUsers()}`)
                else if(i == 2) bot.user.setActivity(`Κακόβουλα μηνύματα που έχουν μπλοκαριστεί: ${process.env.blockedMessages || 0}`)
                else if(i == 0) bot.user.setActivity(`Bot Uptime: ${DateTime.now().diff(bootTime, ["days", "hours", "minutes"]).toHuman({ unitDisplay: "short" })}`)

                if(i < 2) i++
                else i = 0
            },10000)




            bot.channels.fetch("886981920108478526").then(channel=>{
                setInterval(() => {

                    try{
                        bot.channels.cache.forEach(channel=>{
                            if(channel.name) if(channel.name.indexOf("register") > -1){
                                let userId = channel.name.split("-")[1]
                                bot.users.fetch(userId)
                                .then(user=>{
                                    user.send("🆘 Το Steki για εσένα τώρα φαίνεται κενό και αυτό είναι γιατί δεν έχεις γραφτεί.\n" +
                                    "\n" +
                                    `ℹ️ Για να ολοκληρώσεις την εγγραφή σου στο Steki, μπές εδώ → ${channel}!\n` +
                                    "\n" +
                                    "💁🏻 Αν αντιμετωπίζεις κάποιο πρόβλημα ή δεν ξέρεις τι να κάνεις, στείλε στο <#939177847933780018>." +
                                    "\n" +
                                    "Έχε υπόψη ότι είμαι απλά ένα πρόγραμμα. Με έχουν προγραμματίσει να σε σπαμάρω μέχρι να γραφτείς στον σέρβερ. Αν θες να σταματήσω, δεν έχεις παρά να βγείς από τον σέρβερ, πατώντας δεξί κλικ (ή παρατεταμένα πάνω) στο εικονίδιο του σέρβερ και \"Leave Server\"")
                                })

                            }
                        });
                    }catch(e){
                        console.error(e)
                    }

                }, 1200000)
            })

        })

    }
}


async function findNewArticles(bot){

    try {
        let announcementsChannel = await bot.channels.fetch("905200037573824592");

        let {data} = await axios.get("https://ece.hmu.gr/wp-json/wp/v2/posts/")

        let latestArticle = data[0];

        if(announcementsChannel.topic != latestArticle.id){
            await announcementsChannel.setTopic(latestArticle.id)
            announcementsChannel.send(`@everyone Νέα ανακοίνωση από γραμματεία: **"${latestArticle.title.rendered.trim()}"** \n\nΔιάβασέ το εδώ: ${latestArticle.link}`)
        }
    }catch (e) {
        console.log(e)
    }
}
