require("./Other-Shield/index.js");
require("./Main-Shield/index.js");
require("./Role-Shield/index.js");
require("./Channel-Shield/index.js");

const { emitWarning } = process;
process.emitWarning = (warning, ...args) => {
  if (args[0] === 'ExperimentalWarning') { return; }
  if (args[0] === "TimeoutOverflowWarning") { return; }
  if (args[0] && typeof args[0] === 'object' && args[0].type === 'ExperimentalWarning') { return; }
  return emitWarning(warning, ...args);
};
