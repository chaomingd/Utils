const fs = require('fs')
setTimeout(() => {
  console.log('setTimeout --- timers');
  Promise.resolve().then(() => {
    console.log('SetTimeout promise resolved1 --- micro')
  })
  Promise.resolve().then(() => {
    console.log('SetTimeout promise resolved1 --- micro')
  })
})

fs.readFile('./compose.js', () => {
  console.log('fs.readdir')
  Promise.resolve().then(() => {
    console.log('readDir promise resolved1 --- micro')
  })
  Promise.resolve().then(() => {
    console.log('readDir promise resolved2 --- micro')
  })
})

