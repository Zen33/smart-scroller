import is from '@sindresorhus/is'

const isExtend = {
  ...is,
  numberLike: (value: unknown) => {
    if (is.numericString(value) || is.number(value)) {
      return true
    }
    return false
  },
  isEmpty: (value: unknown) => {
    if (is.falsy(value)) {
      return true
    }
    if (is.emptyArray(value)) {
      return true
    }
    if (is.emptyObject(value)) {
      return true
    }
  }
}

export default isExtend
