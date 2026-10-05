// Сквозной кейс: каталог, корзина, заказ, два способа оплаты.
// Запуск: node examples/10-checkout.js

const assert = require("node:assert/strict");

class AppError extends Error {
  constructor(message, { status = 500, code = "INTERNAL" } = {}) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
  }
}

class ValidationError extends AppError {
  constructor(fields) {
    super("Некорректные данные", { status: 400, code: "VALIDATION" });
    this.fields = fields;
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} не найден`, { status: 404, code: "NOT_FOUND" });
    this.id = id;
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, { status: 409, code: "CONFLICT" });
  }
}

class Product {
  constructor({ id, title, priceKopecks, stock }) {
    this.id = id;
    this.title = title;
    this.priceKopecks = priceKopecks;
    this.stock = stock;
  }
}

class Catalog {
  #products = new Map();

  add(product) {
    this.#products.set(product.id, product);
    return this;
  }

  get(id) {
    const product = this.#products.get(id);
    if (!product) throw new NotFoundError("Товар", id);
    return product;
  }
}

class Address {
  constructor({ city, street, zip }) {
    const fields = {};
    if (!city) fields.city = "Укажите город";
    if (!street) fields.street = "Укажите улицу";
    if (!zip) fields.zip = "Укажите индекс";
    if (Object.keys(fields).length > 0) throw new ValidationError(fields);

    this.city = city;
    this.street = street;
    this.zip = zip;
  }
}

class PaymentProvider {
  charge(_intent) {
    throw new Error("charge() нужно переопределить");
  }
}

class CardProvider extends PaymentProvider {
  constructor(gateway) {
    super();
    this.gateway = gateway;
  }

  charge(intent) {
    if (intent.currency !== "RUB") {
      throw new ValidationError({ currency: "Карта принимает только RUB" });
    }
    if (!(intent.amountKopecks > 0)) {
      throw new ValidationError({ amount: "Сумма должна быть больше 0" });
    }
    const receipt = this.gateway.authorize(intent);
    return { method: "card", status: "paid", receipt };
  }
}

class SbpProvider extends PaymentProvider {
  constructor(client) {
    super();
    this.client = client;
  }

  charge(intent) {
    const qr = this.client.createQr(intent);
    return { method: "sbp", status: "pending", qr };
  }
}

class Order {
  #status = "created";

  constructor({ id, customerId, lines, address, amountKopecks }) {
    this.id = id;
    this.customerId = customerId;
    this.lines = lines;
    this.address = address;
    this.amountKopecks = amountKopecks;
  }

  get status() {
    return this.#status;
  }

  attachPayment(payment) {
    if (this.#status !== "created") {
      throw new ConflictError("Заказ уже обработан");
    }
    this.payment = payment;
    this.#status = payment.status === "pending" ? "pending" : "paid";
  }
}

class CheckoutService {
  constructor({ catalog, payments, ids = () => crypto.randomUUID() }) {
    this.catalog = catalog;
    this.payments = payments;
    this.ids = ids;
  }

  place({ customerId, items, address, providerName }) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new ValidationError({ items: "Корзина пуста" });
    }

    const provider = this.payments.get(providerName);
    if (!provider) {
      throw new ValidationError({ providerName: "Неизвестный способ оплаты" });
    }

    const lines = items.map(({ productId, qty }) => {
      if (!Number.isInteger(qty) || qty <= 0) {
        throw new ValidationError({ [productId]: "Количество больше 0" });
      }
      const product = this.catalog.get(productId);
      if (qty > product.stock) {
        throw new ValidationError({ [productId]: "Недостаточно на складе" });
      }
      return {
        productId: product.id,
        title: product.title,
        qty,
        priceKopecks: product.priceKopecks,
        lineKopecks: product.priceKopecks * qty,
      };
    });

    const amountKopecks = lines.reduce((sum, line) => sum + line.lineKopecks, 0);
    const order = new Order({
      id: this.ids(),
      customerId,
      lines,
      address,
      amountKopecks,
    });

    const payment = provider.charge({
      orderId: order.id,
      customerId,
      amountKopecks,
      currency: "RUB",
    });

    for (const line of lines) {
      this.catalog.get(line.productId).stock -= line.qty;
    }
    order.attachPayment(payment);
    return order;
  }
}

const catalog = new Catalog()
  .add(new Product({ id: "lamp", title: "Лампа", priceKopecks: 199000, stock: 2 }))
  .add(new Product({ id: "bulb", title: "Лампа-колба", priceKopecks: 15000, stock: 10 }));

let seq = 0;
const checkout = new CheckoutService({
  catalog,
  ids: () => `ord-${++seq}`,
  payments: new Map([
    [
      "card",
      new CardProvider({
        authorize: (intent) => ({ id: `pay-${intent.orderId}`, amount: intent.amountKopecks }),
      }),
    ],
    [
      "sbp",
      new SbpProvider({
        createQr: (intent) => `https://pay.example/qr/${intent.orderId}`,
      }),
    ],
  ]),
});

const address = new Address({
  city: "Москва",
  street: "Тверская, 1",
  zip: "125009",
});

const paid = checkout.place({
  customerId: "u-1",
  items: [
    { productId: "lamp", qty: 1 },
    { productId: "bulb", qty: 2 },
  ],
  address,
  providerName: "card",
});

assert.equal(paid.status, "paid");
assert.equal(paid.amountKopecks, 229000);
assert.equal(paid.payment.method, "card");
assert.equal(catalog.get("lamp").stock, 1);

const pending = checkout.place({
  customerId: "u-1",
  items: [{ productId: "lamp", qty: 1 }],
  address,
  providerName: "sbp",
});
assert.equal(pending.status, "pending");
assert.match(pending.payment.qr, /ord-2/);

assert.throws(
  () =>
    checkout.place({
      customerId: "u-1",
      items: [{ productId: "lamp", qty: 5 }],
      address,
      providerName: "card",
    }),
  (err) => err instanceof ValidationError && err.fields.lamp.includes("складе")
);

assert.throws(() => paid.attachPayment({ status: "paid" }), ConflictError);
assert.throws(
  () => new Address({ city: "", street: "Тверская", zip: "125009" }),
  ValidationError
);

console.log("10 checkout");
console.log("  card", paid.id, paid.status, paid.amountKopecks);
console.log("  sbp", pending.id, pending.status, pending.payment.qr);
console.log("  lamp stock", catalog.get("lamp").stock);
