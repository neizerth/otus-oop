// Прототипы: делегирование, class как сахар, словари без Object.prototype.
// Запуск: node examples/02-prototypes.js

const assert = require("node:assert/strict");

const personMethods = {
  introduce() {
    return `Меня зовут ${this.name}`;
  },
};

const ada = Object.create(personMethods);
ada.name = "Ada";

assert.equal(ada.introduce(), "Меня зовут Ada");
assert.equal(Object.getPrototypeOf(ada), personMethods);
assert.equal(Object.hasOwn(ada, "introduce"), false);
assert.equal(Object.hasOwn(ada, "name"), true);

function PersonFn(name, age) {
  this.name = name;
  this.age = age;
}

PersonFn.prototype.isAdult = function isAdult() {
  return this.age >= 18;
};

class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  isAdult() {
    return this.age >= 18;
  }
}

const viaFn = new PersonFn("Grace", 36);
const viaClass = new Person("Grace", 36);

assert.equal(Object.getPrototypeOf(viaFn), PersonFn.prototype);
assert.equal(Object.getPrototypeOf(viaClass), Person.prototype);
assert.equal(typeof Person, "function");
assert.equal(viaFn.isAdult(), viaClass.isAdult());

// Обычный объект: ключ __proto__ включает сеттер с Object.prototype.
const user = {};
user["__proto__"] = { isAdmin: true };
assert.equal(user.isAdmin, true);
assert.equal(Object.prototype.isAdmin, undefined);

// Словарь без прототипа хранит __proto__ как обычный ключ.
const dict = Object.create(null);
dict["__proto__"] = { isAdmin: true };
dict["toString"] = "не метод";
assert.equal(Object.getPrototypeOf(dict), null);
assert.equal(dict["toString"], "не метод");
assert.deepEqual(dict["__proto__"], { isAdmin: true });

function copyOwn(target, source) {
  for (const key of Object.keys(source)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    target[key] = source[key];
  }
  return target;
}

const incoming = JSON.parse('{"__proto__": {"isAdmin": true}, "name": "Ada"}');
const safe = copyOwn({}, incoming);
assert.equal(safe.name, "Ada");
assert.equal(Object.hasOwn(safe, "__proto__"), false);
assert.equal(({}.isAdmin), undefined);

console.log("02 prototypes");
console.log("  method on prototype:", Object.hasOwn(ada, "introduce") === false);
console.log("  class is a function:", typeof Person === "function");
console.log("  null-prototype keeps __proto__ as data");
