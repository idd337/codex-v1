// maths.js

const maths = {
  add: (a, b) => a + b,

  subtract: (a, b) => a - b,

  multiply: (a, b) => a * b,

  divide: (a, b) => {
    if (b === 0) throw new Error("Cannot divide by zero");
    return a / b;
  },

  power: (a, b) => Math.pow(a, b),

  sqrt: (a) => {
    if (a < 0) throw new Error("Cannot take square root of negative number");
    return Math.sqrt(a);
  },

  factorial: (n) => {
    if (n < 0) throw new Error("Factorial not defined for negative numbers");
    if (n === 0 || n === 1) return 1;
    let fact = 1;
    for (let i = 2; i <= n; i++) fact *= i;
    return fact;
  },

  gcd: (a, b) => {
    if (!b) return a;
    return maths.gcd(b, a % b);
  },

  lcm: (a, b) => (a * b) / maths.gcd(a, b),

  // Example: Solve quadratic equation ax^2 + bx + c = 0
  solveQuadratic: (a, b, c) => {
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return "No real roots";
    const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    return { root1, root2 };
  }
};

module.exports = maths;


js
const maths = require('./maths');

console.log(maths.add(5, 3)); // 8
console.log(maths.solveQuadratic(1, -3, 2)); // { root1: 2, root2: 1 }
