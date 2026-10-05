// Данные и поведение в одном объекте.
// Запуск: node examples/01-data-and-behavior.js

const assert = require("node:assert/strict");

const bob = {
  name: "Bob",
  age: 17,
  email: "bob@example.com",

  greet() {
    return this.age > 17 ? "Good morning" : "Hi";
  },

  canVote() {
    return this.age >= 18;
  },

  info() {
    return `${this.name} (${this.age})`;
  },
};

assert.equal(bob.greet(), "Hi");
assert.equal(bob.canVote(), false);
assert.equal(bob.info(), "Bob (17)");

console.log("01 data + behavior");
console.log(" ", bob.info(), "→", bob.greet(), "| canVote:", bob.canVote());
