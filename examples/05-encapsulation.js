// Инкапсуляция: счёт и корзина, которую снаружи нельзя привести в негодное состояние.
// Запуск: node examples/05-encapsulation.js

const assert = require("node:assert/strict");

class BankAccount {
  #balance;
  #accountNumber;

  constructor(accountNumber, initialBalance = 0) {
    if (initialBalance < 0) throw new Error("Стартовый баланс не может быть отрицательным");
    this.#accountNumber = accountNumber;
    this.#balance = initialBalance;
  }

  deposit(amount) {
    if (!(amount > 0)) return false;
    this.#balance += amount;
    return true;
  }

  withdraw(amount) {
    if (!this.#canWithdraw(amount)) return false;
    this.#balance -= amount;
    return true;
  }

  get balance() {
    return this.#balance;
  }

  get info() {
    return `Счёт ${this.#accountNumber}: ${this.#balance}`;
  }

  #canWithdraw(amount) {
    return amount > 0 && amount <= this.#balance;
  }
}

const account = new BankAccount("40817810", 1000);
assert.equal(account.deposit(250), true);
assert.equal(account.withdraw(5000), false);
assert.equal(account.withdraw(200), true);
assert.equal(account.balance, 1050);
assert.match(account.info, /40817810: 1050/);

class Cart {
  #lines = new Map();

  add(product, qty = 1) {
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new Error("Количество — целое число больше 0");
    }

    const prev = this.#lines.get(product.id);
    this.#lines.set(product.id, {
      id: product.id,
      title: product.title,
      priceKopecks: prev?.priceKopecks ?? product.priceKopecks,
      qty: (prev?.qty ?? 0) + qty,
    });
  }

  remove(productId) {
    this.#lines.delete(productId);
  }

  get totalKopecks() {
    let sum = 0;
    for (const line of this.#lines.values()) {
      sum += line.priceKopecks * line.qty;
    }
    return sum;
  }

  snapshot() {
    return [...this.#lines.values()];
  }
}

const lamp = { id: "lamp", title: "Лампа", priceKopecks: 199000 };
const cart = new Cart();
cart.add(lamp, 2);
lamp.priceKopecks = 100;
assert.equal(cart.totalKopecks, 398000);
assert.throws(() => cart.add(lamp, 0), /Количество/);
cart.remove("lamp");
assert.equal(cart.totalKopecks, 0);
assert.deepEqual(cart.snapshot(), []);

console.log("05 encapsulation");
console.log(" ", account.info);
console.log("  cart total after external price change stays 398000");
