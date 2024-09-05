const { Client, GatewayIntentBits, Partials,ActivityType,Events,AuditLogEvent,codeBlock,EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,UserSelectMenuBuilder,TextInputStyle,ModalBuilder, TextInputBuilder,ChannelType,ChannelSelectMenuBuilder,RoleSelectMenuBuilder } = require('discord.js');
const {send,db,checkWhitelist,punish,mainBots,roleBackup,channelBackup} = require("../Providers/function");
const better = require("discord-bettermarkdown");
const client = new Client({
intents:Object.keys(GatewayIntentBits),
partials:Object.keys(Partials),
rest:{version:10,hashLifetime:Infinity},
presence:{status:"idle",activities:[{name:"Beş Was Here!",type:ActivityType.Streaming,url:"https://www.twitch.tv/bes_exe"}]},
ws:{version:10,properties:{$browser:"discord.js"}}
});
const {Backup} = require("../Other-Shield/index")
const config = require("../config");
let idData = db.get(`mainbots`) || [];
client.login(config.mainToken).then(() => {console.log(`${client.user.username} - [MAIN SHIELD]`); if(!idData.includes(client.user.id))db.push(`mainbots`,`${client.user.id}`)}).catch((err) => {console.log(`[MAIN SHIELD] Başlatılamadı! Hata: ${err}`)});

client.on(Events.ClientReady,async() => {
client.application.commands.create({name:"denetim",description:"Sunucu Denetim & Backup Merkezi"}).catch(err=>{});
client.application.commands.create({name:"guard-setup",description:"Jail Rol Kurulum"}).catch(err=>{});
client.application.commands.create({name:"whitelist",description:"Güvenli Listeye Bir Kullanıcı Ekler",options:[
{name:"ekle",type:1,description:"Güvenli Listeye Bir Kullanıcı Ekler",options:[
{name:"kişi",description:"Güvenli Listeye Eklenicek Kullanıcıyı Belirtin",type:6,required:true},
{name:"tip",description:"Güvenli Liste Tipini Belirtin",type:3,required:true,choices:[
{name:"Full Güvenli (URL İçin Riskli)",value:"fullSecurity"},
{name:"Sunucu Güncelleme (URL İçin Riskli)",value:"guildUpdate"},
{name:"Kanal İzin Güncelleme",value:"permissionUpdate"},
{name:"Rol Güncelleme",value:"roleUpdate"},
{name:"Rol Oluşturma",value:"roleCreate"},
{name:"Rol Silme",value:"roleDelete"},
{name:"Kanal Oluşturma",value:"channelCreate"},
{name:"Kanal Silme",value:"channelDelete"},
{name:"Kanal Güncelleme",value:"channelUpdate"},
{name:"Emoji Oluşturma",value:"emojiCreate"},
{name:"Emoji Güncelleme",value:"emojiUpdate"},
{name:"Emoji Silme",value:"emojiDelete"},
{name:"Sticker Oluşturma",value:"stickerCreate"},
{name:"Sticker Güncelleme",value:"stickerUpdate"},
{name:"Sticker Silme",value:"stickerDelete"},
{name:"Bot Ekleme",value:"botAdd"},
{name:"Üye Banlama",value:"memberBanAdd"},
{name:"Üye Ban Kaldırma",value:"memberBanRemove"},
{name:"Üye Atma",value:"memberKick"},
{name:"Üye Rol Güncelleme",value:"memberRoleUpdate"},
{name:"Üye Ad Güncelleme",value:"memberNameUpdate"},
]},
{name:"limit",description:"Saatlik İşlem Limitini Belirtin / 0 = Sınırsız",type:4,required:true},
]},
{name:"kaldır",type:1,description:"Güvenli Listeden Belirtilen Kullanıcıyı Kaldırır",options:[
{name:"kişi",description:"Güvenli Listeden Kaldırılacak Kullanıcıyı Belirtin",type:6,required:true},
]},
{name:"liste",type:1,description:"Güvenli Listeyi Görüntüleyin"},
]}).catch(err=>{});
client.application.commands.create({name:"ceza-sistemi",description:"Guard Ceza Sistemini Ayarlar",options:[
    {name:"tip",description:"Guard Tipini Belirtin",type:3,required:true,choices:[
    {name:"Full Güvenli (URL İçin Riskli)",value:"fullSecurity"},
    {name:"Sunucu Güncelleme (URL İçin Riskli)",value:"guildUpdate"},
    {name:"Kanal İzin Güncelleme",value:"permissionUpdate"},
    {name:"Rol Güncelleme",value:"roleUpdate"},
    {name:"Rol Oluşturma",value:"roleCreate"},
    {name:"Rol Silme",value:"roleDelete"},
    {name:"Kanal Oluşturma",value:"channelCreate"},
    {name:"Kanal Silme",value:"channelDelete"},
    {name:"Kanal Güncelleme",value:"channelUpdate"},
    {name:"Emoji Oluşturma",value:"emojiCreate"},
    {name:"Emoji Güncelleme",value:"emojiUpdate"},
    {name:"Emoji Silme",value:"emojiDelete"},
    {name:"Sticker Oluşturma",value:"stickerCreate"},
    {name:"Sticker Güncelleme",value:"stickerUpdate"},
    {name:"Sticker Silme",value:"stickerDelete"},
    {name:"Bot Ekleme",value:"botAdd"},
    {name:"Üye Banlama",value:"memberBanAdd"},
    {name:"Üye Ban Kaldırma",value:"memberBanRemove"},
    {name:"Üye Atma",value:"memberKick"},
    {name:"Üye Rol Güncelleme",value:"memberRoleUpdate"},
    {name:"Üye Ad Güncelleme",value:"memberNameUpdate"},
    ]},
    {name:"işlem",description:"Ceza İşlemini Seçiniz",type:3,required:true,choices:[
    {name:"Sunucudan Yasakla (Ban)",value:"ban"},
    {name:"Sunucudan At (Kick)",value:"kick"},
    {name:"Yetkilerini Çek",value:"ytçek"},
    {name:"Jail'e At",value:"jail"},
    ]},
]})
})

client.on(Events.InteractionCreate,async(interaction) => {
let guild = client.guilds.cache.get(config.guildID);
if(guild){
config.commandPermission.push(guild.ownerId);
}
if(!config.commandPermission.some((x) => x == interaction.user.id))return interaction.reply({content:`> **\`🔴\` Bu İşlem İçin Erişimin Bulunmamakta!**`,ephemeral:true}).catch(err => {});
if(interaction.isStringSelectMenu()){
    let value = interaction.values[0]
    let buttons = interaction;
    if(value.startsWith("role-")){
        let roleId = value.split("-")[1];
        buttons.message.delete().catch(err=>{});
        let Back = new Backup();
        let response = await Back.roleCreate(roleId);
        if(response == "error")return buttons.reply({content:`> **\`🔴\` Belirtilen Rol ID'si Bulunamadı!**`,components:[],embeds:[]}).catch(err => {});
        if(response == "notFound")return buttons.reply({content:`> **\`🔴\` Belirtilen Rol ID'si Veritabanı Üzerinde Bulunamadı!**`,components:[],embeds:[]}).catch(err => {});
        buttons.reply({content:`> **\`🟢\` Rol Kuruluyor Bu İşlem Biraz Zaman Alabilir..**`,components:[],embeds:[]}).catch(err => {});
        }else if(value.startsWith("channel-")){
        let channelId = value.split("-")[1];
        buttons.message.delete().catch(err=>{});
        let Back = new Backup();
        let response = await Back.channelCreate(channelId);
        if(response == "error")return buttons.reply({content:`> **\`🔴\` Belirtilen Kanal ID'si Bulunamadı!**`,components:[],embeds:[]}).catch(err => {});
        if(response == "notFound")return buttons.reply({content:`> **\`🔴\` Belirtilen Kanal ID'si Veritabanı Üzerinde Bulunamadı!**`,components:[],embeds:[]}).catch(err => {});
        buttons.reply({content:`> **\`🟢\` Kanal Kuruluyor Bu İşlem Biraz Zaman Alabilir..**`,components:[],embeds:[]}).catch(err => {});
        }else if(value.startsWith("unban-")){
        let userId = value.split("-")[1];
        buttons.message.delete().catch(err=>{});
        interaction.guild.members.unban(userId).catch(err => {});
        buttons.reply({content:`> **\`🟢\` ${userId} ID'li Kullanıcının Yasaklaması Kaldırıldı.**`,components:[],embeds:[]}).catch(err => {});
        }
}
if(interaction.isModalSubmit()){
if(interaction.customId == "roleSetup"){
let id = interaction.fields.getTextInputValue("roleId");
let Back = new Backup();
let response = await Back.roleCreate(id);
if(response == "error")return interaction.reply({content:`> **\`🔴\` Belirtilen Rol ID'si Bulunamadı!**`,components:[],embeds:[]}).catch(err => {});
if(response == "notFound")return interaction.reply({content:`> **\`🔴\` Belirtilen Rol ID'si Veritabanı Üzerinde Bulunamadı!**`,components:[],embeds:[]}).catch(err => {});
interaction.reply({content:`> **\`🟢\` Belirtilen Rol Başarıyla Kuruluyor, Kanal İzinleri Ayarlanıyor Ve Eskiden Role Sahip Üyelere Dağıtılıyor..** *Bu İşlem Biraz Zaman Alabilir*`,components:[],embeds:[]}).catch(err => {});
}else if(interaction.customId == "channelSetup"){
    let id = interaction.fields.getTextInputValue("channelId");
    let Back = new Backup();
    let response = await Back.channelCreate(id);
    if(response == "error")return interaction.reply({content:`> **\`🔴\` Belirtilen Kanal ID'si Bulunamadı!**`,components:[],embeds:[]}).catch(err => {});
    if(response == "notFound")return interaction.reply({content:`> **\`🔴\` Belirtilen Kanal ID'si Veritabanı Üzerinde Bulunamadı!**`,components:[],embeds:[]}).catch(err => {});
    interaction.reply({content:`> **\`🟢\` Belirtilen Kanal Başarıyla Kuruluyor, Kanal İzinleri Ayarlanıyor..** *Bu İşlem Biraz Zaman Alabilir*`,components:[],embeds:[]}).catch(err => {});
}
}else
if(interaction.isRoleSelectMenu()){
if(interaction.customId == "setupJail"){
let roles = interaction.values;
db.set(`jailRoles`,roles);
interaction.update({content:`> **\`🟢\` Jail Rolü Başarıyla Ayarlandı.**`,components:[]}).catch(err => {});
}
}else
if(interaction.isCommand()){
let command = interaction.commandName;
if(command == "guard-setup"){
let row2 = new ActionRowBuilder().addComponents([
new RoleSelectMenuBuilder()
.setCustomId("setupJail")
.setMinValues(1)
.setMaxValues(3)
.setPlaceholder("Jail Rolünü Seçiniz"),
])
interaction.reply({content:`> **\`🟢\` Jail Rolünü Seçiniz.**`,components:[row2]}).catch(err => {});
}else if(command == "ceza-sistemi"){
let type = interaction.options.getString("tip");
let action = interaction.options.getString("işlem");
db.set(`punish-${type}`,action);
interaction.reply({content:`> **\`🟢\` ${type} Tipi İçin Ceza Sistemi Başarıyla Ayarlandı.**`}).catch(err => {});
}else if(command == "whitelist"){
let subCommand = interaction.options.getSubcommand();

if(subCommand == "ekle"){
await interaction.deferReply({ephemeral:true}).catch(err => {});
let member = interaction.guild.members.cache.get(interaction.options.getUser("kişi")?.id);
let tip = interaction.options.getString("tip");
let limit = interaction.options.getInteger("limit");
if(!member)return interaction.editReply({content:`> **\`🔴\` Belirtilen Kullanıcı Sunucuda Bulunamadı!**`,ephemeral:true}).catch(err => {});
let userWData = db.get(`whitelist-${member.id}`) || [];
if(userWData.some((x) => x.type == tip)) db.pull(`whitelist-${member.id}`,(eleman,index,sıra) => eleman.type == tip,true);
db.push(`whitelist-${member.id}`,{type:tip,totalLimit:limit == 0 ? 99 : limit,maker:`${interaction.user.id}`});
interaction.editReply({content:`> **\`🟢\` ${member} Kullanıcısı \`${tip}\` Tipli Güvenli Listeye \`${limit == 0 ? "Sınırsız" : limit}\` İşlem Limitiyle Eklendi.**`}).catch(err => {});
}else if(subCommand == "kaldır"){
await interaction.deferReply({ephemeral:true}).catch(err => {});
let user = await client.users.fetch(interaction.options.getUser("kişi")?.id).catch(err=>{});
if(!user)return interaction.reply({content:`> **\`🔴\` Belirtilen Kullanıcı Discord Üzerinde Bulunamadı!**`,ephemeral:true}).catch(err => {})
if(db.has(`whitelist-${interaction.options.getUser("kişi")?.id}`)) db.delete(`whitelist-${interaction.options.getUser("kişi")?.id}`);
interaction.editReply({content:`> **\`🟢\` ${user} Kullanıcısı Tüm Tipleriyle Birlikte Güvenli Listeden Kaldırıldı.**`}).catch(err => {});
}else if(subCommand == "liste"){
await interaction.deferReply().catch(err => {});
let wData = db.all().filter((x) => x.ID.startsWith("whitelist-"));
let ary = [];
wData.map((y) => y.data.map(async(x) => {
ary.push({inline:true,name:`🙋‍♂️ ${client.users.cache.get(`${y.ID.split("-")[1]}`)?.username}`,value:`**Tip:** \`${x.type}\`\n**Limit:** \`${x.totalLimit > 30 ? "Sınırsız" : x.totalLimit}\`\n**Ekleyen:** <@${x.maker}>`})
}))

let embed = new EmbedBuilder()
.setDescription(`> **Güvenli Listede ${wData.length} Kullanıcı Bulunmakta.**\n⠀\n`)
.addFields(ary)
.setColor("Random")
interaction.editReply({embeds:[embed]}).catch(err => {});
}
}else if(command == "denetim"){
await interaction.deferReply().catch(err => {});
let rows = new ActionRowBuilder().addComponents([
new ButtonBuilder()
.setCustomId("rolexd")
.setLabel("Rol Denetim")
.setEmoji("👑")
.setStyle(ButtonStyle.Primary),
new ButtonBuilder()
.setCustomId("channelxd")
.setLabel("Kanal Denetim")
.setEmoji("📁")
.setStyle(ButtonStyle.Primary),
new ButtonBuilder()
.setCustomId("bansxd")
.setLabel("Ban Denetim")
.setEmoji("🔨")
.setStyle(ButtonStyle.Primary),
])

let menuRows = new ActionRowBuilder().addComponents([
new StringSelectMenuBuilder()
.setCustomId("setupRows")
.setPlaceholder("Diğer İşlemler Menüsü")
.setOptions([
{label:"Backup Rol Kurulum",value:"roleSetup",description:"Sunucu Backup Rol Kurulumu",emoji:"🔃"},
{label:"Backup Kanal Kurulum",value:"channelSetup",description:"Sunucu Backup Kanal Kurulumu",emoji:"🔃"},
{label:"Rol Yedek / Backup Al",value:"rolbackup",description:"Rol Yedek / Backup Alma",emoji:"➕"},
{label:"Kanal Yedek / Backup Al",value:"kanalbackup",description:"Kanal Yedek / Backup Alma",emoji:"➕"},
{label:"Chat Koruma Sistemini Kur",value:"chatkoruma",description:"Regex Chat Koruma Sistemi",emoji:"🔨"},
{label:"TDK Backup",value:"tdkBackup",description:"Üyeleri TDK'dan Kurtarma",emoji:"👁️"},
])
])

let message = await interaction.editReply({embeds:[new EmbedBuilder().setColor("Random").setDescription(`> **Denetim Merkezine Hoşgeldin ${interaction.user.username},**\n\n> **Alttaki Butonlar Üzerinden Bir Denetim Seçeneği Seçiniz.**`)],components:[rows,menuRows]}).catch(err => {console.log(err);});


await message.awaitMessageComponent({filter:(x) => x.user.id == interaction.user.id,time:30000}).then(async(button) => { 
if(button.isButton()){
if(button.customId == "rolexd"){
    let arr = [];
    let roleAudit = (await interaction.guild.fetchAuditLogs({type:AuditLogEvent.RoleDelete})).entries.filter((x) => x.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24);
    roleAudit.forEach((x) => {
    if(x.changes.filter((y) => y.key == 'name').map((z) => z?.old)){
    arr.push({label:`${x.changes.filter((y) => y.key == 'name').map((z) => z.old)[0]}`,value:`role-${x.targetId}`,description:`${x.targetId} ID'li Rol`})
    }
    })
    if(arr.length > 0){
    let row = new ActionRowBuilder().addComponents([
    new StringSelectMenuBuilder()
    .setCustomId("roleDenetim")
    .setPlaceholder("Backup Rol Kurtarma")
    .addOptions(arr)
    ])
    
    button.update({components:[row],embeds:[
    new EmbedBuilder()
    .setColor("Random")
    .setTitle("Rol Denetim Merkezi")
    .setFooter({text:`Son 24 Saat İçinde Silinmiş Roller`,iconURL:interaction.guild.iconURL({dynamic:true})})
    .setDescription(`${roleAudit.map((x) => `> **\` ${x.changes.filter(y => y.key == 'name').map(z => z.old)} (${x.target.id}) \` <t:${Math.floor(x.createdTimestamp / 1000)}>**`).join("\n")}`)
    ]}).catch(err=>{});
    }else{
    button.update({content:`> **Silinmiş Rol Bulunamadı**`,embeds:[],components:[],ephemeral:true}).catch(err => {});    
    }
}else if(button.customId == "channelxd"){

    let arr = [];
    let roleAudit = (await interaction.guild.fetchAuditLogs({type:AuditLogEvent.ChannelDelete})).entries.filter((x) => x.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24);
    roleAudit.forEach((x) => {
    if(x.changes.filter((y) => y.key == 'name').map((z) => z?.old)){
    arr.push({label:`${x.changes.filter((y) => y.key == 'name').map((z) => z.old)[0]}`,value:`channel-${x.targetId}`,description:`${x.targetId} ID'li Kanal`})
    }
    })
    
    if(arr.length > 0){
    let row = new ActionRowBuilder().addComponents([
    new StringSelectMenuBuilder()
    .setCustomId("channelDenetim")
    .setPlaceholder("Backup Kanal Kurtarma")
    .addOptions(arr)
    ])
    
    button.update({components:[row],embeds:[
    new EmbedBuilder()
    .setColor("Random")
    .setTitle("Kanal Denetim Merkezi")
    .setFooter({text:`Son 24 Saat İçinde Silinmiş Kanallar`,iconURL:interaction.guild.iconURL({dynamic:true})})
    .setDescription(`${roleAudit.map((x) => `> **\` ${x.changes.filter(y => y.key == 'name').map(z => z.old)} (${x.target.id}) \` <t:${Math.floor(x.createdTimestamp / 1000)}>**`).join("\n")}`)
    ]}).catch(err=>{});
    }else{
    button.update({content:`> **Silinmiş Kanal Bulunamadı**`,embeds:[],components:[],ephemeral:true}).catch(err => {});    
    }

}else if(button.customId == "bansxd"){

    let arr = [];
    let roleAudit = (await interaction.guild.fetchAuditLogs({type:AuditLogEvent.MemberBanAdd})).entries.filter((x) => x.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24);
    roleAudit.forEach((x) => {
    arr.push({label:`${x.target.username}`,value:`unban-${x.targetId}`,description:`${x.targetId} ID'li Kullanıcı`})
    })
    
    if(arr.length > 0){
    let row = new ActionRowBuilder().addComponents([
    new StringSelectMenuBuilder()
    .setCustomId("banDenetim")
    .setPlaceholder("Yasak Kaldırma")
    .addOptions(arr)
    ])
    
    button.update({components:[row],embeds:[
    new EmbedBuilder()
    .setColor("Random")
    .setTitle("Yasaklama Denetim Merkezi")
    .setFooter({text:`Son 24 Saat İçinde Yasaklanmış Kullanıcılar`,iconURL:interaction.guild.iconURL({dynamic:true})})
    .setDescription(`${roleAudit.map((x) => `> **\` ${x.target.username} (${x.target.id}) / 🔨:${x.executor.username}\` <t:${Math.floor(x.createdTimestamp / 1000)}>**`).join("\n")}`)
    ]}).catch(err=>{});
    }else{
    button.update({content:`> **Yasaklama Bulunamadı**`,embeds:[],components:[],ephemeral:true}).catch(err => {});    
    }

}

}else if(button.isStringSelectMenu()){
let value = button.values[0];
if (value == "roleSetup"){
let rows = new ActionRowBuilder().addComponents([
new TextInputBuilder()
.setCustomId("roleId")
.setLabel("Rol ID")
.setRequired(true)
.setStyle(TextInputStyle.Short)
.setPlaceholder("Kurulacak Rol ID'sini Giriniz"),
])
let modal = new ModalBuilder()
.setCustomId("roleSetup")
.setTitle("Rol Backup Kurulumu")
.setComponents(rows)
button.message.delete().catch(err=>{});
await button.showModal(modal);
}else if(value == "channelSetup"){
    let rows = new ActionRowBuilder().addComponents([
        new TextInputBuilder()
        .setCustomId("channelId")
        .setLabel("Kanal ID")
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Kurulacak Kanal ID'sini Giriniz"),
        ])
        let modal = new ModalBuilder()
        .setCustomId("channelSetup")
        .setTitle("Kanal Backup Kurulumu")
        .setComponents(rows)
        button.message.delete().catch(err=>{});
        await button.showModal(modal);
}else if(value == "rolbackup"){
let Back = new Backup();
if(!Back.clientStatus())return;
button.update({content:`> **\`🟢\` Rol Backupları Alınıyor Lütfen Bekleyiniz..**`,components:[],embeds:[]}).catch(err => {});
await Back.roleRouter(interaction.guild.id)
}else if(value == "kanalbackup"){
let Back = new Backup();
if(!Back.clientStatus())return;
button.update({content:`> **\`🟢\` Kanal Backupları Alınıyor Lütfen Bekleyiniz..**`,components:[],embeds:[]}).catch(err => {});
await Back.channelRooter(interaction.guild.id)
}else if(value == "tdkBackup"){
button.update({content:`> **\`⚠️\` Bu Özellik Ekstra Ücretlidir, Eğer Özelliği Kullanmak İstiyorsanız Beş İle İletişime Geçiniz.**`,components:[],embeds:[]}).catch(err => {});
}else if(value == "chatkoruma"){
let Back = new Backup();
if(!Back.clientStatus())return button.update({content:`> **\`🔴\` Regex Chat Koruma Sistemi Kurulurken Bir Hata Meydana Geldi, Lütfen Beş İle İletişime Geçiniz.**`,components:[],embeds:[]}).catch(err => {});;
try{
let cevap = await Back.createChatGuardian(interaction.guild.id)
if(cevap == "limit")return button.update({content:`> **\`🔴\` Regex Chat Koruma Sistemi Kurulamadı, AutoModerationRules Kısmı Dolu!**`,components:[],embeds:[]}).catch(err => {});
if(cevap == "have")return button.update({content:`> **\`🔴\` Regex Chat Koruma Sistemi Sunucuda Zaten Kurulu!**`,components:[],embeds:[]}).catch(err => {});
if(cevap == "error")return button.update({content:`> **\`🔴\` Regex Chat Koruma Sistemi Kurulurken Bir Hata Meydana Geldi, Lütfen Beş İle İletişime Geçiniz.**`,components:[],embeds:[]}).catch(err => {});
button.update({content:`> **\`🟢\` Regex Chat Koruma Sistemi Başarıyla Kuruldu**`,components:[],embeds:[]}).catch(err => {});
}catch(err){
button.update({content:`> **\`🔴\` Regex Chat Koruma Sistemi Kurulurken Bir Hata Meydana Geldi, Lütfen Beş İle İletişime Geçiniz.**`,components:[],embeds:[]}).catch(err => {});
}
}
}
}).catch(err => {
message.edit({content:`> **Menü Deaktif Edildi!**`}).catch(err => {});
});


}


}
})









client.on(Events.GuildAuditLogEntryCreate, async(audit,guild) => {
if(audit.executor.bot)return;
var type = audit.action;
var action = audit.actionType;
var changes = audit.changes;
var member = guild.members.cache.get(audit.executorId);
if(type == AuditLogEvent.GuildUpdate){

    let safeMode = member.id == guild.ownerId || checkWhitelist(client,"guildUpdate",member.id) || mainBots(member.id) ? true : false;
    let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
send(`
> **${member} Kullanıcısı Sunucu Üzerinde İşlem Gerçekleştirdi!**
> **${response}**

> **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
> **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
> **Değiştirilen Ayarlar:**\n${codeBlock("ansi",`${changes.map((change) => `${`${change.key}`.bgDarkBlue.white.underline.bold}: ${`${change.old}`.red.bold} => ${`${change.new}`.green.bold}`).join("\n")}`)}
> **Tarih: <t:${Math.floor(Date.now() / 1000)}>**
> **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)

if (safeMode)return;
    if (member && member.bannable) { punish(member, "guildUpdate") }
    changes.forEach((change,index) => {
        switch (change.key) {
            case 'afk_channel_id':
            guild.setAFKChannel(change.old).catch((err) => {});
            break;
            case 'afk_timeout':
            guild.setAFKTimeout(change.old).catch((err) => {});
            break;
            case 'system_channel_id':
            guild.setSystemChannel(change.old).catch((err) => {});
            break;
            case 'default_message_notifications':
            guild.setDefaultMessageNotifications(change.old).catch((err) => {});
            break;
            case 'premium_progress_bar_enabled':
            guild.setPremiumProgressBarEnabled(change.old).catch((err) => {});
            break;
            case 'system_channel_flags':
            guild.setSystemChannelFlags(change.old).catch((err) => {});
            break;
            case 'banner_hash':
            guild.setBanner(change.old).catch((err) => {});
            break;
            case 'icon_hash':
            guild.setIcon(change.old).catch((err) => {});
            break;
            case 'verification_level':
            guild.setVerificationLevel(change.old).catch((err) => {});
            break;
            case 'name':
            guild.setName(change.old).catch((err) => {});
            break;}
        });
}else if(type == AuditLogEvent.StickerCreate){

    let safeMode = member.id == guild.ownerId || checkWhitelist(client,"stickerCreate",member.id) || mainBots(member.id) ? true : false;
    let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
    send(`
    > **${member} Kullanıcısı Sticker Oluşturdu!**
    > **${response}**
    
    > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
    > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
    > **Sticker Bilgileri:**\n${codeBlock("ansi",`${`Sticker İsim:`.bgDarkBlue.white.underline.bold} ${`${audit.target.name}`.green.bold}\n${`Sticker ID:`.bgDarkBlue.white.underline.bold} ${`${audit.target.id}`.green.bold}\n${`Sticker Açıklaması:`.bgDarkBlue.white.underline.bold} ${`${!audit.target.description.length > 0 ? "Bulunmamakta":`${audit.target.description}`}`.green.bold}`)}
    > **Tarih: <t:${Math.floor(Date.now() / 1000)}>**
    > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
    
    if(safeMode)return;
        if (member && member.bannable) { punish(member, "stickerCreate") }
     guild.stickers.cache.get(audit.targetId).delete(atob('QmXFnyBXYXMgSGVyZSE=').toString()).catch(err => {});
    }else if(type == AuditLogEvent.StickerDelete){

        let safeMode = member.id == guild.ownerId || checkWhitelist(client,"stickerDelete",member.id) || mainBots(member.id) ? true : false;
        let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
        send(`
        > **${member} Kullanıcısı Sticker Sildi!**
        > **${response}**
        
        > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
        > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
        > **Sticker Bilgileri:**\n${codeBlock("ansi",`${`Sticker İsim:`.bgDarkBlue.white.underline.bold} ${`${audit.target.name}`.green.bold}\n${`Sticker ID:`.bgDarkBlue.white.underline.bold} ${`${audit.target.id}`.green.bold}\n${`Sticker Açıklaması:`.bgDarkBlue.white.underline.bold} ${`${!audit.target.description.length > 0 ? "Bulunmamakta":`${audit.target.description}`}`.green.bold}`)}
        > **Tarih: <t:${Math.floor(Date.now() / 1000)}>**
        > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
        
        if(safeMode)return;
        if (member && member.bannable) { punish(member, "stickerDelete") }
        guild.stickers.create({name:`${audit.target.name}`,description:`${audit.target?.description}`,tags:`${audit.target.tags}`,file:{attachment:`${audit.target?.url}`}}).catch(err => {});
        }else if(type == AuditLogEvent.StickerUpdate){
            let safeMode = member.id == guild.ownerId || checkWhitelist(client,"stickerUpdate",member.id) || mainBots(member.id) ? true : false;
            let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
            send(`
            > **${member} Kullanıcısı Sticker Güncelledi!**
            > **${response}**
            
            > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
            > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
            > **Değişen Değişiklikler:**\n${codeBlock("ansi",`${changes.map((change) => `${`${change.key}`.bgDarkBlue.white.underline.bold}: ${`${change.old}`.red.bold} => ${`${change.new}`.green.bold}`).join("\n")}`)}
            > **Tarih: <t:${Math.floor(Date.now() / 1000)}>**
            > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
            
            if(safeMode)return;
                if (member && member.bannable) { punish(member, "stickerUpdate") }
                guild.stickers.cache.get(audit.targetId).edit({name:changes.find((change) => change.key == "name")?.old,description:changes.find((change) => change.key == "description")?.old,tags:changes.find((change) => change.key == "tags")?.old}).catch(err => {});
            }else if(type == AuditLogEvent.EmojiCreate){
                let safeMode = member.id == guild.ownerId || checkWhitelist(client,"emojiCreate",member.id) || mainBots(member.id) ? true : false;
                let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
                send(`
                > **${member} Kullanıcısı Emoji Oluşturdu!**
                > **${response}**
                
                > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
                > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
                > **Emoji Bilgileri:**\n${codeBlock("ansi",`${`Emoji İsim:`.bgDarkBlue.white.underline.bold} ${`${audit.target.name}`.green.bold}\n${`Emoji ID:`.bgDarkBlue.white.underline.bold} ${`${audit.target.id}`.green.bold}\n${`Emoji İçerik:`.bgDarkBlue.white.underline.bold} ${`${audit.target.url}`.green.bold}`)}
                > **Tarih: <t:${Math.floor(Date.now() / 1000)}>**
                > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
                
                if(safeMode)return;
                    if (member && member.bannable) { punish(member, "emojiCreate") }
                  guild.emojis.cache.get(audit.targetId).delete(atob('QmXFnyBXYXMgSGVyZSE=').toString()).catch(err => {});
            }else if(type == AuditLogEvent.EmojiDelete){

                
                let safeMode = member.id == guild.ownerId || checkWhitelist(client,"emojiDelete",member.id) || mainBots(member.id) ? true : false;
                let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
                send(`
                > **${member} Kullanıcısı Emoji Sildi!**
                > **${response}**
                
                > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
                > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
                > **Emoji Bilgileri:**\n${codeBlock("ansi",`${`Emoji İsim:`.bgDarkBlue.white.underline.bold} ${`${audit.target.name}`.green.bold}\n${`Emoji ID:`.bgDarkBlue.white.underline.bold} ${`${audit.target.id}`.green.bold}\n${`Emoji İçerik:`.bgDarkBlue.white.underline.bold} ${`${audit.target.url}`.green.bold}`)}
                > **Tarih: <t:${Math.floor(Date.now() / 1000)}>**
                > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
                
               if(safeMode)return;
                    if (member && member.bannable) { punish(member, "emojiDelete") }
                 guild.emojis.create({name:changes.find((x) => x.key == 'name').old,attachment:`https://cdn.discordapp.com/emojis/${audit.targetId}.gif`}).catch(err =>{
                guild.emojis.create({name:changes.find((x) => x.key == 'name').old,attachment:`https://cdn.discordapp.com/emojis/${audit.targetId}.png`}).catch(err => {});
                 }).catch(err => {});
            }else if(type == AuditLogEvent.EmojiUpdate){

                let safeMode = member.id == guild.ownerId || checkWhitelist(client,"emojiUpdate",member.id) || mainBots(member.id) ? true : false;
                let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
                send(`
                > **${member} Kullanıcısı Emoji Güncelledi!**
                > **${response}**
                
                > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
                > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
                > **Değişen Değişiklikler:**\n${codeBlock("ansi",`${changes.map((change) => `${`${change.key}`.bgDarkBlue.white.underline.bold}: ${`${change.old}`.red.bold} => ${`${change.new}`.green.bold}`).join("\n")}`)}
                > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
                
                if(safeMode)return;
                    if (member && member.bannable) { punish(member, "emojiUpdate") }
                guild.emojis.cache.get(audit.targetId).edit({name:changes.find((change) => change.key == "name").old,reason:atob('QmXFnyBXYXMgSGVyZSE=').toString()}).catch(err => { });
            }else if(type == AuditLogEvent.BotAdd){

                
                let safeMode = member.id == guild.ownerId || checkWhitelist(client,"botAdd",member.id) || mainBots(member.id) ? true : false;
                let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
                send(`
                > **${member} Kullanıcısı Bir Bot/Entegrasyon Ekledi!**
                > **${response}**
                
                > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
                > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
                > **Eklenen Bot/Entegrasyon: <@${audit.targetId}> \`(${audit.targetId})\`** 
                > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
                
                if(safeMode)return;
                    if (member && member.bannable) { punish(member, "botAdd") }
                guild.members.cache.get(audit.targetId).ban({reason:atob('QmXFnyBXYXMgSGVyZSE=').toString()}).catch(err => {});
            }else if(type == AuditLogEvent.MemberBanAdd){

                
                let safeMode = member.id == guild.ownerId || checkWhitelist(client,"memberBanAdd",member.id) || mainBots(member.id) ? true : false;
                let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
                send(`
                > **${member} Kullanıcısı Bir Üyeyi Yasakladı!**
                > **${response}**
                
                > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
                > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
                > **İşlem Yapılan Kişi: <@${audit.targetId}> \`(${audit.targetId})\`** 
                > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
                
                if(safeMode)return;
                    if (member && member.bannable) { punish(member, "memberBanAdd") }
               guild.members.unban(audit.targetId,atob('QmXFnyBXYXMgSGVyZSE=').toString()).catch(err => {});
                 
                 }else if(type == AuditLogEvent.MemberBanRemove){

                    
                    let safeMode = member.id == guild.ownerId || checkWhitelist(client,"memberBanRemove",member.id) || mainBots(member.id) ? true : false;
                    let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
                    send(`
                    > **${member} Kullanıcısı Bir Üyenin Yasağını Kaldırdı!**
                    > **${response}**
                    
                    > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
                    > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
                    > **İşlem Yapılan Kişi: <@${audit.targetId}> \`(${audit.targetId})\`** 
                    > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
                    
                    if(safeMode)return;
                        if (member && member.bannable) { punish(member, "memberBanRemove") }
                   guild.bans.create(audit.targetId,{reason:atob('QmXFnyBXYXMgSGVyZSE=').toString()}).catch(err => {});
                     }else if(type == AuditLogEvent.MemberKick){

                        
                        let safeMode = member.id == guild.ownerId || checkWhitelist(client,"memberKick",member.id) || mainBots(member.id) ? true : false;
                        let response = safeMode ? "Üye Güvenli Listede Bulunmakta!" : member.bannable ? "Ceza Uyguladım!" : "Yetkim Yetmediği İçin Ceza Uygulayamadım!";
                        send(`
                        > **${member} Kullanıcısı Bir Üyeyi Sunucudan Attı!**
                        > **${response}**
                        
                        > **İşlem Yapan Kişi: ${member} \`(${member.id})\`**
                        > **Güvenlik Durumu: ${safeMode ? "\` 🟢 Güvenli Listede \` " : " \` 🔴 Güvenli Değil \` "}**
                        > **İşlem Yapılan Kişi: <@${audit.targetId}> \`(${audit.targetId})\`** 
                        > **Unix Zaman: <t:${Math.floor(Date.now() / 1000)}:R>**`,member.user)
                        
                        if(safeMode)return;
                            if (member && member.bannable) { punish(member, "memberKick") }
                         }
})




















