const { ShardingManager } = require("discord.js");
const path = require("path");
const config = require("../config");

const manager = new ShardingManager('./Role-Shield/index.js', {  
    totalShards: 1,
    shards:2,
    token: config.roleToken,
    timeout: -1,
    execArgv: ['--trace-warnings'],
    shardArgs: ["--color"],
    respawn: true});


manager.on("shardCreate", shard => {
  shard.on('reconnecting', () => {
    console.log(`Reconnecting shard: [${(shard.id+1)}]`);
  });
  shard.on('spawn', () => {
    console.log(`Spawned shard: [${(shard.id+1)}]`);
  });
  shard.on('ready', () => {
    console.log(` Shard [${(shard.id+1)}] is ready`);
  });
  shard.on('death', () => {
    console.log(`Died shard: [${(shard.id+1)}]`);
  });
  shard.on('error', (err)=>{
    console.log(`Error in [${(shard.id+1)}] with: ${err}`)
    shard.respawn({amount:1,delay:15500,timeout: 60000})
  })
});


manager.spawn({amount:1,delay:15500,timeout: 60000}).catch(e => console.log(e));