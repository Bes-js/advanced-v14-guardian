const {EmbedBuilder,WebhookClient,PermissionFlagsBits} = require("discord.js");

const { YamlDatabase } = require("five.db");
const db = new YamlDatabase();
const config = require("../config");

const roleModel = require("../Models/rolesBackup");
const channelModel = require("../Models/channelBackup");

const {log} = require("console");
async function send(message, entry) {
    try{
    const webHook = new WebhookClient({url: config.webhookURL});
    let beş_embed = new EmbedBuilder()
        .setColor("#2f3136")
        .setThumbnail(entry.avatarURL({ dynamic: true }))
        .setDescription(`${message}`)
        .setFooter({text:`${entry.username} Tarafından.`,iconURL:entry.avatarURL({ dynamic: true })})
    return webHook.send({ embeds: [beş_embed] }).catch((err) => {
    log("Webhook Gönderiminde Bir Hata Gerçekleşti!")
    })
    }catch(err){log("Webhook Gönderiminde Bir Hata Gerçekleşti!")}
}

function mainBots(id){
let data = db.get(`mainbots`) || [];
if(data.some(x => x == id))return true;
return false;
}


async function channelBackup(guild){
guild.channels.cache.forEach(async channel => {
let chanPerms = [];
channel.permissionOverwrites.cache.forEach(bes => {
chanPerms.push({ id: bes.id, type: bes?.type, allow: `${bes.allow.bitfield}`, deny: `${bes.deny.bitfield}` });
});
await channelModel.findOneAndUpdate({guildID:config.guildID,channelID:channel?.id,},{$set:{
    guildID:config.guildID,
    channelID:channel?.id,
    name:channel?.name,
    type:channel?.type,
    topic:channel?.topic,
    position:channel?.position,
    nsfw:channel?.nsfw,
    bitrate:channel?.bitrate,
    userLimit:channel?.userLimit,
    rateLimitPerUser:channel?.rateLimitPerUser,
    parentID:channel?.parentId,
    permissionOverwrites:chanPerms}},{$upsert:true}).catch(err=>{});
});
}


async function roleBackup(guild){
guild.roles.cache.forEach(async role => {
    let rolePerms = [];
role.guild.channels.cache.filter(bes =>bes.permissionOverwrites.cache.has(role.id)).forEach(besx => {
let channelPerm = besx.permissionOverwrites.cache.get(role.id);
rolePerms.push({ id: besx.id, allow: channelPerm.allow.toArray(), deny: channelPerm.deny.toArray() });
});
await roleModel.findOneAndUpdate({guildID:config.guildID,roleID:role?.id,},{$set:{
    guildID:config.guildID,
    roleID:role?.id,
    name:role?.name,
    icon:role?.iconURL(),
    color:role?.hexColor,
    hoist:role?.hoist,
    position:role?.position,
    permissions:role?.permissions.bitfield.toString(),
    mentionable:role?.mentionable,
    members:role?.members.map(x => x.id),
    channelOverwrites:rolePerms
}},{$upsert:true}).catch(err=>{ });
});
}


function checkWhitelist(client,type,id) {
    let wData = db.get(`whitelist-${id}`) || [];
    let member = client.guilds.cache.get(config.guildID).members.cache.get(id);
    if (!member)return;
    if (!wData.length > 0) return false;
    if(wData.some(x => x.type == "fullSecurity")){
    let nowLimit = db.get(`limit-${id}-fullSecurity`) || 0;
    if(nowLimit >= wData.find((y) => y.type == "fullSecurity").totalLimit)return false;
    db.add(`limit-${id}-fullSecurity`, 1);
    return true;
    }else{
    if(wData.some(x => x.type == type)){
    let nowLimit = db.get(`limit-${id}-${type}`) || 0;
    if(nowLimit >= wData.find((y) => y.type == type).totalLimit)return false;
    db.add(`limit-${id}-${type}`, 1);
    return true;
    }else{return false;}
}
}

let perms = [
    PermissionFlagsBits.Administrator,
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.ManageWebhooks,
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.ManageGuild,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.KickMembers
];
 function punish(member, type) {
    let guild = member.guild;
    let user = member;
    var lastResponse = "";
    let punishData = db.get(`punish-${type}`);
    if(!punishData) lastResponse = "jail";
    if(punishData) lastResponse = `${punishData}`;
    switch (lastResponse) {
        case 'jail':
            let jailRoles = db.get(`jailRoles`) || [];
            user.roles.cache.has(guild.roles.premiumSubscriberRole ? guild.roles.premiumSubscriberRole.id : "5") ? user.roles.set([guild.roles.premiumSubscriberRole.id,...jailRoles]).catch(err=>{}) : user.roles.set([...jailRoles]).catch(err=>{});
            log(`{PUNISH} ${user.user.tag} Kullanıcısına [JAIL] İşlemi Uygulandı!`)
            break;
        case 'ban':
            user.ban().catch(err=>{});
            log(`{PUNISH} ${user.user.tag} Kullanıcısına [BAN] İşlemi Uygulandı!`)
            break;
        case 'kick':
            user.kick().catch(err=>{});
            log(`{PUNISH} ${user.user.tag} Kullanıcısına [KICK] İşlemi Uygulandı!`)
            break;
        case 'ytçek':
            user.roles.remove(user.roles.cache.filter((bes) => bes.editable && bes.name !== "@everyone" && perms.some(perm => bes.permissions.has(perm))).map((bes) => bes.id)).catch(err=>{});
            log(`{PUNISH} ${user.user.tag} Kullanıcısına [YETKİ ÇEKME] İşlemi Uygulandı!`)
            break;
    }

}






module.exports = {send,db,checkWhitelist,punish,mainBots,roleBackup,channelBackup};