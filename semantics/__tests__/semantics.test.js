/*
 * Semantics Success Test
 *
 * These tests check that the semantic analyzer correctly accepts a program that passes
 * all of semantic constraints specified by the language.
 */

const parse = require("../../ast/parser");
const analyze = require("../analyzer");

const program = {
  hello: [
    String.raw`SAY("hello world")
`,
  ],
  while: [
    String.raw`INT x IS -5!
INT y IS 7!
UNTIL x EQUALS y AND x GRT 2:
⇨x IS x ADD 1!
⇦`,
  ],
  for: [
    String.raw`INT total!
FUNC LITERALLYNOTHING hey(): 
⇨LOOKAT INT x IN RANGE(0, 10, 1):
⇨total IS total ADD x!
⇦SAY("hey")!
⇦`,
  ],
  func: [
    String.raw`DICT<STR:FLT> sizes IS {"red": 2.4, "blue": 3, "green": 5.6}!
FLT t IS 2!
STR string IS "hey"!
ARR<FLT> evens IS [2, 4.3, 6, 8]!
INT size IS SIZE(evens)!
INT strsize IS SIZE(string)!
evens[3] IS 10!
FLT c IS -3.4!
BOO s IS ~FALSE!
TUP<STR,FLT,FLT> tuple IS ("hello!", 2, 2.4)!
INT sum IS getSum(3,4)!
FUNC INT getSum (INT a, INT b):
⇨INT sum IS a MULT b!
GIMME sum!
⇦`,
  ],
  funcCoercion: [
    String.raw`ARR<STR> c IS ["hey"]! 
STR b IS x(c, "3", 1)!
FUNC STR x(ARR<STR> x, STR y, FLT z):
⇨GIMME y!
⇦`,
  ],
  for2: [
    String.raw`ARR<STR> a IS ["hyper", "needs", "hype"]!
LOOKAT STR s IN a:
⇨STR new IS CONCAT(s, "!!!")!
⇦`,
  ],
  if: [
    String.raw`FUNC STR isZero(INT x):
⇨TRY x GRT 0:
⇨GIMME "x > 0"!
⇦NO?TRY x LESS 0:
⇨GIMME "x < 0"!
⇦GIMME "yes"!
⇦`,
  ],
  func2: [
    String.raw`FUNC ARR<STR> arrayStr(STR x):
⇨GIMME [x]!
⇦`,
  ],
  noFuncParams: [
    String.raw`FUNC FLT getFive():
⇨FLT x IS 3!
GIMME 5!
⇦`,
  ],
  declAndAssign: [
    String.raw`INT x IS 5!
x IS 4!
`,
  ],
  tup: [
    String.raw`ARR<FLT> evens IS [2, 4.3, 6, 8]!
INT size IS SIZE(evens)!
evens IS PUSH(evens, 10)!
SAY(evens[2])!
TUP<STR,FLT,FLT> tuple IS ("hello!", 2, 2.4)!
`,
  ],
  builtin: [
    String.raw`DICT<STR:INT> d IS {"hey": 1, "there": 3}!
SAY(d.GET("hey"))!
`,
  ],
  dict2: [
    String.raw`DICT<STR:FLT> alphabet IS {"a": 1.0 DIV 1, "b": 2.0, "c": 2.0 ADD 3.0}!`,
  ],
};

describe("The semantic analyzer", () => {
  Object.entries(program).forEach(([name, [code]]) => {
    test(`accepts the mega program ${name} with all syntactic forms`, (done) => {
      const astRoot = parse(code);
      expect(astRoot).toBeTruthy();
      analyze(astRoot);
      expect(astRoot).toBeTruthy();
      done();
    });
  });
});
