function LexerState () {
  var that = this

  var rules = []

  var state = function (regex) {
   return function (action) {
    rules.push(new LexerRule(regex, action))
   }
  }

  state.rules = rules

  state.lex = function (input) {
    var nextCont = state.run(input)
    while (typeof nextCont == "function") {
      nextCont = nextCont()
    }
    return nextCont
  }

  state.run = LexerMethod

  state.continuation = function (input) {
    return function () {
      return state.run(input)
    }
  }

  return state
}

function LexerRule (regex, action) {
  let regexp = regex
  let testRegex = /^(?:(?:\(\?([\w$])+\))?)([\s\S]*)$/
  let testLookbehind = /^\(\?<([=!])((?:[^)]|[\s\S])*)\)\(([\s\S]*)\)$/
  let modifier = ''
  if (!regexp.match) throw new Error('The regular expression should be a string, not a RegExp!')
  regexp = regexp.match(testRegex)
  regexp.shift()
  if (!regexp[0]) { regexp.shift(); regexp = regexp[0]; }
  else { modifier = regexp[0]; regexp = regexp[1]; }
  if (testLookbehind.test(regexp)) {
    this.regex = regexp
  } else {
    this.regex = new RegExp("^" + regexp, modifier)
  }
  if (this.regex.compile) this.regex.compile(this.regex)
  this.action = action
}

/* script for matching lookbehinds */
/*LexerRule.prototype.matches = function (s) {
  let m
  if (typeof this.regex == 'string') {
    let lookBehind = this.regex.replace(/(\(\?<[=!][\s\S]*\))\([\s\S]*\)/, '$1')
    let regex = this.regex.replace(/\(\?<[=!][\s\S]*\)(\([\s\S]*\))/, '$1')
    let parts = /^\(\?<([=!])([\s\S]*)\)$/.exec(lookBehind)
    let lb = {
      lb: new RegExp('(?:' + parts[2] + ')$(?!\\s)'),
      type: parts[1] === '='
    }
    let str = s
    regex = new RegExp(regex)
    let match = regex.exec(str), leftContext = ''
    if (match) leftContext = str.slice(0, match.index)
    if (match && lb.type === lb.lb.test(leftContext)) {
      m = match
    }
  } else {
    m = s.match(this.regex)
  }
  return m
}*/

LexerRule.prototype.matches = function (s) {
  let m = s.match(this.regex)
  return m
}

function LexerMethod (input) {
  var longestMatchedRule = null
  var longestMatch = null
  var longestMatchedLength = -1

  for (var i = this.rules.length-1; i >= 0; --i) {
    var r = this.rules[i] ;

    var m = r.matches (input)

    for (let i in m) {
      if (m[i] == undefined) delete m[i]
    }

    if (m && (m[0].length >= longestMatchedLength)) {
      longestMatchedRule = r
      longestMatchedLength = m[0].length
      if (m.length > 1) m.shift()
      delete m["input"]
      longestMatch = m
    }
  }

  if (longestMatchedRule) {
    let rest = input.substring(0,longestMatch['index']) + input.substring(longestMatch['index']+longestMatchedLength,input.length)
    return longestMatchedRule.action(longestMatch,rest,this)
  } else {
    return
    //throw ("Lexing error; no match found for: '" + input + "'")
  }
}

function LexerContinue (state) {
  return function (rest) {
    return state.run(rest)
  }
}

var Lexer = {
  State : LexerState,
  Continue: LexerContinue
}

export default Lexer
