const { Client, GatewayIntentBits, Partials,ActivityType,Events,AuditLogEvent,codeBlock, ChannelType,PermissionsBitField } = require('discord.js');
const {send,db,checkWhitelist,punish, mainBots,channelBackup,roleBackup} = require("../Providers/function");
const better = require("discord-bettermarkdown");
const {scheduleJob} = require("node-schedule");
const rolesModel = require("../Models/rolesBackup");
const channelsModel = require("../Models/channelBackup");
const {log} = require("console");
const client = new Client({
intents:Object.keys(GatewayIntentBits),
partials:Object.keys(Partials),
rest:{version:10,hashLifetime:Infinity},
presence:{status:"idle",activities:[{name:"Beş Was Here!",type:ActivityType.Streaming,url:"https://www.twitch.tv/bes_exe"}]},
ws:{version:10,properties:{$browser:"discord.js"}}
});
const config = require("../config");
let idData = db.get(`mainbots`) || [];
client.login(config.otherToken).then(() => {console.log(`${client.user.username} - [OTHER SHIELD]`); if(!idData.includes(client.user.id))db.push(`mainbots`,`${client.user.id}`)}).catch((err) => {console.log(`[OTHER SHIELD] Başlatılamadı! Hata: ${err}`)});

var readyStatus = false;
client.on(Events.ClientReady, async() => {
readyStatus = true;
})


scheduleJob('0 0 */2 * * *',async () => {
let guild = client.guilds.cache.get(config.guildID);
if(!guild)return;
log(`[AUTO BACKUP] Yeni Sunucu Yedeği Alınıyor!`)
await roleBackup(guild).catch(err => {log(`[AUTO BACKUP] Rol Yedeği Alınırken Bir Hata Oluştu!`)});
await channelBackup(guild).catch(err => {log(`[AUTO BACKUP] Kanal Yedeği Alınırken Bir Hata Oluştu!`)});
});


scheduleJob('0 * * * *',async () => {
 let data = db.all().filter(x => x.ID.startsWith("limit-"));
 if(!data.length > 0)return;
 data.forEach(async (x) => {
 if(db.has(x.ID)) db.delete(x.ID)
 })
 });
  

const AntiSpam = require("discord-anti-spam");
const antiSpam = new AntiSpam(config.antiSpam);
client.on(Events.MessageCreate, async (message) => { antiSpam.message(message); })
client.on(Events.GuildMemberRemove, async (member) => { antiSpam.userleave(member); });


class Backup{

async roleCreate(roleId){
var data = await rolesModel.findOne({guildID:config.guildID,roleID:roleId}).catch(err => {});
if(!data)return "notFound";
let guild = client.guilds.cache.get(config.guildID);
if(!guild)return "notFound";

const newRole = await guild.roles.create({
name:data.name,
color:data.color,
permissions:data.permissions,
hoist:data.hoist,
mentionable:data.mentionable,
position:data.position,
icon:data.icon,
}).catch(err => {console.log(err);});
if(!newRole)return;

setTimeout(() => {
    let channelWrites = data.channelOverwrites;
    if (channelWrites) channelWrites.forEach((bes, index) => {
        let channel = guild.channels.cache.get(bes.id);
        if (!channel) return;
        setTimeout(() => {
            let obj = {};
            bes.allow.forEach(p => {
                obj[p] = true;
            });
            bes.deny.forEach(p => {
                obj[p] = false;
            });
            channel.permissionOverwrites.create(newRole, obj).catch(err=>{});
        }, index * 5000);
    });
}, 5000);
let length = data.members.length;
if (length <= 0) return console.log(`[${newRole.name}] Veritabanı Üzerinde Role Kayıtlı Kullanıcı Olmadığından Rol Dağıtımı İptal Edildi!`.yellow);
let alls = data.members;
if (alls.length <= 0) return;
alls.every(async id => {
    let member = guild.members.cache.get(id);
    if (!member) { console.log(`[${newRole.name}] ${id}'li Üye Sunucuda Bulunamadı!`); return true; }
    await member.roles.add(newRole?.id).then(e => {
        console.log(`[${newRole.name}] ${member.user.username} Üyesine Rol Verildi!`.green);
    }).catch(e => {
        console.log(`[${newRole.id}] ${member.user.username} Üyesine Rol Verilemedi!`.red);
    });
});
}

async channelCreate(channelId){
var data = await channelsModel.findOne({guildID:config.guildID,channelID:channelId}).catch(err => {});
if(!data)return "notFound";
let guild = client.guilds.cache.get(config.guildID);
if(!guild)return "notFound";
var newChannel;
if(data.type == ChannelType.GuildText){
    newChannel = await guild.channels.create({
        name: data.name,
        type: data.type,
        nsfw: data.nsfw,
        parent: data.parentID,
        position: data.position,
        rateLimitPerUser: data.rateLimit
      }).catch(err => {});
      var newOverwrite = [];
      for (let index = 0; index < data?.permissionOverwrites?.length; index++) {
        var veri = data?.permissionOverwrites[index];
        newOverwrite.push({
          id: veri.id,
          allow: new PermissionsBitField(veri.allow).toArray(),
          deny: new PermissionsBitField(veri.deny).toArray()
        });
      }
      await newChannel?.permissionOverwrites?.set(newOverwrite);
      return;
}else if(data.type == ChannelType.GuildVoice){
    newChannel = await guild.channels.create({
        name: data.name,
        type: data.type,
        parent: data.parentID,
        position: data.position,
        bitrate: data.bitrate,
        userLimit: data.userLimit
      }).catch(err => {});
     
      var newOverwrite = [];
      for (let index = 0; index < data?.permissionOverwrites?.length; index++) {
        var veri = data?.permissionOverwrites[index];
        newOverwrite.push({
          id: veri.id,
          allow: new PermissionsBitField(veri.allow).toArray(),
          deny: new PermissionsBitField(veri.deny).toArray()
        });
      }
      await newChannel?.permissionOverwrites?.set(newOverwrite);
      return;

}else if(data.type == ChannelType.GuildCategory){
    newChannel = await guild.channels.create({
        name: data.name,
        type: data.type,
        position: data.position,
      }).catch(err => {});
    
      var newOverwrite = [];
      for (let index = 0; index < data?.permissionOverwrites?.length; index++) {
        var veri = data?.permissionOverwrites[index];
        newOverwrite.push({
          id: veri.id,
          allow: new PermissionsBitField(veri.allow).toArray(),
          deny: new PermissionsBitField(veri.deny).toArray()
        });
      }
      await newChannel?.permissionOverwrites?.set(newOverwrite);
      return;
}
}

async roleRouter(guildId){
let guild = client.guilds.cache.get(guildId);
if(!guild)return;
await roleBackup(guild);
}

async channelRooter(guildId){
let guild = client.guilds.cache.get(guildId);
if(!guild)return;
await channelBackup(guild);
}

clientStatus(){
return readyStatus;
}

async createChatGuardian(guildId){
try{
let guild = client.guilds.cache.get(guildId);
if(!guild)return;
let moderations = await guild.autoModerationRules.fetch();
if(moderations.size >= 5)return "limit";
if(moderations.some(x => x.name.includes("Beş")))return "have";
guild.autoModerationRules.create({
name: `Regex Link - ${atob('QmXFnyBXYXMgSGVyZSE=').toString()}!`,
creatorId: client.user.id,
enabled: true,
eventType: 1,
triggerType: 1,
triggerMetadata: { regexPatterns:[
    "(h|\\|-\\||#|\\}\\{|🇭)+(t|7|🇹|✝️){2,}(p|🇵|🅿️)+(s|5|§|🇸)+",
    "(h|\\|-\\||#|\\}\\{|🇭)+(t|7|🇹|✝️){2,}(p|🇵|🅿️)+",
    "(d|🇩)+(i|1|!|l|🇮|ℹ️)+(s|5|§|🇸)+(c|€|🇨|©️)+(o|0|🇴|🅾️⭕)+(r|🇷|®️)+(d|🇩).+(g|9|🇬){2,}",
    "(d|🇩)+(i|1|!|l|🇮|ℹ️)+(s|5|§|🇸)+(c|€|🇨|©️)+(o|0|🇴|🅾️⭕)+(r|🇷|®️)+(d|🇩).+(c|€|🇨|©️)+(o|0|🇴|🅾️⭕)+(m|nn|rn|🇲|Ⓜ️)+",
    ".(c|€|🇨|©️)+(o|0|🇴|🅾️⭕)+(m|nn|rn|🇲|Ⓜ️)+",
] },
actions: [{type: 1, metadata:{customMessage: "Sunucumuzda Reklam / Link Paylaşımı Yasaktır!" } }]
})

guild.autoModerationRules.create({
    name: `Küfür Engel - ${atob('QmXFnyBXYXMgSGVyZSE=').toString()}!`, creatorId: client.user.id, enabled: true, eventType: 1, triggerType: 1,
    triggerMetadata: { keywordFilter: config.Curses }, actions: [{ type: 1, metadata:{customMessage: "Sunucumuzda Argo / Küfürlü Konuşmak Yasaktır!" } }]
})
return "okey";
}catch(err){
return "error";
}
}

}



module.exports = {Backup};