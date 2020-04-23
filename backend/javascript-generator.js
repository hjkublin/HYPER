/*
 * Translation to JavaScript
 *
 * Requiring this module adds a gen() method to each of the AST classes, except
 * for types, and fields, which don’t figure into code generation. It exports a
 * function that generates a complete, pretty-printed JavaScript program for a
 * Tiger expression, bundling the translation of the Tiger standard library with
 * the expression's translation.
 *
 * Each gen() method returns a fragment of JavaScript.
 *
 *   const generate = require('./backend/javascript-generator');
 *   generate(tigerExpression);
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
  ArrayType,
  TupleType,
  DictType,
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
  return { EQUALS: "===", "<>": "!==", "&": "&&", "|": "||" }[op] || op;
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
