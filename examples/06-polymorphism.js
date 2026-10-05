// Полиморфизм: фигуры из занятия и каналы уведомлений.
// Запуск: node examples/06-polymorphism.js

const assert = require("node:assert/strict");

class Shape {
  area() {
    throw new Error("area() нужно переопределить");
  }

  perimeter() {
    throw new Error("perimeter() нужно переопределить");
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }

  perimeter() {
    return 2 * (this.width + this.height);
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  area() {
    return Math.PI * this.radius ** 2;
  }

  perimeter() {
    return 2 * Math.PI * this.radius;
  }
}

function describeShape(shape) {
  return { area: shape.area(), perimeter: shape.perimeter() };
}

const shapes = [new Rectangle(5, 3), new Circle(4)];
assert.equal(describeShape(shapes[0]).area, 15);
assert.equal(describeShape(shapes[0]).perimeter, 16);
assert.ok(Math.abs(describeShape(shapes[1]).area - Math.PI * 16) < 1e-9);

class NotificationChannel {
  send(_user, _message) {
    throw new Error("send() нужно переопределить");
  }
}

class EmailChannel extends NotificationChannel {
  constructor(outbox) {
    super();
    this.outbox = outbox;
  }

  send(user, message) {
    if (!user.email) return { ok: false, channel: "email", reason: "нет адреса" };
    this.outbox.push({ to: user.email, message });
    return { ok: true, channel: "email" };
  }
}

class TelegramChannel extends NotificationChannel {
  constructor(outbox) {
    super();
    this.outbox = outbox;
  }

  send(user, message) {
    if (!user.telegramId) {
      return { ok: false, channel: "telegram", reason: "нет chat id" };
    }
    this.outbox.push({ chatId: user.telegramId, message });
    return { ok: true, channel: "telegram" };
  }
}

class PushChannel extends NotificationChannel {
  constructor(outbox) {
    super();
    this.outbox = outbox;
  }

  send(user, message) {
    if (!user.deviceToken) {
      return { ok: false, channel: "push", reason: "нет токена" };
    }
    this.outbox.push({ token: user.deviceToken, message });
    return { ok: true, channel: "push" };
  }
}

function notify(channels, user, message) {
  return channels.map((channel) => channel.send(user, message));
}

const outbox = [];
const results = notify(
  [new EmailChannel(outbox), new TelegramChannel(outbox), new PushChannel(outbox)],
  { email: "ada@example.com", telegramId: 100, deviceToken: "" },
  "Заказ оплачен"
);

assert.deepEqual(
  results.map((item) => item.ok),
  [true, true, false]
);
assert.equal(outbox.length, 2);

console.log("06 polymorphism");
console.log("  rectangle area", describeShape(shapes[0]).area);
console.log("  notify", results.map((item) => `${item.channel}:${item.ok}`).join(", "));
