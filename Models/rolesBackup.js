const { Model, Schema, Types } = require('cherry3');

var rolesBackup = new Model('rolesBackup',Schema({
  guildID: String,
  roleID: String,
  name: String,
  icon:{ type: String, default:null },
  color: String,
  hoist: Boolean,
  position: Number,
  permissions: String,
  mentionable: Boolean,
  members: Array,
  channelOverwrites: Array
}), { $timestamps: true });

module.exports = rolesBackup;