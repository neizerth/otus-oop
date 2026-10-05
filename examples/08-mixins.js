// Миксины и тот же эффект через обычное поле.
// Запуск: node examples/08-mixins.js

const assert = require("node:assert/strict");

const LoggerMixin = {
  log(message) {
    const line = `[${this.constructor.name}] ${message}`;
    this.logs.push(line);
    return line;
  },
};

const ValidatorMixin = {
  hasRequired(data) {
    return Object.values(data).every((value) => value != null && value !== "");
  },
};

function applyMixins(Target, ...mixins) {
  for (const mixin of mixins) {
    for (const name of Object.getOwnPropertyNames(mixin)) {
      if (name === "constructor") continue;
      Object.defineProperty(
        Target.prototype,
        name,
        Object.getOwnPropertyDescriptor(mixin, name)
      );
    }
  }
}

class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.logs = [];
  }
}

applyMixins(User, LoggerMixin, ValidatorMixin);

const user = new User("Ada", "ada@example.com");
assert.equal(user.log("создан"), "[User] создан");
assert.equal(user.hasRequired(user), true);
assert.equal(new User("Grace", "").hasRequired({ name: "Grace", email: "" }), false);

class Clock {
  now() {
    return new Date("2024-05-01T10:00:00Z");
  }
}

class AuditedUser {
  constructor(name, email, clock = new Clock()) {
    this.name = name;
    this.email = email;
    this.clock = clock;
    this.logs = [];
  }

  log(message) {
    const line = `[AuditedUser] ${message}`;
    this.logs.push(line);
    return line;
  }

  touch(reason) {
    this.updatedAt = this.clock.now();
    return this.log(`${reason} @ ${this.updatedAt.toISOString()}`);
  }
}

const audited = new AuditedUser("Lin", "lin@example.com");
assert.match(audited.touch("профиль обновлён"), /2024-05-01/);

console.log("08 mixins");
console.log(" ", user.logs[0]);
console.log(" ", audited.touch("ещё раз"));
