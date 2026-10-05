// Класс, сеттер с инвариантом и объект-значение Money.
// Запуск: node examples/03-classes-and-money.js

const assert = require("node:assert/strict");

class Person {
  #age;

  constructor(name, age = 0) {
    this.name = name;
    this.age = age;
  }

  get age() {
    return this.#age;
  }

  set age(value) {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error("Возраст — целое число ≥ 0");
    }
    this.#age = value;
  }

  get isAdult() {
    return this.#age >= 18;
  }

  introduce() {
    return `Меня зовут ${this.name}, мне ${this.#age}`;
  }

  static createAdult(name) {
    return new Person(name, 18);
  }
}

const bob = new Person("Bob", 17);
const adult = Person.createAdult("John");
assert.equal(bob.introduce(), "Меня зовут Bob, мне 17");
assert.equal(bob.isAdult, false);
assert.equal(adult.isAdult, true);
assert.throws(() => new Person("Kid", -1), /Возраст/);
assert.throws(() => {
  bob.age = 17.5;
}, /Возраст/);

class Money {
  #kopecks;
  #currency;

  constructor(kopecks, currency = "RUB") {
    if (!Number.isInteger(kopecks)) {
      throw new Error("Сумма хранится целым числом минимальных единиц");
    }
    if (typeof currency !== "string" || currency.length !== 3) {
      throw new Error("Валюта — код из 3 букв");
    }
    this.#kopecks = kopecks;
    this.#currency = currency;
  }

  static fromRubles(value, currency = "RUB") {
    if (!Number.isFinite(value)) throw new Error("Некорректная сумма");
    return new Money(Math.round(value * 100), currency);
  }

  add(other) {
    this.#assertSameCurrency(other);
    return new Money(this.#kopecks + other.#kopecks, this.#currency);
  }

  #assertSameCurrency(other) {
    if (!(other instanceof Money) || other.#currency !== this.#currency) {
      throw new Error("Нельзя сложить разные валюты");
    }
  }

  format() {
    const sign = this.#kopecks < 0 ? "-" : "";
    const abs = Math.abs(this.#kopecks);
    const major = Math.floor(abs / 100);
    const minor = String(abs % 100).padStart(2, "0");
    return `${sign}${major}.${minor} ${this.#currency}`;
  }
}

const salary = Money.fromRubles(120.5);
const bonus = Money.fromRubles(10);
assert.equal(salary.add(bonus).format(), "130.50 RUB");
assert.throws(() => salary.add(new Money(100, "USD")), /валют/);

console.log("03 classes + money");
console.log(" ", bob.introduce(), "|", adult.introduce());
console.log(" ", salary.add(bonus).format());
