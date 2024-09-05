const { Client, GatewayIntentBits, Partials,ActivityType,Events,AuditLogEvent,codeBlock } = require('discord.js');
const {send,db,checkWhitelist,punish, mainBots} = require("../Providers/function");
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
client.login(config.roleToken).then(() => {console.log(`${client.user.username} - [ROLE SHIELD]`); if(!idData.includes(client.user.id))db.push(`mainbots`,`${client.user.id}`)}).catch((err) => {console.log(`[ROLE SHIELD] Başlatılamadı! Hata: ${err}`)});


client.on(Events.GuildAuditLogEntryCreate, async(audit,guild) => {
if(audit.executor.bot)return;
var type = audit.action;
var action = audit.actionType;
var changes = audit.changes;
var member = guild.members.cache.get(audit.executorId);

if(type == AuditLogEvent.RoleCreate){
  let safeMode = member.id == guild.ownerId || checkWhitelist(client,"roleCreate",member.id) || mainBots(member.id) ? true : false;
  let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
    send(`
    > **${member} Kullanıcısı Bir Rol Oluşturdu!**
    > **${response}**
    
    > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
    > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
    > **Rol Bilgileri:**\n${codeBlock("ansi",`${`Rol İsim:`.bgDarkBlue.white.underline.bold} ${`${audit.target.name}`.green.bold}\n${`Rol ID:`.bgDarkBlue.white.underline.bold} ${`${audit.target.id}`.green.bold}\n${`Rol Renk:`.bgDarkBlue.white.underline.bold} ${`${audit.target.hexColor}`.green.bold}`)}
    > **Tarih: <t:${Math.floor(Date.now() / 1000)}>**
    > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
    
   if(safeMode)return;
        if (member && member.bannable) { punish(member, "roleCreate") }
       guild.roles.cache.get(audit.targetId).delete(atob('QmXFnyBXYXMgSGVyZSE=').toString()).catch(err => {});
}else if(type == AuditLogEvent.RoleDelete){
  let safeMode = member.id == guild.ownerId || checkWhitelist(client,"roleDelete",member.id) || mainBots(member.id) ? true : false;
  let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
    send(`
    > **${member} Kullanıcısı Bir Rol Sildi!**
    > **${response}**
    
    > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
    > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
    > **Rol Bilgileri:**\n${codeBlock("ansi",`${`Rol İsim:`.bgDarkBlue.white.underline.bold} ${`${changes.find((x) => x.key == "name").old}`.green.bold}\n${`Rol ID:`.bgDarkBlue.white.underline.bold} ${`${audit.target.id}`.green.bold}\n${`Rol Renk:`.bgDarkBlue.white.underline.bold} ${`${changes.find((x) => x.key == "color").old}`.green.bold}`)}
    > **Backup İşlemi:**\n${codeBlock("ansi",`${`/denetim`.bgDarkBlue.white.underline.bold}`)}
    > **Tarih: <t:${Math.floor(Date.now() / 1000)}>**
    > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
    
    if(safeMode)return;
        if (member && member.bannable) { punish(member, "roleDelete") }
    guild.roles.create({name:changes.find((x) => x.key == "name").old,color:changes.find((x) => x.key == "color").old,permissions:changes.find((x) => x.key == "permissions").old,hoist:changes.find((x) => x.key == "hoist").old,mentionable:changes.find((x) => x.key == "mentionable").old}).catch(err => {});
}else if(type == AuditLogEvent.RoleUpdate){
  let safeMode = member.id == guild.ownerId || checkWhitelist(client,"roleUpdate",member.id) || mainBots(member.id) ? true : false;
  let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
    send(`
    > **${member} Kullanıcısı Rol Güncelledi!**
    > **${response}**
    
    > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
    > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
    > **Değişen Değişiklikler:**\n${codeBlock("ansi",`${`id`.bgDarkBlue.white.underline.bold}: ${`${audit.targetId}`.green.bold}\n${changes.map((change) => `${`${change.key}`.bgDarkBlue.white.underline.bold}: ${`${change.old}`.red.bold} => ${`${change.new}`.green.bold}`).join("\n")}`)}
    > **Tarih: <t:${Math.floor(Date.now() / 1000)}>**
    > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
    
    if(safeMode)return;
        if (member && member.bannable) { punish(member, "roleUpdate") }
       var role = guild.roles.cache.get(audit.targetId);
       changes.forEach((change,index) => {
       switch (change.key) {
        case 'name':
        role.edit({name:change.old}).catch(err => {});
        break;
        case 'hoist':
        role.edit({hoist:change.old}).catch(err => {});
        break;
        case 'color':
        role.edit({color:change.old}).catch(err => {});
        break;
        case 'permissions':
        role.edit({permissions:change.old}).catch(err => {});
        break;
        case 'mentionable':
        role.edit({mentionable:change.old}).catch(err => {});
        break;
       }
       });
}else if(type == AuditLogEvent.MemberUpdate){
let safeMode = member.id == guild.ownerId || checkWhitelist(client,"memberNameUpdate",member.id) || mainBots(member.id) ? true : false;
if(audit.targetId == audit.executorId)return;
if(safeMode)return;
if(!changes.find((x) => x.key == 'nick'))return;
  if(!changes.find((x) => x.key == 'nick')?.old){
    guild.members.cache.get(audit.targetId).setNickname(null,atob('QmXFnyBXYXMgSGVyZSE=').toString()).catch(err => {});
  }else {
    guild.members.cache.get(audit.targetId).setNickname(changes.find((x) => x.key == 'nick')?.old,atob('QmXFnyBXYXMgSGVyZSE=').toString()).catch(err => {});
  }
 };
})



client.on(Events.GuildMemberUpdate,async(oldMember,newMember) => {
if(oldMember.roles.cache.size !== newMember.roles.cache.size){
  let audit = await oldMember.guild.fetchAuditLogs({type:AuditLogEvent.MemberRoleUpdate,limit:1}).then(audit => audit.entries.first());   
  if(!audit || !audit?.executor || mainBots(audit?.executorId))return;
  let member = oldMember.guild.members.cache.get(audit.executorId);
  let safeMode = member.id == oldMember.guild.ownerId || checkWhitelist(client,"memberRoleUpdate",member.id) || mainBots(member.id) ? true : false;
  let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
  send(`
  > **${member} Kullanıcısı Bir Üyenin Rollerini Güncelledi!**
  > **${response}**
  
  > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
  > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
  > **İşlem Yapılan Kişi: ${newMember} \`(${newMember.id})\`** 
  > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
  
  if(safeMode)return;
      if (member && member.bannable) { punish(member, "memberRoleUpdate") }
  newMember.roles.set(oldMember.roles.cache.map(x => x.id)).catch(err => {});
   }
})
