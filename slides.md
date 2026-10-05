<!-- .slide: class="dark" data-background-color="#1c1917" -->

<div class="vcenter">
<p class="kicker">JavaScript · урок 2</p>
<h1>ООП в JavaScript</h1>
<p class="lede">Классы, прототипы, наследование.<br>На примерах из реального сервиса: ошибки API, деньги, корзина, заказ.</p>
<p class="hint">→ по порядку · O карта слайдов · S заметки · Alt+клик увеличить код</p>
</div>

Note:
Помимо базовой темы, в занятии разобраны прототипы и сервисные кейсы: ошибки API, деньги, корзина, уведомления, оплата. Полный код в examples/, каждый файл запускается через node.

---

<p class="kicker">Старт</p>

## Цели занятия

- Понимать ООП как способ справляться со сложностью
- Понимать, как класс устроен на прототипах
- Защищать правила внутри объекта и подменять реализации через общий контракт
- Выбирать между наследованием и композицией под задачу
- Написать расширяемый `deepEqual` и увидеть в нём привычную структуру сервисного кода

--

<p class="kicker">Старт</p>

## Маршрут

<div class="agenda">
<div><b>01</b><span>Абстракция: зачем вообще объекты</span></div>
<div><b>02</b><span>Прототипы, которые классы прячут</span></div>
<div><b>03</b><span>Классы ES6</span></div>
<div><b>04</b><span>Наследование и ошибки API</span></div>
<div><b>05</b><span>Инкапсуляция, деньги и корзина</span></div>
<div><b>06</b><span>Полиморфизм и уведомления</span></div>
<div><b>07</b><span>Композиция, миксины</span></div>
<div><b>08</b><span>deepEqual, Strategy, SOLID</span></div>
<div><b>09</b><span>Как выделять сущности</span></div>
<div><b>10</b><span>Сквозной кейс: оформление заказа</span></div>
</div>

--

<p class="kicker">Старт</p>

## Результат занятия

<div class="cols">
<div class="card">
<h3>В коде</h3>
<p><code>DeepEqualEngine</code> сравнивает примитивы, объекты, массивы, даты, регулярки и <code>Map</code>. Новый тип добавляется классом, движок не переписывается.</p>
</div>
<div class="card">
<h3>В голове</h3>
<p>Вы сможете объяснить, где хранится метод класса, от чего защищает <code>#поле</code> и почему заказ не должен сам считать скидку, проводить платёж и отправлять письма.</p>
</div>
</div>

<p class="callout">Прототипам посвящена отдельная глава. Без них <code>class</code> выглядит магией.</p>

--

<p class="kicker">Старт</p>

## Компетенции

<div class="cols">
<div class="card">
<h3>Язык</h3>
<p>Современный JavaScript: классы, приватные поля, геттеры, статические фабрики, цепочка прототипов.</p>
</div>
<div class="card">
<h3>Модель</h3>
<p>Наследование, инкапсуляция, полиморфизм, композиция. Понимать, какую проблему решает каждый приём.</p>
</div>
</div>

<div class="card" style="margin-top: 14px">
<h3>Архитектура</h3>
<p>Маленькие взаимозаменяемые объекты вместо одной функции, которая знает про все типы сразу. Разберём это на <code>deepEqual</code> и на заказе.</p>
</div>

---

<!-- .slide: class="dark" data-background-color="#1c1917" -->

<div class="vcenter">
<p class="chapter-no">01</p>
<h2>Абстракция</h2>
<p>Объект нужен, чтобы держать в голове меньше деталей.</p>
</div>

--

<p class="kicker">Абстракция</p>

## Что такое ООП

Программа как набор объектов. У каждого свои данные и допустимые действия с ними.

<div class="card" style="margin-top: 18px">
<h3>Зачем это нужно</h3>
<p>В рабочей памяти помещается около 7±2 элементов. Абстракция сворачивает десяток переменных в один: «пользователь», «заказ», «платёж».</p>
</div>

<p class="callout info">Класс, <code>extends</code> и <code>#поле</code> — средства упаковки, но упаковать можно и обычным объектом.</p>

--

<p class="kicker">Абстракция <span class="tag base">из занятия</span></p>

## Россыпь переменных

<div class="cols">
<div>
<div class="two-title"><h3>Без объекта</h3></div>
<pre><code class="language-javascript">const nameA = "Bob";
const ageA = 17;
const emailA = "bob@example.com";

const nameB = "Sam";
const ageB = 28;
const emailB = "sam@example.com";

// Чью почту хранит emailA, приходится помнить самому</code></pre>
</div>
<div>
<div class="two-title"><h3>Один объект — один человек</h3></div>
<pre><code class="language-javascript">const bob = {
  name: "Bob",
  age: 17,
  email: "bob@example.com",
};

const sam = {
  name: "Sam",
  age: 28,
  email: "sam@example.com",
};</code></pre>
</div>
</div>

--

<p class="kicker">Абстракция <span class="tag base">из занятия</span></p>

## Данные плюс поведение

```javascript
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
};

bob.greet();   // "Hi"
bob.canVote(); // false
```

<p class="callout">Правило «с 18 лет» хранится рядом с возрастом, и копировать его в каждый <code>if</code> не нужно.</p>

<p class="file">examples/01-data-and-behavior.js</p>

--

<p class="kicker">Абстракция <span class="tag real">кейс</span></p>

## Примеры из сервиса

<div class="cols-4">
<div class="card"><h3>Cart</h3><p>Позиции и сумма. Количество 0 положить нельзя.</p></div>
<div class="card"><h3>Money</h3><p>Копейки и валюта. 10 USD нельзя сложить с 10 RUB.</p></div>
<div class="card"><h3>AppError</h3><p>Сообщение, HTTP-статус, код. Обработчик один на все ошибки.</p></div>
<div class="card"><h3>Comparator</h3><p>Умеет сравнивать один тип. Движок заранее ничего не знает про Date.</p></div>
</div>

<p class="callout good">Учебный <code>Person</code> остаётся, чтобы показать синтаксис. Рядом — объекты, которые встречаются в реальных сервисах.</p>

---

<!-- .slide: class="dark" data-background-color="#1c1917" -->

<div class="vcenter">
<p class="chapter-no">02</p>
<h2>Прототипы</h2>
<p>Объект может ссылаться на другой и брать у него свойства, которых нет у него самого.</p>
</div>

--

<p class="kicker">Прототипы</p>

## Что есть в языке на самом деле

<div class="cols">
<div class="card flat">
<h3>Что есть у движка</h3>
<p>Объекты и скрытая ссылка <code>[[Prototype]]</code>. Если свойства у объекта нет, поиск идёт в его прототип, затем в прототип прототипа и так до <code>null</code>.</p>
</div>
<div class="card flat">
<h3>Что такое class</h3>
<p>Функция-конструктор и объект <code>Person.prototype</code>, в котором лежат методы. <code>typeof Person === "function"</code>.</p>
</div>
</div>

<p class="callout warn">Метод не копируется в каждый экземпляр. Один <code>introduce</code> на прототипе работает для всех объектов <code>Person</code>.</p>

--

<p class="kicker">Прототипы</p>

## Куда идёт поиск

<div class="chain">
<div class="node"><strong>ada</strong><span>свои поля: name = "Ada"</span></div>
<div class="arrow">[[Prototype]] ↓ нет introduce — ищем выше</div>
<div class="node"><strong>Person.prototype</strong><span>introduce, isAdult</span></div>
<div class="arrow">[[Prototype]] ↓</div>
<div class="node"><strong>Object.prototype</strong><span>toString, hasOwnProperty</span></div>
<div class="arrow">[[Prototype]] ↓</div>
<div class="node"><strong>null</strong><span>конец цепочки. Свойство не найдено — получаем undefined</span></div>
</div>

--

<p class="kicker">Прототипы</p>

## Делегирование без new

```javascript
const personMethods = {
  introduce() {
    return `Меня зовут ${this.name}`;
  },
};

const ada = Object.create(personMethods);
ada.name = "Ada";

ada.introduce();                         // "Меня зовут Ada"
Object.getPrototypeOf(ada) === personMethods;
Object.hasOwn(ada, "introduce");         // false
Object.hasOwn(ada, "name");              // true
```

<p class="callout"><code>this</code> здесь — <code>ada</code>, объект слева от точки. Метод найден в прототипе, а данные берутся из самого объекта.</p>

<p class="file">examples/02-prototypes.js</p>

--

<p class="kicker">Прототипы</p>

## Функция-конструктор и class — одно и то же

<div class="cols">
<div>
<div class="two-title"><h3>До ES6</h3></div>
<pre><code class="language-javascript">function PersonFn(name, age) {
  this.name = name;
  this.age = age;
}

PersonFn.prototype.isAdult = function () {
  return this.age >= 18;
};

const a = new PersonFn("Grace", 36);
Object.getPrototypeOf(a) === PersonFn.prototype;</code></pre>
</div>
<div>
<div class="two-title"><h3>Синтаксис класса</h3></div>
<pre><code class="language-javascript">class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  isAdult() {
    return this.age >= 18;
  }
}

const b = new Person("Grace", 36);
Object.getPrototypeOf(b) === Person.prototype;</code></pre>
</div>
</div>

--

<p class="kicker">Прототипы</p>

## Куда класть поведение

| Задача | Куда |
| --- | --- |
| Общие методы экземпляров | `prototype` / тело класса |
| Фабрика, не привязанная к экземпляру | `static`, то есть свойство самой функции |
| Данные конкретной сущности | поля `this` внутри конструктора |
| Разовое делегирование без конструктора | `Object.create` |
| Словарь с чужими ключами | `Object.create(null)` |

<p class="callout info">Встроенные прототипы, например <code>Array.prototype</code>, не расширяем: добавленный метод может конфликтовать с чужим кодом и будущими стандартами.</p>

--

<p class="kicker">Прототипы <span class="tag real">кейс</span></p>

## Опасный ключ __proto__

<div class="cols">
<div>
<div class="two-title"><h3>Обычный объект</h3></div>
<pre><code class="language-javascript">const user = {};
user["__proto__"] = { isAdmin: true };

user.isAdmin;                  // true
({}).isAdmin;                  // undefined
Object.getPrototypeOf(user);   // { isAdmin: true }</code></pre>
</div>
<div>
<div class="two-title"><h3>Словарь без прототипа</h3></div>
<pre><code class="language-javascript">const dict = Object.create(null);
dict["__proto__"] = { isAdmin: true };
dict["toString"] = "не метод";

Object.getPrototypeOf(dict);   // null
dict["toString"];              // "не метод"</code></pre>
</div>
</div>

<p class="callout warn">У обычного объекта <code>__proto__</code> — это сеттер прототипа. Если рекурсивно копировать ключи из JSON, можно добраться до <code>Object.prototype</code> и добавить поля всем объектам в процессе. При копировании чужих ключей проверяйте <code>Object.hasOwn</code> и пропускайте <code>__proto__</code>, <code>constructor</code>, <code>prototype</code>.</p>

Note:
Показать только локальную смену прототипа у одного объекта и безопасное копирование. Не разбирать готовый гаджет для загрязнения Object.prototype: на слайде важен механизм языка и защита.

---

<!-- .slide: class="dark" data-background-color="#1c1917" -->

<div class="vcenter">
<p class="chapter-no">03</p>
<h2>Классы</h2>
<p>Короткая запись конструктора, методов, фабрик и вычисляемых свойств.</p>
</div>

--

<p class="kicker">Классы <span class="tag base">из занятия</span></p>

## Анатомия

```javascript
class Person {
  constructor(name = "Noname", age = 0) {
    this.name = name;
    this.age = age;
  }

  introduce() {
    return `Меня зовут ${this.name}, мне ${this.age}`;
  }

  get isAdult() {
    return this.age >= 18;
  }

  static createAdult(name) {
    return new Person(name, 18);
  }
}

const bob = new Person("Bob", 17);
Person.createAdult("John").isAdult; // true
```

<p class="callout"><code>createAdult</code> принадлежит самой функции <code>Person</code>, а не прототипу, поэтому у экземпляра её нет.</p>

--

<!-- .slide: class="dense" -->

<p class="kicker">Классы <span class="tag base">из занятия</span></p>

## Сеттер держит инвариант

```javascript
class Person {
  #age;

  constructor(name, age = 0) {
    this.name = name;
    this.age = age; // вызов сеттера, не запись в поле age
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
}
```

<p class="callout good">Снаружи доступ идёт через геттер и сеттер <code>age</code>, а значение лежит в <code>#age</code>. Если держать рядом <code>this.age</code> и <code>_age</code>, легко обратиться не к тому хранилищу.</p>

<p class="file">examples/03-classes-and-money.js</p>

---

<!-- .slide: class="dark" data-background-color="#1c1917" -->

<div class="vcenter">
<p class="chapter-no">04</p>
<h2>Наследование</h2>
<p>Дочерний класс подключается к цепочке прототипов родителя и добавляет свои методы.</p>
</div>

--

<!-- .slide: class="dense" -->

<p class="kicker">Наследование <span class="tag base">из занятия</span></p>

## extends и super

```javascript
class Employee extends Person {
  constructor(name, age, position, salary) {
    super(name, age);
    this.position = position;
    this.salary = salary;
  }

  introduce() {
    return `${super.introduce()}, я работаю ${this.position}`;
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
```

<p class="file">examples/04-inheritance.js</p>

--

<p class="kicker">Наследование</p>

## Это снова прототипы

<div class="chain">
<div class="node"><strong>alice</strong><span>name, age, position, salary, teamSize</span></div>
<div class="arrow">[[Prototype]] ↓</div>
<div class="node"><strong>Manager.prototype</strong><span>introduce менеджера</span></div>
<div class="arrow">[[Prototype]] ↓</div>
<div class="node"><strong>Employee.prototype</strong><span>introduce сотрудника, annualSalary</span></div>
<div class="arrow">[[Prototype]] ↓</div>
<div class="node"><strong>Person.prototype</strong><span>introduce человека</span></div>
</div>

<p class="callout warn">Длинная цепочка <code>Person → Employee → Manager → Director</code> быстро становится хрупкой: каждый уровень зависит от устройства родителя. Для отношения «является» это терпимо, для «умеет ещё и» — нет.</p>

--

<!-- .slide: class="dense" -->

<p class="kicker">Наследование <span class="tag real">кейс</span></p>

## Ошибки HTTP: наследование к месту

```javascript
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
```

<p class="callout"><code>new.target</code> — класс, который вызвали через <code>new</code>. Поэтому в логе будет <code>NotFoundError</code>, а не <code>AppError</code>.</p>

--

<p class="kicker">Наследование <span class="tag real">кейс</span></p>

## Один обработчик на всю иерархию

```javascript
function toHttp(err) {
  if (err instanceof AppError) {
    return {
      status: err.status,
      body: { code: err.code, message: err.message, fields: err.fields },
    };
  }

  return {
    status: 500,
    body: { code: "INTERNAL", message: "Внутренняя ошибка" },
  };
}
```

<div class="cols" style="margin-top: 12px">
<div class="card"><h3>NotFoundError</h3><p>404, код <code>NOT_FOUND</code>. Клиент может отличить «нет товара» от «нет прав».</p></div>
<div class="card"><h3>Обычный Error</h3><p>Наружу уходит нейтральный текст. Строка <code>password=…</code> из драйвера не попадает в ответ.</p></div>
</div>

---

<!-- .slide: class="dark" data-background-color="#1c1917" -->

<div class="vcenter">
<p class="chapter-no">05</p>
<h2>Инкапсуляция</h2>
<p>Снаружи доступно только безопасное. Остальное объект защищает сам.</p>
</div>

--

<p class="kicker">Инкапсуляция</p>

## Прячем правила

<div class="cols-3">
<div class="card"><h3>Баланс</h3><p>Списать больше, чем есть, нельзя. Поле само по себе этого не знает.</p></div>
<div class="card"><h3>Деньги</h3><p>Сумма — целое число копеек в одной валюте. Обычный <code>number</code> в рублях этого не гарантирует.</p></div>
<div class="card"><h3>Корзина</h3><p>Нет строки с количеством 0. Цена фиксируется в момент добавления.</p></div>
</div>

<p class="callout">Публичный метод — единственный вход. Если он принимает любое число, приватное поле не поможет.</p>

--

<!-- .slide: class="dense" -->

<p class="kicker">Инкапсуляция <span class="tag base">из занятия</span></p>

## Приватные поля и методы

```javascript
class BankAccount {
  #balance;
  #accountNumber;

  constructor(accountNumber, initialBalance = 0) {
    this.#accountNumber = accountNumber;
    this.#balance = initialBalance;
  }

  withdraw(amount) {
    if (!this.#canWithdraw(amount)) return false;
    this.#balance -= amount;
    return true;
  }

  get balance() {
    return this.#balance;
  }

  #canWithdraw(amount) {
    return amount > 0 && amount <= this.#balance;
  }
}
```

<p class="callout">Обращение <code>account.#balance</code> снаружи класса — синтаксическая ошибка, а не <code>undefined</code>. Другой экземпляр того же класса к полю обратиться может, на этом держится <code>Money.add</code>.</p>

<p class="file">examples/05-encapsulation.js</p>

--

<p class="kicker">Инкапсуляция</p>

## # и подчёркивание

| | `#balance` | `_balance` |
| --- | --- | --- |
| Кто видит | Только этот класс | Кто угодно |
| Наследник | Не видит. Расширять через публичные методы | Видит и может нарушить правило родителя |
| Смысл | Защита правила | Соглашение об имени |

<p class="callout warn"><code>SavingsAccount</code> не может написать <code>this.#balance *= 1.01</code>. Проценты начисляют через метод родителя, например <code>deposit</code>, либо родитель предоставляет для этого отдельную операцию.</p>

--

<!-- .slide: class="dense" -->

<p class="kicker">Инкапсуляция <span class="tag real">кейс</span></p>

## Деньги — объект-значение

```javascript
class Money {
  #kopecks;
  #currency;

  static fromRubles(value, currency = "RUB") {
    return new Money(Math.round(value * 100), currency);
  }

  add(other) {
    if (!(other instanceof Money) || other.#currency !== this.#currency) {
      throw new Error("Нельзя сложить разные валюты");
    }
    return new Money(this.#kopecks + other.#kopecks, this.#currency);
  }
}

Money.fromRubles(120.5).add(Money.fromRubles(10)).format();
// "130.50 RUB"
```

<p class="callout good">Каждое сложение возвращает новый объект, поэтому старую сумму не изменить случайно. Копейки в целых числах избавляют от ошибок округления двоичных дробей.</p>

--

<!-- .slide: class="dense" -->

<p class="kicker">Инкапсуляция <span class="tag real">кейс</span></p>

## Корзина не отдаёт свой Map

```javascript
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

  snapshot() {
    return [...this.#lines.values()];
  }
}
```

<p class="callout">Цена копируется в строку корзины. Если магазин позже изменит <code>product.priceKopecks</code>, цена уже добавленного товара не изменится. При оформлении заказа цену всё равно сверяют с каталогом.</p>

---

<!-- .slide: class="dark" data-background-color="#1c1917" -->

<div class="vcenter">
<p class="chapter-no">06</p>
<h2>Полиморфизм</h2>
<p>Код вызывает метод, а какая реализация выполнится, определяется во время работы программы.</p>
</div>

--

<!-- .slide: class="dense" -->

<p class="kicker">Полиморфизм <span class="tag base">из занятия</span></p>

## Один вызов, разные фигуры

```javascript
class Shape {
  area() { throw new Error("переопределите area()"); }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
  area() { return this.width * this.height; }
}

class Circle extends Shape {
  constructor(radius) { super(); this.radius = radius; }
  area() { return Math.PI * this.radius ** 2; }
}

function totalArea(shapes) {
  return shapes.reduce((sum, shape) => sum + shape.area(), 0);
}
```

<p class="callout">В JavaScript нет ключевого слова <code>abstract</code>. Если базовый метод бросает ошибку, забытое переопределение сразу заметно. Периметр сделан так же: <code>examples/06-polymorphism.js</code>.</p>

--

<p class="kicker">Полиморфизм <span class="tag real">кейс</span></p>

## Каналы уведомления

```javascript
function notify(channels, user, message) {
  return channels.map((channel) => channel.send(user, message));
}

notify(
  [new EmailChannel(outbox), new TelegramChannel(outbox), new PushChannel(outbox)],
  { email: "ada@example.com", telegramId: 100, deviceToken: "" },
  "Заказ оплачен"
);
// email: ok, telegram: ok, push: нет токена
```

<div class="cols" style="margin-top: 14px">
<div class="card"><h3>Что знает notify</h3><p>Только то, что у канала есть <code>send(user, message)</code>. Про SMTP и Bot API он ничего не знает.</p></div>
<div class="card"><h3>Новый канал</h3><p>Достаточно написать класс с таким же методом и добавить его в массив. Код <code>notify</code> не меняется.</p></div>
</div>

<p class="file">examples/06-polymorphism.js</p>

---

<!-- .slide: class="dark" data-background-color="#1c1917" -->

<div class="vcenter">
<p class="chapter-no">07</p>
<h2>Композиция и миксины</h2>
<p>Умения проще держать в отдельных объектах, чем выстраивать в иерархию.</p>
</div>

--

<p class="kicker">Композиция <span class="tag base">из занятия</span></p>

## Утка, пингвин, игрушка

<div class="cols">
<div>
<pre><code class="language-javascript">class Duck {
  constructor() {
    this.moves = [
      new Walkable(),
      new Swimmable(),
      new Flyable(),
    ];
  }

  actions() {
    return this.moves.map((item) => item.move());
  }
}</code></pre>
</div>
<div>
<pre><code class="language-javascript">class Penguin {
  constructor() {
    this.moves = [new Walkable(), new Swimmable()];
  }
}

// Игрушечной утке хватит Walkable.
// При наследовании Bird → FlyingBird
// пингвин либо «умеет летать»,
// либо бросает исключения в каждом методе.</code></pre>
</div>
</div>

<p class="callout">Если умения сочетаются независимо, берите композицию. Наследование оставьте для случаев, когда подкласс можно безопасно подставить вместо родителя.</p>

<p class="file">examples/07-composition.js</p>

--

<p class="kicker">Композиция <span class="tag real">кейс</span></p>

## Оформление заказа собирается из политик

```javascript
class Checkout {
  constructor({ discount, payment, stock }) {
    this.discount = discount;
    this.payment = payment;
    this.stock = stock;
  }

  place(cart) {
    this.stock.reserve(cart.snapshot());
    const amount = this.discount.apply(cart.totalKopecks);
    return this.payment.charge(amount);
  }
}
```

<div class="cols-3" style="margin-top: 12px">
<div class="card"><h3>NoDiscount</h3><p>Возвращает сумму как есть.</p></div>
<div class="card"><h3>PercentageDiscount</h3><p>Та же роль, другая формула. Подставляется в конструктор.</p></div>
<div class="card"><h3>FakePayment</h3><p>В тесте настоящий шлюз не нужен. Контракт — <code>charge(amount)</code>.</p></div>
</div>

--

<p class="kicker">Композиция</p>

## Короткая шпаргалка

| | Наследование | Композиция |
| --- | --- | --- |
| Фраза | «является» | «содержит» / «пользуется» |
| Пример | `NotFoundError` является `AppError` | Заказ пользуется скидкой и шлюзом |
| Подмена | Наследник проходит `instanceof` родителя | Любой объект с нужными методами |
| Риск | Глубокая лестница, запреты в подклассах | Больше маленьких типов, их надо назвать |

--

<!-- .slide: class="dense" -->

<p class="kicker">Миксины <span class="tag base">из занятия</span></p>

## Методы, скопированные на прототип

```javascript
const LoggerMixin = {
  log(message) {
    const line = `[${this.constructor.name}] ${message}`;
    this.logs.push(line);
    return line;
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

applyMixins(User, LoggerMixin);
```

<p class="file">examples/08-mixins.js</p>

--

<p class="kicker">Миксины</p>

## Проблемы миксинов и замена

- Одинаковое имя: последний миксин молча затирает предыдущий
- В теле класса метода не видно: он добавлен извне
- Миксин рассчитывает на `this.logs`, но конструктор об этом не сообщает

```javascript
class AuditedUser {
  constructor(name, email, clock) {
    this.clock = clock;
    this.logs = [];
  }

  touch(reason) {
    this.updatedAt = this.clock.now();
    return this.log(`${reason} @ ${this.updatedAt.toISOString()}`);
  }
}
```

<p class="callout">Часы передаются снаружи, поэтому в тесте время можно зафиксировать. Зависимость видна в конструкторе, а не скрыта в миксине.</p>

---

<!-- .slide: class="dark" data-background-color="#1c1917" -->

<div class="vcenter">
<p class="chapter-no">08</p>
<h2>deepEqual</h2>
<p>Итог занятия: сравнение структур, которое можно расширять новыми типами.</p>
</div>

--

<p class="kicker">deepEqual <span class="tag base">из занятия</span></p>

## Задача

```javascript
const left = { a: 1, b: [2, 3], c: { d: 4 } };
const right = { c: { d: 4 }, b: [2, 3], a: 1 };

engine.deepEqual(left, right); // true
```

- Порядок ключей объекта не важен, порядок массива важен
- Дата равна дате с тем же `getTime()`, а не «пустому объекту»
- Цикл `node.self = node` не уходит в бесконечную рекурсию
- Для нового типа, например `URL`, не нужно переписывать всё сравнение

--

<p class="kicker">deepEqual</p>

## Одна функция знает слишком много

```javascript
function deepEqual(a, b) {
  if (a instanceof Date) return b instanceof Date && a.getTime() === b.getTime();
  if (a instanceof RegExp) return b instanceof RegExp && a.source === b.source;
  if (Array.isArray(a)) { /* длина и каждый индекс */ }
  if (a && typeof a === "object") { /* ключи и рекурсия */ }
  return Object.is(a, b);
}
```

<p class="callout warn">Каждый новый тип добавляет ветку в ту же функцию, и менять её становится страшно. Тогда сравнение стоит разнести по отдельным объектам.</p>

--

<p class="kicker">deepEqual <span class="tag base">из занятия</span></p>

## Контракт компаратора

```javascript
class Comparator {
  canHandle(_value) {
    throw new Error("canHandle() нужно переопределить");
  }

  compare(_a, _b, _context) {
    throw new Error("compare() нужно переопределить");
  }
}

class PrimitiveComparator extends Comparator {
  canHandle(value) {
    return value == null || typeof value !== "object";
  }

  compare(a, b, context) {
    return Object.is(a, b); // NaN равен NaN
  }
}
```

<p class="callout"><code>context</code> — это сам движок. Публичный <code>deepEqual</code> из компаратора вызывать нельзя: он сбросит информацию о текущем обходе.</p>

--

<!-- .slide: class="dense" -->

<p class="kicker">deepEqual <span class="tag base">из занятия</span></p>

## Массив и обычный объект

```javascript
class ArrayComparator extends Comparator {
  canHandle(value) { return Array.isArray(value); }

  compare(a, b, context) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, index) => context.compareNested(item, b[index]));
  }
}

class ObjectComparator extends Comparator {
  canHandle(value) { return isPlainObject(value); }

  compare(a, b, context) {
    if (!isPlainObject(b)) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(
      (key) => Object.hasOwn(b, key) && context.compareNested(a[key], b[key])
    );
  }
}
```

<p class="callout info"><code>isPlainObject</code> проверяет, что прототип — <code>Object.prototype</code> или <code>null</code>. Дата, <code>Map</code> и экземпляры классов не подходят.</p>

--

<!-- .slide: class="dense" -->

<p class="kicker">deepEqual <span class="tag base">из занятия</span></p>

## Движок подбирает стратегию

```javascript
class DeepEqualEngine {
  constructor() {
    this.comparators = [
      new PrimitiveComparator(),
      new DateComparator(),
      new RegExpComparator(),
      new MapComparator(),
      new ArrayComparator(),
      new ObjectComparator(), // последний: самый общий
    ];
  }

  deepEqual(a, b) {
    this.#seen = new WeakMap();
    return this.#compare(a, b);
  }

  findComparator(value) {
    return this.comparators.find((item) => item.canHandle(value));
  }

  addComparator(comparator) {
    this.comparators.unshift(comparator); // приоритет выше общих
  }
}
```

<p class="file">examples/09-deep-equal.js</p>

--

<p class="kicker">deepEqual</p>

## Защита от циклических ссылок

```javascript
#compare(a, b) {
  const bothObjects = isObject(a) && isObject(b);
  if (bothObjects && this.#seen.get(a)?.has(b)) return true;

  if (bothObjects) this.#remember(a, b);
  try {
    return this.findComparator(a).compare(a, b, this);
  } finally {
    if (bothObjects) this.#forget(a, b);
  }
}
```

- Память о парах создаётся заново на каждый публичный вызов
- Пара хранится только пока она сравнивается
- Повторная встреча той же пары означает цикл: считаем её равной и выходим
- После сравнения пару удаляем, иначе неудачная попытка повлияет на следующие

Note:
Типичная ошибка: хранить WeakSet на движке, класть в него только a и не очищать. Второй вызов и сравнение массивов без учёта порядка начинают давать неверный результат. Здесь хранится пара a/b, пока она на стеке.

--

<p class="kicker">deepEqual <span class="tag base">из занятия</span></p>

## Новый тип — новый класс

```javascript
class DateComparator extends Comparator {
  canHandle(value) {
    return value instanceof Date;
  }

  compare(a, b) {
    return b instanceof Date && Object.is(a.getTime(), b.getTime());
  }
}

class UrlComparator extends Comparator {
  canHandle(value) { return value instanceof URL; }
  compare(a, b) { return b instanceof URL && a.href === b.href; }
}

engine.addComparator(new UrlComparator());
```

<p class="callout warn">Порядок важен. Если более общий компаратор стоит выше <code>DateComparator</code>, дату получит он: <code>typeof date === "object"</code>, а <code>Object.keys(date)</code> пуст, поэтому две разные даты окажутся «равными». Частные компараторы ставят выше общих, порядок <code>canHandle</code> — часть контракта.</p>

--

<p class="kicker">deepEqual <span class="tag base">из занятия</span></p>

## Strategy: опции выбирают алгоритм

```javascript
this.comparators = [
  new PrimitiveComparator(), // смотрит options.caseSensitive
  options.ignoreArrayOrder
    ? new UnorderedArrayComparator()
    : new ArrayComparator(),
  new ObjectComparator(),
];

const loose = new DeepEqualEngine({
  ignoreArrayOrder: true,
  caseSensitive: false,
});

loose.deepEqual(
  [{ sku: "A", title: "Лампа" }, { sku: "B" }],
  [{ sku: "B" }, { sku: "A", title: "лампа" }]
); // true
```

<p class="callout">Тот же приём, что и со скидкой в <code>Checkout</code>: реализацию выбирают снаружи и передают внутрь. Проверки <code>if (options…)</code> не разбегаются по всем компараторам.</p>

--

<p class="kicker">deepEqual <span class="tag base">из занятия</span></p>

## SOLID на этом примере

| | Как выполнено |
| --- | --- |
| S · одна причина меняться | Компаратор знает один тип |
| O · открыт для расширения | `addComparator`, старые классы не трогаем |
| L · подстановка | Любой наследник `Comparator` стоит в том же массиве |
| I · узкий контракт | Два метода: `canHandle` и `compare` |
| D · зависимость от абстракции | Движок зовёт `Comparator`, не `Date` напрямую |

---

<!-- .slide: class="dark" data-background-color="#1c1917" -->

<div class="vcenter">
<p class="chapter-no">09</p>
<h2>Сущности</h2>
<p>Сначала процесс словами, потом существительные, потом ответственности.</p>
</div>

--

<p class="kicker">Сущности <span class="tag base">из занятия</span></p>

## Покупка словами

<ol class="steps">
<li>Человек выбирает <strong>товар</strong> из <strong>каталога</strong></li>
<li>Кладёт его в <strong>корзину</strong></li>
<li>Оформляет <strong>заказ</strong> и указывает <strong>адрес</strong></li>
<li>Платит через конкретную <strong>платёжную систему</strong></li>
</ol>

--

<p class="kicker">Сущности <span class="tag base">из занятия</span></p>

## Существительное → ответственность

| Сущность | Отвечает за | Не отвечает за |
| --- | --- | --- |
| `Product` | Название, цена, остаток | Письмо покупателю |
| `Catalog` | Найти товар или честно сказать, что его нет | Скидку |
| `Cart` | Состав и количества | Списание денег |
| `Order` | Снимок покупки и её статус | Протокол СБП |
| `PaymentProvider` | Провести оплату своим способом | Остатки на складе |

--

<p class="kicker">Сущности</p>

## Две плохие крайности

<div class="cols">
<div class="card">
<h3>Анемичный мешок</h3>
<p>У <code>Order</code> только поля, а правила разбросаны по коду: «не оплачивать дважды» проверяют в трёх местах и забывают проверить в четвёртом.</p>
</div>
<div class="card">
<h3>God-object</h3>
<p>Тот же <code>Order</code> сам обращается в банк, шлёт Telegram, резервирует склад и считает НДС. Чтобы протестировать оплату, приходится поднимать половину системы.</p>
</div>
</div>

<p class="callout good">Золотая середина: объект хранит свои правила и обращается к соседям через небольшие методы, а процессом управляет отдельный <code>CheckoutService</code>.</p>

---

<!-- .slide: class="dark" data-background-color="#1c1917" -->

<div class="vcenter">
<p class="chapter-no">10</p>
<h2>Оформление заказа</h2>
<p>Каталог, адрес, оплата картой или через СБП. Цену берём из каталога, а не из браузера.</p>
</div>

--

<p class="kicker">Заказ <span class="tag real">кейс</span></p>

## Кто с кем говорит

<div class="cols-3">
<div class="card"><h3>Catalog</h3><p>Отдаёт товар. Нет id — <code>NotFoundError</code>.</p></div>
<div class="card"><h3>Address</h3><p>Конструктор требует город, улицу и индекс, поэтому некорректный адрес создать нельзя.</p></div>
<div class="card"><h3>Order</h3><p>Хранит статус в <code>#status</code>. Повторная оплата вызывает <code>ConflictError</code>.</p></div>
</div>

<div class="cols" style="margin-top: 14px">
<div class="card"><h3>CardProvider</h3><p>Шлюз авторизует сумму. Статус заказа становится <code>paid</code>.</p></div>
<div class="card"><h3>SbpProvider</h3><p>Тот же <code>charge</code>, но результат — QR и статус <code>pending</code>, пока человек не подтвердит перевод.</p></div>
</div>

<p class="file">examples/10-checkout.js</p>

--

<!-- .slide: class="dense" -->

<p class="kicker">Заказ <span class="tag real">кейс</span></p>

## Два провайдера, один вызов

<div class="cols">
<div>
<pre><code class="language-javascript">class CardProvider extends PaymentProvider {
  charge(intent) {
    if (intent.currency !== "RUB") {
      throw new ValidationError({
        currency: "Карта принимает только RUB",
      });
    }
    const receipt = this.gateway.authorize(intent);
    return { method: "card", status: "paid", receipt };
  }
}</code></pre>
</div>
<div>
<pre><code class="language-javascript">class SbpProvider extends PaymentProvider {
  charge(intent) {
    const qr = this.client.createQr(intent);
    return { method: "sbp", status: "pending", qr };
  }
}

order.attachPayment(payment);
// pending остаётся pending,
// paid становится paid</code></pre>
</div>
</div>

<p class="callout">В <code>CheckoutService</code> нет <code>if (providerName === "sbp")</code>: он берёт провайдера из <code>Map</code> и вызывает <code>charge</code>.</p>

--

<p class="kicker">Заказ <span class="tag real">кейс</span></p>

## Сервис управляет процессом

```javascript
const product = this.catalog.get(productId);
if (qty > product.stock) {
  throw new ValidationError({ [productId]: "Недостаточно на складе" });
}

const payment = provider.charge({
  orderId: order.id,
  amountKopecks, // цена × количество из каталога
  currency: "RUB",
});

order.attachPayment(payment);
```

- Инкапсуляция: заказ с некорректным статусом или адресом создать нельзя
- Полиморфизм: карта и СБП подставляются друг вместо друга
- Композиция: сервис использует каталог и таблицу провайдеров, а не наследуется от них
- Наследование: все ожидаемые сбои — это `AppError` со статусом

---

<p class="kicker">Финал</p>

## Шпаргалка

| Вопрос | Куда смотреть |
| --- | --- |
| Где лежит метод? | На `prototype`, один на все экземпляры |
| Как защитить правило? | `#поле` и проверка в методе |
| Когда `extends`? | Устойчивое «является»: ошибки, канал, провайдер |
| Когда композиция? | Умения комбинируются: скидка, склад, шлюз |
| Как добавить тип в deepEqual? | Новый `Comparator` выше общего объектного |
| Как выделять классы? | Существительные из описания процесса, по одной ответственности |

--

<p class="kicker">Финал</p>

## Частые поломки

- Цепочка из пяти `extends`, хотя умения независимы
- Публичное поле, от которого зависит сумма или статус
- `Order`, который платит, пишет на склад и шлёт письма
- Компаратор даты стоит ниже общего объектного: даты сравниваются как `{}`
- `WeakSet` для циклов, который не очищают между вызовами
- Миксин с тем же именем метода, что уже есть у класса
- Подкласс, который пытается прочитать `#поле` родителя

--

<p class="kicker">Финал</p>

## Практика и задание

Официальное домашнее задание — в учебном портале и в ветке урока.

<div class="cols">
<div>
<p class="mini">Запустить все примеры</p>
<pre><code class="language-bash">node examples/run-all.js</code></pre>
<ul class="mini">
<li><code>01</code> данные и методы</li>
<li><code>02</code> прототипы и словари</li>
<li><code>03</code> класс и <code>Money</code></li>
<li><code>04</code> сотрудники и ошибки API</li>
<li><code>05</code> счёт и корзина</li>
</ul>
</div>
<div>
<p class="mini">Что попробовать самостоятельно</p>
<ul>
<li><code>06</code> фигуры и уведомления</li>
<li><code>07</code> композиция оформления</li>
<li><code>08</code> миксины</li>
<li><code>09</code> deepEqual — добавить <code>Set</code> по образцу <code>Map</code></li>
<li><code>10</code> заказ: довести СБП из <code>pending</code> в <code>paid</code></li>
</ul>
</div>
</div>

--

<!-- .slide: class="dark" data-background-color="#1c1917" -->

<div class="vcenter">
<p class="kicker">Вопросы</p>
<h2>Вопросы для обсуждения</h2>
<ul>
<li>Чем в коде различаются класс и прототип?</li>
<li>Где иерархия уместна, а где она начнёт мешать?</li>
<li>Что именно защищает приватное поле?</li>
<li>Почему композиция лучше иерархии умений?</li>
<li>Какой принцип SOLID вы узнаёте в <code>addComparator</code>?</li>
</ul>
<p class="hint">Дальше: напишите свой deepEqual или небольшой checkout по образцу из examples/</p>
</div>
