/*
 *  Grammar Success Checker
 *
 */
const syntaxCheck = require("../syntax-checker");

const program = String.raw`
FUNC INT fibonacci( INT number ): 
⇨ TRY num EQUALS 0: 
	⇨ GIMME 0! 
⇦ NO?TRY num EQUALS 1 OR num EQUALS 2:
⇨ GIMME 1!
⇦ SAY(fibonacci(num SUB 2) ADD fibonacci(num SUB 1))!
⇦
`;
const program2 = String.raw`
INT num1 IS 10!
INT num2 IS 14!
INT num3 IS 12!
INT largest!

TRY (num1 GRTEQ num2) AND (num1 GRTEQ num3):
⇨largest IS num1!
⇦NO?TRY (num2 GRTEQ num1) AND (num2 GRTEQ num3):
⇨largest IS num2!
⇦NO???:
 ⇨largest IS num3!
⇦SAY(CONCAT("The largest number is ", largest))!
`;

const program3 = String.raw`
FUNC BOO isEven(INT num):
⇨ GIMME num MOD 2 EQUALS 0!
⇦ 
`;

const program4 = String.raw`
ARR<STR> array IS ["Hi", "I'm", "Hyper"]!
array IS array.push("LOL")!

SAY(CONCAT("element0: ", array[0]))!
`;

describe("The syntax checker", () => {
  test("accepts the fibonacci function", (done) => {
    expect(syntaxCheck(program)).toBe(true);
    done();
  });
});

describe("The syntax checker", () => {
  test("accepts the finding the largest of three numbers function", (done) => {
    expect(syntaxCheck(program2)).toBe(true);
    done();
  });
});

describe("The syntax checker", () => {
  test("accepts finding an even number", (done) => {
    expect(syntaxCheck(program3)).toBe(true);
    done();
  });
});

describe("The syntax checker", () => {
  test("accepts appending a string to an array", (done) => {
    expect(syntaxCheck(program4)).toBe(true);
    done();
  });
});
