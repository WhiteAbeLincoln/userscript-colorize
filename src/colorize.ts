export const CLASS_NAME = 'aw-userscript-colorize'
const csscolors = [
  'black',
  'silver',
  'gray',
  'white',
  'maroon',
  'red',
  'purple',
  'fuchsia',
  'green',
  'lime',
  'olive',
  'yellow',
  'navy',
  'blue',
  'teal',
  'aqua',
  'orange',
  'aliceblue',
  'antiquewhite',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'blanchedalmond',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'limegreen',
  'linen',
  'magenta',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'oldlace',
  'olivedrab',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'whitesmoke',
  'yellowgreen',
  'rebeccapurple',
]

function allIndexesOf(str: string, match: string) {
  let i = -1
  const idx: number[] = []
  while ((i = str.indexOf(match, i + 1)) >= 0) idx.push(i)
  return idx
}

function matchParen(str: string, stack = 0) {
  let idx = 0
  for (const char of str) {
    if (char === '(') stack++
    else if (char === ')') stack--
    if (stack === 0) {
      return idx
    }
    idx++
  }
  return -1
}

function colorSlices(
  text: string,
): Array<{ start: number; end: number; str: string }> {
  const hexRegex = /#([a-f\d]{6}|[a-f\d]{3}|[a-f\d]{8}|[a-f\d]{4})/gi
  const funcRegex = /(rgba?|hsla?)\(/gi

  const slices: Array<{ start: number; end: number; str: string }> = []
  let match = /** @type {RegExpExecArray} */ null
  while ((match = hexRegex.exec(text)) != null) {
    const startIdx = match.index
    const endIdx = hexRegex.lastIndex
    slices.push({
      start: startIdx,
      end: endIdx,
      str: text.slice(startIdx, endIdx),
    })
  }

  match = null
  while ((match = funcRegex.exec(text)) != null) {
    const startIdx = match.index
    let endIdx = matchParen(text.substr(funcRegex.lastIndex), 1)
    if (endIdx !== -1) {
      endIdx += funcRegex.lastIndex + 1
      slices.push({
        start: startIdx,
        end: endIdx,
        str: text.slice(startIdx, endIdx),
      })
    }
  }

  for (const color of csscolors) {
    const indexes = allIndexesOf(text, color)
    slices.push(
      ...indexes.map(s => ({
        start: s,
        end: s + color.length,
        str: text.substr(s, color.length),
      })),
    )
  }

  return slices
}

// indicates if x contains y
const contains = (
  x: { start: number; end: number },
  y: { start: number; end: number },
) =>
  y.start >= x.start && y.start <= x.end && y.end >= x.start && y.end <= x.end

/**
 * filters all intervals which are completely contained by another interval
 */
function filterIntervalNaive<T extends { start: number; end: number }>(
  xs: readonly T[],
) {
  return xs.filter(
    (x, i) => !xs.some((y, j) => (i === j ? false : contains(y, x))),
  )
}

function setColor(elem: ElementCSSInlineStyle, color: string) {
  const oldColor = elem.style.color
  elem.style.color = color
  const valid = elem.style.color !== ''
  if (!valid) elem.style.color = oldColor
  return valid
}

export function docolorize() {
  const span = document.createElement('span')
  span.className = CLASS_NAME
  span.innerText = '■'

  if (window.self !== window.top) {
    return
  } // don't execute in a frame

  const theElems = document.evaluate(
    './/text()[normalize-space() != "" ' +
      'and not(ancestor::style) ' +
      'and not(ancestor::script) ' +
      'and not(ancestor::textarea)]',
    document.body,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null,
  )

  for (let i = 0; i < theElems.snapshotLength; i++) {
    let node = theElems.snapshotItem(i) as Text

    let laststart = 0
    const slices = filterIntervalNaive(colorSlices(node.data))
    slices.sort((a, b) => a.start - b.start)
    for (const { start, str } of slices) {
      const sp = span.cloneNode(true) as HTMLSpanElement
      if (setColor(sp, str)) {
        node = start !== 0 ? node.splitText(start - laststart) : node
        if (node.parentNode) node.parentNode.insertBefore(sp, node)
        laststart = start
      }
    }
  }
}

export function uncolorize() {
  const elements = document.getElementsByClassName(CLASS_NAME)
  const hadElems = elements.length !== 0
  while (elements.length > 0) {
    if (elements[0].parentNode) elements[0].parentNode.removeChild(elements[0])
  }
  return hadElems
}

export function colorize() {
  if (!uncolorize()) {
    docolorize()
  }
}

colorize.do = docolorize
colorize.undo = uncolorize
