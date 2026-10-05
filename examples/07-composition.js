// Композиция вместо комбинаций наследования.
// Запуск: node examples/07-composition.js

const assert = require("node:assert/strict");

class Flyable {
  move() {
    return "летит";
  }
}

class Swimmable {
  move() {
    return "плывёт";
  }
}

class Walkable {
  move() {
    return "идёт";
  }
}

class Duck {
  constructor() {
    this.moves = [new Walkable(), new Swimmable(), new Flyable()];
  }

  actions() {
    return this.moves.map((ability) => ability.move());
  }
}

class Penguin {
  constructor() {
    this.moves = [new Walkable(), new Swimmable()];
  }

  actions() {
    return this.moves.map((ability) => ability.move());
  }
}

assert.deepEqual(new Duck().actions(), ["идёт", "плывёт", "летит"]);
assert.deepEqual(new Penguin().actions(), ["идёт", "плывёт"]);

class NoDiscount {
  apply(amount) {
    return amount;
  }
}

class PercentageDiscount {
  constructor(percent) {
    if (percent < 0 || percent > 100) throw new Error("Скидка от 0 до 100");
    this.percent = percent;
  }

  apply(amount) {
    return Math.round((amount * (100 - this.percent)) / 100);
  }
}

class Stock {
  constructor(quantities) {
    this.quantities = new Map(Object.entries(quantities));
  }

  reserve(lines) {
    for (const line of lines) {
      const left = this.quantities.get(line.id) ?? 0;
      if (line.qty > left) {
        throw new Error(`Недостаточно «${line.title}»`);
      }
    }
    for (const line of lines) {
      this.quantities.set(line.id, this.quantities.get(line.id) - line.qty);
    }
  }
}

class FakePayment {
  constructor() {
    this.charges = [];
  }

  charge(amount) {
    this.charges.push(amount);
    return { status: "paid", amount };
  }
}

class Checkout {
  constructor({ discount, payment, stock }) {
    this.discount = discount;
    this.payment = payment;
    this.stock = stock;
  }

  place(cart) {
    const lines = cart.snapshot();
    this.stock.reserve(lines);
    const amount = this.discount.apply(cart.totalKopecks);
    return this.payment.charge(amount);
  }
}

function createCart() {
  return {
    snapshot() {
      return [{ id: "lamp", title: "Лампа", qty: 1, priceKopecks: 100000 }];
    },
    get totalKopecks() {
      return 100000;
    },
  };
}

const payment = new FakePayment();
const checkout = new Checkout({
  discount: new PercentageDiscount(10),
  payment,
  stock: new Stock({ lamp: 3 }),
});

assert.deepEqual(checkout.place(createCart()), { status: "paid", amount: 90000 });
assert.throws(() => {
  new Checkout({
    discount: new NoDiscount(),
    payment,
    stock: new Stock({ lamp: 0 }),
  }).place(createCart());
}, /Недостаточно/);

console.log("07 composition");
console.log("  duck:", new Duck().actions().join(", "));
console.log("  penguin:", new Penguin().actions().join(", "));
console.log("  paid with 10%:", payment.charges[0]);
