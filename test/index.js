"use strict";

const babel = require("../src");

const configFile = `${__dirname}/config.mjs`

test("transformSync", () => {
  const { code } = babel.transformSync("let a = () => 2", { configFile });

  return code === "let a = function () {\n  return 2;\n};";
});

test("transformSync - specify plugin", () => {
  const { code } = babel.transformSync("let a = () => 2 ** 3", {
    plugins: ["@babel/transform-exponentiation-operator"],
  });

  return code === "let a = () => Math.pow(2, 3);";
});

test("transformSync - no function plugin", () => {
  try {
    babel.transformSync("", { plugins: [() => {}] });
    return false;
  } catch {
    return true;
  }
});

test("transformSync - SyntaxError", () => {
  try {
    babel.transformSync("a b", { configFile: false });
    return false;
  } catch (e) {
    return e instanceof SyntaxError;
  }
})

test("transformFileSync", () => {
  const { code } = babel.transformFileSync(`${__dirname}/fixture.js`, { configFile });

  return code === "let a = function () {\n  return 3;\n};";
});

test("parseSync", () => {
  const ast = babel.parseSync("a |> b", { configFile });

  return ast.program.body[0].expression.operator === "|>";
});

function test(message, fn) {
  try {
    if (fn()) {
      console.log(`OK - ${message}`);
    } else {
      process.exitCode = 1;
      console.log(`FAIL - ${message}`);
    }
  } catch (e) {
    process.exitCode = 1;
    console.log(`ERROR - ${message}`);
    console.log(e);
  }
}
