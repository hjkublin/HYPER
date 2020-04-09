const util = require("util");
const {
  Function,
  Identifier,
  ArrayType, // Not really sure if need these or ParameterizedType instead
  DictType,
  TupleType,
} = require("../ast");

//  DictType,
//  TupleType,
//  ArrayType,
const {
  BoolType,
  FloatType,
  IntType,
  NoneType,
  StringType,
} = require("./builtins");

function doCheck(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

module.exports = {
  // TODO: FIX HOW TO CHECK TYPES
  //    - isGeneric()
  //    - is Type.numParams == ParameterizedType.params ?

  //  how would we perform this check? - would the ArrayType be from the builtins?
  isGeneric(type) {
    doCheck(type.isGeneric, "Not a generic type");
  },
  isRightNumParams(numParams, type) {
    doCheck(numParams === type.numParams);
  },
  isArrayType(type) {
    doCheck(type.constructor === ArrayType, "Not an ArrayType");
  },
  isDictType(type) {
    doCheck(type.constructor === DictType, "Not a DictType");
  },
  isTupleType(type) {
    doCheck(type.constructor === TupleType, "Not a TupleType");
  },
  isArray(expression) {
    doCheck(expression.type.constructor === ArrayType, "Not an array");
  },
  isDict(expression) {
    doCheck(expression.type.constructor === DictType, "Not a dictionary");
  },
  isTuple(expression) {
    doCheck(expression.type.constructor === TupleType, "Not a tuple");
  },
  isInteger(expression) {
    doCheck(expression.type === IntType, "Not an integer");
  },
  isFloat(expression) {
    doCheck(expression.type === FloatType, "Not a float");
  },
  isNumber(expression) {
    doCheck(
      expression.type === IntType || expression.type === FloatType,
      "Not a number"
    );
  },
  isString(expression) {
    doCheck(expression.type === StringType, "Not an string");
  },
  isBoolean(expression) {
    doCheck(expression.type === BoolType, "Not a boolean");
  },
  isFunction(value) {
    doCheck(value.constructor === Func, "Not a function");
  },
  expressionsHaveSameType(e1, e2) {
    doCheck(e1.type === e2.type, "Types must match exactly");
  },
  isAssignableTo(expression, type) {
    doCheck();
  },
  inLoop(context, keyword) {
    doCheck(context.inLoop, `${keyword} can only be used in a loop`);
  },
  legalArguments(args, params) {
    doCheck(
      args.length === params.length,
      `Expected ${params.length} args in call, got ${args.length}`
    );
    args.forEach((arg, i) => {
      if (params[i].type === StringType && arg.type !== StringType) {
        arg.type = StringType;
      }
      this.isAssignableTo(arg, params[i].type);
    });
  },
};
