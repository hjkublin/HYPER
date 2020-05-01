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
  DictType,
  TupleType,
  SequenceType,
  PrimitiveType,
  AnyType,
  UnionType,
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

const {
  BoolType,
  FloatType,
  IntType,
  NoneType,
  StringType,
} = require("./builtins");

module.exports = (program) => program.optimize();

function isZero(e) {
  return e instanceof Literal && e.value === 0;
}

function isOne(e) {
  return e instanceof Literal && e.value === 1;
}

function bothNumLiterals(e) {
  const isLiteral = e.left instanceof Literal && e.right instanceof Literal;
  const isLeftNum = e.left.type === IntType || e.left.type === FloatType;
  const isRightNum = e.left.type === IntType || e.left.type === FloatType;
  return isLiteral && isLeftNum && isRightNum;
}

Program.prototype.optimize = function() {
  this.block = this.block.optimize();
  return this;
};

Block.prototype.optimize = function() {
  this.statements = this.statements
    .map((s) => s.optimize())
    .filter((s) => s != null);
  return this;
};

Break.prototype.optimize = function() {
  return this;
};

BinaryExp.prototype.optimize = function() {
  this.left = this.left.optimize();
  this.right = this.right.optimize();

  const leftType = this.left.type;
  const rightType = this.right.type;

  if (this.op === "ADD" && isZero(this.right)) return this.left;
  if (this.op === "ADD" && isZero(this.left)) return this.right;
  if (this.op === "SUB" && isZero(this.right)) return this.left;
  if (this.op === "SUB" && isZero(this.left)) return -this.left;
  if (this.op === "MULT" && isZero(this.right))
    return new Literal(leftType, "0");
  if (this.op === "MULT" && isZero(this.left))
    return new Literal(rightType, "0");
  if (this.op === "MULT" && isOne(this.right)) return this.left;
  if (this.op === "MULT" && isOne(this.left)) return this.right;

  //   "POW" "OR" "AND" "LESSEQ" "EQUALS" "NOTEQ" "GRTEQ"
  //   "LESS"  "GRT" "MULT" "DIV" "MOD" "ADD"  "SUB" "TRUE"  "FALSE"
  if (bothNumLiterals(this)) {
    const [x, y] = [parseFloat(this.left.value), parseFloat(this.right.value)];
    let resultType = IntType;
    if (leftType === FloatType || rightType === FloatType) {
      resultType = FloatType;
    }
    if (this.op === "ADD") return new Literal(resultType, x + y);
    if (this.op === "MULT") return new Literal(resultType, x * y);
    if (this.op === "DIV") return new Literal(resultType, x / y);
    if (this.op === "MOD") return new Literal(resultType, x % y);
    if (this.op === "LESS") return new Literal(BoolType, x < y);
    if (this.op === "POW") return new Literal(resultType, x ** y);
  }
  return this;
};

UnaryExp.prototype.optimize = function() {
  this.operand = this.operand.optimize();
  if (this.op === "~" && this.operand instanceof Literal) {
    return new Literal(BoolType, !this.operand.value);
  }
  if (this.op === "-" && this.operand instanceof Literal) {
    return new Literal(this.operand.type, -this.operand.value);
  }
};

Literal.prototype.optimize = function() {
  return this;
};