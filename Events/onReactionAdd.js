const discord = require('discord.js')
const fetchMessages = require('../Managers/MessageFetcher')
let Ticket = require("../Classes/Ticket.js")
let Application = require("../Classes/Application")
const emojis = require('../Configs/emojis.json')
const {prefix,footerText,footerIcon,color,version} = require('../Configs/botconfig.json')


const config =  require('../Managers/configManager')()
const db = require('quick.db');

const restartRegistration = async (channel, user) => {
    channel.edit({topic: '{"step": "sendEmail"}'})
    await channel.bulkDelete(100)
    channel.send(`**Γειά σου ${user.username}, καλωσόρισες στο Steki!** \n Για να διασφαλίσουμε την εχεμύθεια και την αποκλειστικότητα του σέρβερ προς τους φοιτητές και φοιτήτριες του ΕΛ.ΜΕ.ΠΑ., θα χρειαστεί να επιβεβαιώσουμε την φοιτητική σου ιδιότητα.\n\nΕίναι πολύ απλό: \n **Θα σου στείλω έναν κωδικό στο ακαδημαϊκό σου email και εσύ θα πρέπει να μου τον στείλεις πίσω.**`);
    setTimeout(()=>channel.send("Αν κολλήσεις σε κάποιο απο τα βήματα (βάλεις λάθος ακαδημαϊκό email, δεν λαμβάνεις κωδικό κλπ.) μπορείς να πατήσεις το :arrows_counterclockwise: εδώ κάτω και θα ξανα-αρχίσουμε τη διαδικασία από την αρχή.").then(message=>message.react("🔄")),1000)
    setTimeout(()=>channel.send(`**Για να συνεχίσουμε, στείλε μου εδώ το ακαδημαϊκό σου email. Θα πρέπει να είναι της μορφής *paradeigma@edu.hmu.gr* (αυτό που σου έδωσε η γραμματεία κατά την εγγραφή)**.`),2000);

}

module.exports = {
    name: "messageReactionAdd",
    execute: async (bot) => {
        bot.on('messageReactionAdd',async (reaction,user) => {
            let {guild} = reaction.message;
            let member = guild.members.cache.get(user.id);
            let emoji = reaction._emoji.name
            let db = JSON.parse(reaction.message.channel.topic)

            if(reaction.message.channel.name === `register-${user.id}` && emoji === "🔄") await restartRegistration(reaction.message.channel, user);
            else if(reaction.message.channel.name === `register-${user.id}` && db.step === "chooseDept"){
                        switch (emoji) {
                            case '🖥️':
                                member.roles.add("886993717725102103")
                                completeRegistration(reaction.message.channel)
                                break;
                            case '🤖':
                                member.roles.add("887198468421083136")
                                completeRegistration(reaction.message.channel)
                                break;
                            case '⚙️':
                                member.roles.add("887198536360419348")
                                completeRegistration(reaction.message.channel)
                                break;
                            case '👪':
                                member.roles.add("887198604027101284")
                                completeRegistration(reaction.message.channel)
                                break;
                            case '🌱':
                                member.roles.add("887198628899356683")
                                completeRegistration(reaction.message.channel)
                                break;
                            case '💉':
                                member.roles.add("887198656837591041")
                                completeRegistration(reaction.message.channel)
                                break;
                            case '🎶':
                                member.roles.add("887200015825641542")
                                completeRegistration(reaction.message.channel)
                                break;
                            case '💼':
                                member.roles.add("887198689372815410")
                                completeRegistration(reaction.message.channel)
                                break;
                            case '✈️':
                                member.roles.add("887198713628483664")
                                completeRegistration(reaction.message.channel)
                                break;
                            case '🍎':
                                member.roles.add("887198734209925141")
                                completeRegistration(reaction.message.channel)
                                break;
                            case '💸':
                                member.roles.add("887198782255661086")
                                completeRegistration(reaction.message.channel)
                                break;
                            default:
                                reaction.message.reactions.cache.get(emoji).users.remove(user);
                                break;
                            }
        }
        })
    }
}

let completeRegistration = (channel) => {
    try {
        channel.delete()
    }catch (e) {

    }
}