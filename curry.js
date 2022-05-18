function curry (fn, placeholder = '_') {
  const len = fn.length;
  const args = Array.prototype.slice(arguments, 1);
  const placeholders = []
  const context = this;
  let argsCount = args.length;
  function inner () {
    for (let i = 0; i < arguments.length; i++) {
      const arg = arguments[i];
      if (arg === placeholder) {
        args.push(arg);
        placeholders.push(args.length - 1)
      } else {
        if (placeholders.length) {
          args[placeholders.shift()] = arg
        } else {
          args.push(arg)
        }
        argsCount++
      }
    }
    if (argsCount === len) {
      return fn.apply(context, args)
    }
    return inner;
  }
  return inner;
}

function add (x, y, z) {
  return x + y + z
}

const curriedAdd = curry(add);

console.log(curriedAdd('_','_')(2, 2)(1))