function compose (...funcs) {
  if (funcs.length === 0) return () => void 0;
  if (funcs.length === 1) return funcs[0];
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}

function composeAsync (...funcs) {
  if (funcs.length === 0) return Promise.resolve();
  if (funcs.length === 1) return (...args) => Promise.resolve(funcs[0](...args));
  return funcs.reduce((a, b) => (...args) => Promise.resolve(b(...args)).then(a));
}

function a (data) {
  return data + '_a'
}
function b (data) {
  return data + '_b'
}

function asyncA (data) {
  return Promise.resolve(data + '_A')
}
function asyncB (data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(data + '_B')
    }, 3000)
  })
}

const composeFunc = compose(a, b);
const composeFuncAsync = composeAsync(asyncA, asyncB);
composeFuncAsync('composeAsync').then(data => {
  console.log(data)
})