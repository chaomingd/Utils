const underReg = /-/g
export function mapKeyProp (data, keyString, defaultValue = '--', replacer) { // 获取对象的值 const data = {test: {test: 'xxx'}} mapKeyProp(data, 'test.test')
  if (!keyString || !data) return (obj === undefined || obj === '--' || obj === '----' || obj === 'NaN' || obj === 'null' || obj === 'undefined' || obj === null) ? defaultValue : obj
  const keyChain = keyString.split('.').map(str => str.replace(underReg, '.'))
  let obj = data
  if (keyChain.length === 1) {
    obj = data[keyString]
  } else {
    keyChain.forEach(key => {
      if (obj) {
        obj = obj[key]
      }
    })
  }
  obj = (obj === undefined || obj === '--' || obj === '----' || obj === 'NaN' || obj === 'null' || obj === 'undefined' || obj === null) ? defaultValue : obj
  if (replacer) {
    if (typeof replacer === 'function') {
      obj = replacer(obj)
    } else {
      if (replacer.trueString && replacer.falseString) { // 两种状态的值
        const trueValue = replacer.trueValue
        const falseValue = replacer.falseValue
        if (obj !== defaultValue) {
          if (trueValue !== undefined && falseValue !== undefined) {
            if (obj === trueValue) {
              obj = replacer.trueString
            } else if (obj === falseValue) {
              obj = replacer.falseString
            }
          } else {
            obj = obj ? replacer.trueString : replacer.falseString
          }
        }
      }
    }
  }
  return obj
}