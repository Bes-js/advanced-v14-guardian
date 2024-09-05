const { Model, Schema, Types } = require('cherry3');

var channelBackup = new Model('channelBackup', Schema({
 guildID: String,
 channelID: String,
 name: String,
 type: Number,
 topic: { type:String, default:null },
 position: { type:Number, default:null },
 nsfw: { type:Boolean, default:null },
 position: Number,
 bitrate: { type:Number, default:null },
 userLimit: { type:Number, default:null },
 rateLimitPerUser: { type:Number, default:null },
 parentID: { type:String, default:null },
 permissionOverwrites: { type:Array, default:[] },
}), { $timestamps: true });

module.exports = channelBackup;