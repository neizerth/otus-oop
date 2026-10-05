// Наследование: короткий is-a и рабочая иерархия ошибок API.
// Запуск: node examples/04-inheritance.js

const assert = require("node:assert/strict");

class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  introduce() {
    return `Меня зовут ${this.name}`;
  }
}

class Employee extends Person {
  constructor(name, age, position, salary) {
    super(name, age);
    this.position = position;
    this.salary = salary;
  }

  introduce() {
    return `${super.introduce()}, я работаю ${this.position}`;
  }

  annualSalary() {
    return this.salary * 12;
  }
}

class Manager extends Employee {
  constructor(name, age, salary, teamSize) {
    super(name, age, "менеджером", salary);
    this.teamSize = teamSize;
  }

  introduce() {
    return `${super.introduce()} и веду команду из ${this.teamSize}`;
  }
}

const alice = new Manager("Alice", 30, 5000, 5);
assert.match(alice.introduce(), /Alice/);
assert.match(alice.introduce(), /команду из 5/);
assert.equal(alice.annualSalary(), 60000);
assert.equal(Object.getPrototypeOf(Manager.prototype), Employee.prototype);

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
    this.resource = resource;
    this.id = id;
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, { status: 409, code: "CONFLICT" });
  }
}

function toHttp(err) {
  if (err instanceof AppError) {
    return {
      status: err.status,
      body: {
        code: err.code,
        message: err.message,
        fields: err.fields,
      },
    };
  }

  return {
    status: 500,
    body: { code: "INTERNAL", message: "Внутренняя ошибка" },
  };
}

const missing = toHttp(new NotFoundError("Товар", "sku-41"));
assert.equal(missing.status, 404);
assert.equal(missing.body.code, "NOT_FOUND");

const invalid = toHttp(new ValidationError({ email: "Укажите почту" }));
assert.equal(invalid.status, 400);
assert.equal(invalid.body.fields.email, "Укажите почту");

const leaked = toHttp(new Error("password=secret"));
assert.equal(leaked.status, 500);
assert.equal(leaked.body.message, "Внутренняя ошибка");
assert.equal(leaked.body.message.includes("secret"), false);

assert.equal(new ConflictError("Заказ уже оплачен") instanceof AppError, true);

console.log("04 inheritance");
console.log(" ", alice.introduce());
console.log(" ", missing.status, missing.body.code);
console.log(" ", invalid.status, JSON.stringify(invalid.body.fields));
