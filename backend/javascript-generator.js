/*
 * Translation to JavaScript
 *
 * Requiring this module adds a gen() method to each of the AST classes, except
 * for types, and fields, which don’t figure into code generation. It exports a
 * function that generates a complete, pretty-printed JavaScript program for a
 * HYPER! expression, bundling the translation of the HYPER! standard library with
 * the expression's translation.
 *
 * Each gen() method returns a fragment of JavaScript.
 *
 *   const generate = require('./backend/javascript-generator');
 *   generate(hyperExpression);
 */

const beautify = require("js-beautify");
const {
  Program,
  Block,
  ForStatement,
  WhileStatement,
  IfStatement,
  Func,
  Assignment,
  Declaration,
  PrintStatement,
  ReturnStatement,
  Break,
  BinaryExp,
  UnaryExp,
  ArrayExp,
  DictExp,
  TupleExp,
  CallExp,
  RangeExp,
  MemberExp,
  SubscriptedExp,
  Param,
  KeyValue,
  Literal,
  Identifier,
} = require("../ast");
const { StringType } = require("../semantics/builtins");

function makeOp(op) {
  return (
    {
      EQUALS: "===",
      NOTEQ: "!==",
      LESS: "<",
      LESSEQ: "<=",
      GRTEQ: ">=",
      AND: "&&",
      OR: "||",
      ADD: "+",
      SUB: "-",
      MULT: "*",
      DIV: "/",
      MOD: "%",
      "~": "!",
    }[op] || op
  );
}

// javaScriptId(e) takes any HYPER! object with an id property, such as a Variable,
// Param, or Func, and produces a JavaScript name by appending a unique identifying
// suffix, such as '_1' or '_503'. It uses a cache so it can return the same exact
// string each time it is called with a particular entity.
const javaScriptId = (() => {
  let lastId = 0;
  const map = new Map();
  return (v) => {
    if (!map.has(v)) {
      map.set(v, ++lastId); // eslint-disable-line no-plusplus
    }
    return `${v.id}_${map.get(v)}`;
  };
})();

const builtin = {
  SAY([s]) {
    return `console.log(${s})`;
  },
  SIZE([s]) {
    return `${s}.length`;
  },
  SUBSTRING([s, i, n]) {
    return `${s}.substr(${i}, ${n})`;
  },
  CONCAT([s, t]) {
    return `${s}.concat(${t})`;
  },
  PUSH([a, u]) {
    return `${a}.push(${u})`;
  },
  EXIT(code) {
    return `process.exit(${code})`;
  },
};

function generateBlock(block) {
  return block.map((s) => `${s.gen()};`).join("");
}

module.exports = function(exp) {
  return beautify(exp.gen(), { indent_size: 2 });
};

Program.prototype.gen = function() {
  return this.block.gen();
};

Block.prototype.gen = function() {
  const statements = this.statements.map((s) => `${s.gen()};`);
  return `${statements.join("")}`;
};

PrintStatement.prototype.gen = function() {
  return ``;
};

ForStatement.prototype.gen = function() {
  const body = generateBlock(this.body);
  return `for (${this.index.gen()} of ${this.collection.gen()}) {${body}}`;
};

Func.prototype.gen = function() {
  const name = javaScriptId(this);
  const params = this.params ? this.params.map((p) => javaScriptId(p)) : [""];
  const body = generateBlock(this.body);
  return `function ${name} (${params.join(",")}) {${body}}`;
};

Assignment.prototype.gen = function() {
  return `${this.target.gen()} = ${this.source.gen()}`;
};

Declaration.prototype.gen = function() {
  const exp = this.init ? this.init.gen() : undefined;
  const init = exp ? `= ${exp}` : ``;
  return `let ${javaScriptId(this)} ${init}`;
};

ReturnStatement.prototype.gen = function() {
  // const exp = this.expression ? this.expression.gen() :
  return `return ${this.expression.gen()}`;
};

BinaryExp.prototype.gen = function() {
  return `(${this.left.gen()} ${makeOp(this.op)} ${this.right.gen()})`;
};

UnaryExp.prototype.gen = function() {
  return `(${makeOp(this.op)} (${this.operand.gen()}))`;
};

ArrayExp.prototype.gen = function() {
  const elements = this.members.map((e) => e.gen());
  return `Array(${this.size.gen()}).fill(${elements})`;
};

CallExp.prototype.gen = function() {
  const args = this.args.map((a) => a.gen());
  if (this.callee.ref.builtin) {
    return builtin[this.callee.ref.id](args);
  }
  return `${javaScriptId(this.callee.ref)}(${args.join(",")})`;
};

// isOpenInclusive, start, end, step, isCloseInclusive
RangeExp.prototype.gen = function() {
  const start = this.isOpenInclusive ? this.start.gen() : this.start.gen() + 1;
  const end = this.isCloseInclusive ? this.end.gen() + 1 : this.end.gen();
  const step = this.step ? this.step.gen() : 1;
  return `Array.from({ length: (${end} - ${start} + 1) / ${step}}, (_, i) => ${start} + i * ${step} )`;
};

Literal.prototype.gen = function() {
  return this.type === StringType ? `"${this.value}"` : this.value;
};

Identifier.prototype.gen = function() {
  return javaScriptId(this.ref);
};
