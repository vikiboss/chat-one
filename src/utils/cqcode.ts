const EscapeMap = [
  ['&', '&amp;'],
  ['[', '&#91;'],
  [']', '&#93;'],
]

const EscapeInsideMap = [...EscapeMap, [',', '&#44;']]

export const cqcode = {
  escape(s: string, inside = false) {
    let res = s
    for (const [k, v] of inside ? EscapeInsideMap : EscapeMap) {
      res = res.replace(new RegExp(k, 'g'), v)
    }
    return res
  },
  unescape(s: string, inside = false) {
    let res = s
    for (const [k, v] of inside ? EscapeInsideMap : EscapeMap) {
      res = res.replace(new RegExp(v, 'g'), k)
    }
    return res
  },
}
