"use strict";

const { parentPort } = require("worker_threads");

const babelP = import("@babel/core");

let signal, port;

const handlers = {
  init(message) {
    if (signal) {
      throw new Error(
        "babel-synchronized worker has already been initialized."
      );
    }

    ({ signal, port } = message);
  },
  async call(message) {
    if (!signal) {
      throw new Error(
        "babel-synchronized worker has not been initialized yet."
      );
    }

    const babel = await babelP;
    const fn = babel[message.name];
    const result = await fn(...message.args);

    for (const key of message.excludeKeys || []) delete result[key];

    return result;
  },
  __default__(message) {
    throw new Error("Unkown message: " + message.type);
  },
};

parentPort.addListener("message", async message => {
  try {
    const handler = handlers[message.type] || handlers.__default__;
    const result = await handler(message);
    send({ type: "success", result });
  } catch (error) {
    send({ type: "error", error });
  }
});

function send(message) {
  port.postMessage(message);
  // Change the value of signal[0] to 1
  Atomics.store(signal, 0, 1);
  // This will unlock the main thread when we notify it
  Atomics.notify(signal, 0);
}
