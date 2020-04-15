const util = require("util");
const {
  ArrayType,
  TupleType,
  DictType,
  SequenceType,
  AnyType,
  Func,
  Identifier,
  RangeExp,
  ReturnStatement,
  PrimitiveType,
} = require("../ast");
const {
  BoolType,
  FloatType,
  IntType,
  StringType,
  NoneType,
} = require("./builtins");

function doCheck(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

module.exports = {
  // TODO: FIX HOW TO CHECK TYPES
  //    - add isRange() test
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
  // isDict(expression) {
  //   doCheck(expression.type.constructor === DictType, "Not a dictionary");
  // },
  // isTuple(expression) {
  //   doCheck(expression.type.constructor === TupleType, "Not a tuple");
  // },
  isInteger(expression) {
    doCheck(expression.type === IntType, "Not an integer");
  },
  // isFloat(expression) {
  //   doCheck(expression.type === FloatType, "Not a float");
  // },
  isNumber(expression) {
    doCheck(
      expression.type === IntType || expression.type === FloatType,
      "Not a number"
    );
  },
  // isString(expression) {
  //   doCheck(expression.type === StringType, "Not an string");
  // },
  // isStringOrArray(expression) {
  //   doCheck(
  //     expression.type === StringType ||
  //       expression.type.constructor === ArrayType
  //   );
  // },
  isBoolean(expression) {
    doCheck(expression.type === BoolType, "Not a boolean");
  },
  isRangeOrArray(expression) {
    doCheck(
      expression.constructor === RangeExp ||
        expression.type.constructor === ArrayType,
      "Not an Array or Range Expression"
    );
  },
  isFunction(value) {
    doCheck(value.constructor === Func, "Not a function");
  },
  inFunction(context) {
    doCheck(context.currentFunction !== null, "Not a function");
  },
  expressionsHaveSameType(e1, e2) {
    doCheck(e1.type === e2.type, "Types must match exactly");
  },
  coercivelyAssignable(t1, t2) {
    if (
      (t1 === IntType && t2 === FloatType) ||
      (t1 === StringType && t2 === SequenceType) ||
      (t1 !== NoneType && t1 === AnyType)
    ) {
      return true;
    } else return this.identicalTypes(t1, t2);
  },
  identicalTypes(t1, t2) {
    if (t1.constructor === ArrayType && t2.constructor === ArrayType) {
      return this.identicalTypes(t1.memberType, t2.memberType);
    } else if (
      t1.constructor === TupleType &&
      t2.constructor === TupleType &&
      t1.memberTypes.every((t, i) =>
        this.coercivelyAssignable(t, t2.memberTypes[i])
      )
    ) {
      return true;
    } else if (t1.constructor === DictType && t2.constructor === DictType) {
      return (
        this.identicalTypes(t1.keyType, t2.keyType) &&
        this.identicalTypes(t1.valueType, t2.valueType)
      );
    } else {
      return t1 === t2;
    }
  },
  isAssignableTo(expression, type) {
    doCheck(
      this.coercivelyAssignable(expression.type, type) ||
        (expression.constructor === ArrayType && type === SequenceType) ||
        this.identicalTypes(expression.type, type),
      `Expression of type ${util.format(
        expression.type
      )} not compatible with type ${util.format(type)}`
    );
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
  functionHasReturnStatement(func) {
    doCheck(
      func.body.some((s) => s.constructor === ReturnStatement) ||
        func.returnType === NoneType,
      "Expected function to have a return type"
    );
  },
  returnTypeMatchesFunctionReturnType(expression, func) {
    const funcReturnType = func.returnType;
    let expType =
      expression.constructor === Identifier
        ? expression.ref.type
        : expression.type;

    doCheck(
      this.identicalTypes(expType, funcReturnType),
      `Expected function to return expression of type ${util.format(
        funcReturnType
      )}, received type ${util.format(expType)}`
    );
  },
};
