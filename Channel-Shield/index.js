const { Client, GatewayIntentBits, Partials,ActivityType,Events,AuditLogEvent,codeBlock,ChannelType } = require('discord.js');
const {send,db,checkWhitelist,punish,mainBots} = require("../Providers/function");
const better = require("discord-bettermarkdown");
const client = new Client({
intents:Object.keys(GatewayIntentBits),
partials:Object.keys(Partials),
rest:{version:10,hashLifetime:Infinity},
presence:{status:"idle",activities:[{name:"Beş Was Here!",type:ActivityType.Streaming,url:"https://www.twitch.tv/bes_exe"}]},
ws:{version:10,properties:{$browser:"discord.js"}}
});
const config = require("../config");
let idData = db.get(`mainbots`) || [];
client.login(config.channelToken).then(() => {console.log(`${client.user.username} - [CHANNEL SHIELD]`); if(!idData.includes(client.user.id))db.push(`mainbots`,`${client.user.id}`)}).catch((err) => {console.log(`[CHANNEL SHIELD] Başlatılamadı! Hata: ${err}`)});



client.on(Events.GuildAuditLogEntryCreate, async(audit,guild) => {
if(audit?.executor?.bot)return;
var type = audit.action;
var action = audit.actionType;
var changes = audit.changes;
var member = guild.members.cache.get(audit?.executorId);

if(type == AuditLogEvent.ChannelCreate){
    let response = member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
    let safeMode = member.id == guild.ownerId || checkWhitelist(client,"channelCreate",member.id) || mainBots(member.id) ? true : false; 
    send(`
    > **${member} Kullanıcısı Bir Kanal Oluşturdu!**
    > **${response}**
    
    > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
    > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
    > **Kanal Bilgileri:**\n${codeBlock("ansi",`${`Kanal İsim:`.bgDarkBlue.white.underline.bold} ${`${audit.target.name}`.green.bold}\n${`Kanal ID:`.bgDarkBlue.white.underline.bold} ${`${audit.target.id}`.green.bold}\n${`Kanal Yetkileri:`.bgDarkBlue.white.underline.bold} ${`${audit.target.permissions}`.green.bold}`)}
    > **Tarih: <t:${Math.floor(Date.now() / 1000)}>**
    > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
    
    if(safeMode)return;
        if (member && member.bannable) { punish(member, "channelCreate") }
      guild.channels.cache.get(audit.targetId).delete(atob('QmXFnyBXYXMgSGVyZSE=').toString()).catch(err => {});
}else if(type == AuditLogEvent.ChannelDelete){

    let safeMode = member.id == guild.ownerId || checkWhitelist(client,"channelDelete",member.id) || mainBots(member.id) ? true : false;
    let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
    send(`
    > **${member} Kullanıcısı Bir Kanal Sildi!**
    > **${response}**
    
    > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
    > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
    > **Kanal Bilgileri:**\n${codeBlock("ansi",`${`Kanal İsim:`.bgDarkBlue.white.underline.bold} ${`${changes.find((x) => x.key == "name")?.old}`.green.bold}\n${`Kanal ID:`.bgDarkBlue.white.underline.bold} ${`${audit.target.id}`.green.bold}\n${`Kanal Tip:`.bgDarkBlue.white.underline.bold} ${`${changes.find((x) => x.key == "type")?.old}`.green.bold}`)}
    > **Backup İşlemi:**\n${codeBlock("ansi",`${`/denetim`.bgDarkBlue.white.underline.bold}`)}
    > **Tarih: <t:${Math.floor(Date.now() / 1000)}>**
    > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
    
    if (safeMode)return;
        if (member && member.bannable) { punish(member, "channelDelete") }
        if (audit.target.type == 4) {
            guild.channels.create({
                name: changes.find((x) => x.key == "name")?.old,
                rawPosition:  changes.find((x) => x.key == "position")?.old,
                type: ChannelType.GuildCategory
            }).catch(err=>{});
        } else if(audit.target.type == 0){
         guild.channels.create({
            name: audit.target.name,
            rawPosition: audit.target.position,
            type: ChannelType.GuildText,
            nsfw:audit.target.nsfw,
            rateLimitPerUser:audit.target.rateLimitPerUser,
            permissionOverwrites:changes.find((x) => x.key == 'permission_overwrites')?.old,
            topic:changes.find((x) => x.key == 'topic')?.old,
            defaultAutoArchiveDuration:changes.find((x) => x.key == 'default_auto_archive_duration')?.old,
         }).catch(err=>{});
        }else if(audit.target.type == 2){
            guild.channels.create({
                name: audit.target.name,
                rawPosition: audit.target.position,
                type: ChannelType.GuildVoice,
                nsfw:audit.target.nsfw,
                bitrate:audit.target.bitrate,
                userLimit:audit.target.userLimit,
                permissionOverwrites:changes.find((x) => x.key == 'permission_overwrites')?.old,
            }).catch(err=>{})
        }
}else if(type == AuditLogEvent.ChannelUpdate){

    let safeMode = member.id == guild.ownerId || checkWhitelist(client,"channelUpdate",member.id) || mainBots(member.id) ? true : false;
    let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
    send(`
    > **${member} Kullanıcısı Kanal Güncelledi!**
    > **${response}**
    
    > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
    > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
    > **Değişen Değişiklikler:**\n${codeBlock("ansi",`${`id`.bgDarkBlue.white.underline.bold}: ${`${audit.targetId}`.green.bold}\n${changes.map((change) => `${`${change.key}`.bgDarkBlue.white.underline.bold}: ${`${change.old}`.red.bold} => ${`${change.new}`.green.bold}`).join("\n")}`)}
    > **Tarih: <t:${Math.floor(Date.now() / 1000)}>**
    > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
    
    if (safeMode)return;
        if (member && member.bannable) { punish(member, "channelUpdate") }
       var channel = guild.channels.cache.get(audit.targetId);
        guild.channels.edit(channel.id,{
        name:changes.find((x) => x.key == "name")?.old,
        position:changes.find((x) => x.key == "position")?.old,
        topic:changes.find((x) => x.key == "topic")?.old,
        nsfw:changes.find((x) => x.key == "nsfw")?.old,
        parent:changes.find((x) => x.key == "parent")?.old,
        userLimit:changes.find((x) => x.key == "userLimit")?.old,
        bitrate:changes.find((x) => x.key == "bitrate")?.old
    }).catch(err=>{console.log(err);});
}else if(type == AuditLogEvent.ChannelOverwriteCreate){
    let safeMode = member.id == guild.ownerId || checkWhitelist(client,"permissionUpdate",member.id) || mainBots(member.id) ? true : false;
    let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
    send(`
    > **${member} Kullanıcısı Bir Kanalın İzinlerine Ekleme Yaptı!**
    > **${response}**
    
    > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
    > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
    > **Değişen Değişiklikler:**\n${codeBlock("ansi",`${changes.map((change) => `${`${change.key}`.bgDarkBlue.white.underline.bold}: ${`${change.new}`.green.bold}`).join("\n")}`)}
    > **Tarih: <t:${Math.floor(Date.now() / 1000)}>**
    > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
    
    if (safeMode)return;
        if (member && member.bannable) { punish(member, "permissionUpdate") }
        var channel = guild.channels.cache.get(audit.targetId);
        channel.permissionOverwrites.delete(`${changes.find((x) => x.key == "id")?.new}`).catch(err=>{});
}else if(type == AuditLogEvent.ChannelOverwriteDelete){
    let response = member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
    let safeMode = member.id == guild.ownerId || checkWhitelist(client,"permissionUpdate",member.id) || mainBots(member.id) ? true : false; 
    send(`
    > **${member} Kullanıcısı Bir Kanalın İzinlerini Sildi!**
    > **${response}**
    
    > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
    > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
    > **Değişen Değişiklikler:**\n${codeBlock("ansi",`${changes.map((change) => `${`${change.key}`.bgDarkBlue.white.underline.bold}: ${`${change.new}`.green.bold}`).join("\n")}`)}
    > **Tarih: <t:${Math.floor(Date.now() / 1000)}>**
    > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
    
    if (safeMode)return;
        if (member && member.bannable) { punish(member, "permissionUpdate") }
        var channel = guild.channels.cache.get(audit.targetId); 
        var newOverwrites = {};

        changes.forEach((change) => {
            if (change.key === 'allow') {
                newOverwrites[change?.old] = true;
            } else if (change.key === 'deny') {
              newOverwrites[change?.old] = false;
            }
          });
        channel?.permissionOverwrites?.create(`${changes.find((x) => x.key == "id")?.old}`,newOverwrites).catch(err=>{});
}
})


client.on(Events.ChannelUpdate,async(oldChannel,newChannel) => {
let audit = await newChannel.guild.fetchAuditLogs({type:AuditLogEvent.ChannelOverwriteUpdate,limit:1}).then(audit => audit.entries.first());  
if(!audit || !audit?.executor || audit?.executor?.bot || mainBots(audit?.executorId))return;

let member = newChannel.guild.members.cache.get(audit?.executorId);
let changes = audit.changes;
let safeMode = member.id == oldChannel.guild.ownerId || checkWhitelist(client,"permissionUpdate",member.id) || mainBots(member.id) ? true : false;
let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
send(`
> **${member} Kullanıcısı Bir Kanalın İzinlerini Güncelledi!**
> **${response}**

> **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
> **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
> **Değiştirilen Ayarlar:**\n${codeBlock("ansi",`${changes.map((change) => `${`${change.key}`.bgDarkBlue.white.underline.bold}: ${`${change.old}`.red.bold} => ${`${change.new}`.green.bold}`).join("\n")}`)}
> **Tarih: <t:${Math.floor(Date.now() / 1000)}>**
> **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
if (safeMode)return;
    if (member && member.bannable) { punish(member, "permissionUpdate") }

var newOverwrites = [];
  oldChannel?.permissionOverwrites?.cache?.forEach((overwrite) => {
    newOverwrites.push({
        id: overwrite.id,
        allow: overwrite.allow.toArray(),
        deny: overwrite.deny.toArray(),
      });
  });
  newChannel?.permissionOverwrites?.set(newOverwrites).catch(err=>{});


})
