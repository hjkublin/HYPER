// THINGS TO WORK ON : couldn't figure out how to get coverage on parenthesis and tuple

const parse = require("../parser");

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
} = require("../../ast");

let fixture = {
  hello: [
    String.raw`SAY(3)!
  `,
    new Program(new Block([new CallExp("SAY", [new Literal("INT", 3)])])),
  ],

  assignment: [
    String.raw`x IS 4 ADD 3!
    `,
    new Program(
      new Block([
        new Assignment(
          new Identifier("x"),
          new BinaryExp(new Literal("INT", 4), "ADD", new Literal("INT", 3))
        ),
      ])
    ),
  ],

  declaration: [
    String.raw`INT x IS 5!
      `,
    new Program(
      new Block([new Declaration("INT", "x", new Literal("INT", 5))])
    ),
  ],

  returnStatement: [
    String.raw`FUNC BOO isEven(INT num):
          GIMME num MOD 2 EQUALS 0!
      `,
    new Program(
      new Block([
        new Func(
          "BOO",
          "isEven",
          [new Param("INT", "num")],
          [
            new ReturnStatement(
              new BinaryExp(
                new BinaryExp(
                  new Identifier("num"),
                  "MOD",
                  new Literal("INT", 2)
                ),
                "EQUALS",
                new Literal("INT", 0)
              )
            ),
          ]
        ),
      ])
    ),
  ],

  binary: [
    String.raw`INT x IS 3!
INT y IS 5!
INT z IS x ADD y!
      `,
    new Program(
      new Block([
        new Declaration("INT", "x", new Literal("INT", 3)),
        new Declaration("INT", "y", new Literal("INT", 5)),
        new Declaration(
          "INT",
          "z",
          new BinaryExp(new Identifier("x"), "ADD", new Identifier("y"))
        ),
      ])
    ),
  ],

  unary: [
    String.raw`INT x IS -10!
      `,
    new Program(
      new Block([
        new Declaration("INT", "x", new UnaryExp("-", new Literal("INT", 10))),
      ])
    ),
  ],

  for: [
    String.raw`LOOKAT INT x IN RANGE(0, 10):
      SAY(x POW (x ADD 2))!
      `,
    new Program(
      new Block([
        new ForStatement(
          "INT",
          new Identifier("x"),
          new RangeExp(
            false,
            new Literal("INT", 0),
            new Literal("INT", 10),
            null,
            false
          ),
          [
            new CallExp("SAY", [
              new BinaryExp(
                new Identifier("x"),
                "POW",
                new BinaryExp(new Identifier("x"), "ADD", new Literal("INT", 2))
              ),
            ]),
          ]
        ),
      ])
    ),
  ],

  while: [
    String.raw`UNTIL TRUE:
      GIMME "I am hyper!"!
      `,
    new Program(
      new Block([
        new WhileStatement(new Literal("BOO", true), [
          new ReturnStatement(new Literal("STR", "I am hyper!")),
        ]),
      ])
    ),
  ],

  if: [
    String.raw`INT num IS 3!
TRY num GRT 0:
    SAY("Positive number")!
NO?TRY num EQUALS 0:
    SAY("Zero")!
NO???:
    SAY("Negative number")!
    `,
    new Program(
      new Block([
        new Declaration("INT", "num", new Literal("INT", 3)),
        new IfStatement(
          [
            new BinaryExp(new Identifier("num"), "GRT", new Literal("INT", 0)),
            new BinaryExp(
              new Identifier("num"),
              "EQUALS",
              new Literal("INT", 0)
            ),
          ],
          [
            new CallExp("SAY", [new Literal("STR", "Positive number")]),
            new CallExp("SAY", [new Literal("STR", "Zero")]),
          ],
          [new CallExp("SAY", [new Literal("STR", "Negative number")])]
        ),
      ])
    ),
  ],

  arrays: [
    String.raw`ARR<STR> c IS ["Hi", "I", "am", "hyper"]!
SAY(c[1])!
      `,
    new Program(
      new Block([
        new Declaration(
          new ArrayType("STR"),
          "c",
          new ArrayExp(
            [
              new Literal("STR", "Hi"),
              new Literal("STR", "I"),
              new Literal("STR", "am"),
              new Literal("STR", "hyper"),
            ],
            new Literal("INT", 4),
            new ArrayType("STR")
          )
        ),
        new CallExp("SAY", [
          new SubscriptedExp(new Identifier("c"), new Literal("INT", 1)),
        ]),
      ])
    ),
  ],

  dict: [
    String.raw`DICT<STR:STR> e IS {"a": "Hi", "b": "I", "c": "am", "d": "hyper"}!
GIMME e.a!
LEAVE!
  `,
    new Program(
      new Block([
        new Declaration(
          new DictType("STR", "STR"),
          "e",
          new DictExp([
            new KeyValue(new Literal("STR", "a"), new Literal("STR", "Hi")),
            new KeyValue(new Literal("STR", "b"), new Literal("STR", "I")),
            new KeyValue(new Literal("STR", "c"), new Literal("STR", "am")),
            new KeyValue(new Literal("STR", "d"), new Literal("STR", "hyper")),
          ])
        ),
        new ReturnStatement(new MemberExp(new Identifier("e"), "a")),
        new Break(),
      ])
    ),
  ],

  tuple: [
    String.raw`TUP<INT,FLT,STR> d IS (1, 2.5, "hello")!
      `,
    new Program(
      new Block([
        new Declaration(
          new TupleType(["INT", "FLT", "STR"]),
          "d",
          new TupleExp([
            new Literal("INT", 1),
            new Literal("FLT", 2.5),
            new Literal("STR", "hello"),
          ])
        ),
      ])
    ),
  ],
  simpleSuite: [
    String.raw`FUNC LITERALLYNOTHING hey () : SAY("HELLO" OR "HEY")!
      `,
    new Program(
      new Block([
        new Func(
          "LITERALLYNOTHING",
          "hey",
          [],
          [
            new CallExp("SAY", [
              new BinaryExp(
                new Literal("STR", "HELLO"),
                "OR",
                new Literal("STR", "HEY")
              ),
            ]),
          ]
        ),
      ])
    ),
  ],

  fibonacci: [
    String.raw`FUNC INT fibonacci(INT num):
    TRY num LESS 2:
        GIMME 1!
    GIMME fibonacci(num SUB 2) ADD fibonacci(num SUB 1)!
    `,
    new Program(
      new Block([
        new Func(
          "INT",
          "fibonacci",
          [new Param("INT", "num")],
          [
            new IfStatement(
              [
                new BinaryExp(
                  new Identifier("num"),
                  "LESS",
                  new Literal("INT", 2)
                ),
              ],
              [new ReturnStatement(new Literal("INT", 1))],
              null
            ),
            new ReturnStatement(
              new BinaryExp(
                new CallExp(new Identifier("fibonacci"), [
                  new BinaryExp(
                    new Identifier("num"),
                    "SUB",
                    new Literal("INT", 2)
                  ),
                ]),
                "ADD",
                new CallExp(new Identifier("fibonacci"), [
                  new BinaryExp(
                    new Identifier("num"),
                    "SUB",
                    new Literal("INT", 1)
                  ),
                ])
              )
            ),
          ]
        ),
      ])
    ),
  ],
};

describe("The parser", () => {
  Object.entries(fixture).forEach(([name, [source, expected]]) => {
    test(`produces the correct AST for ${name}`, (done) => {
      expect(parse(source)).toEqual(expected);
      done();
    });
  });
  test("throws an exception on a syntax error", (done) => {
    expect(() => parse("as$df^&%*$&")).toThrow();
    done();
  });
});
