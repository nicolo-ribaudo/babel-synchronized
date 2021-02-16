"use strict";

() => import("");

const [major, minor] = process.versions.node.split(".")
if (+major < 12 || +major === 12 && +minor < 17) {
  throw new Error("babel-synchronized requires Node.js >= 12.7")
}

module.exports = {
  parseSync: bind("parseAsync"),
  transformSync: bind("transformAsync", ["options"]),
  transformFileSync: bind("transformFileAsync", ["options"]),
  transformFromAstSync: bind("transformFromAstAsync", ["options"])
};

const assert = require("assert");
const {
  Worker,
  MessageChannel,
  receiveMessageOnPort,
  SHARE_ENV,
} = require("worker_threads");

let worker;
let signal;
let channel;

function messageSync(message, transfer) {
  Atomics.store(signal, 0, 0);
  worker.postMessage(message, transfer);
  Atomics.wait(signal, 0, 0);

  const response = receiveMessageOnPort(channel.port2).message;

  if (response.type === "error") {
    throw response.error;
  }

  assert.strictEqual(response.type, "success");
  return response.result;
}

function init() {
  worker = new Worker(__dirname + "/worker.js", { env: SHARE_ENV });
  signal = new Int32Array(new SharedArrayBuffer(4));
  channel = new MessageChannel();

  messageSync({ type: "init", signal, port: channel.port1 }, [channel.port1]);

  worker.unref();
  channel.port2.unref();
}

function call(name, args, excludeKeys) {
  if (!worker) init();

  return messageSync({ type: "call", name, args, excludeKeys });
}

function bind(name, excludeKeys) {
  return (...args) => call(name, args, excludeKeys);
}
