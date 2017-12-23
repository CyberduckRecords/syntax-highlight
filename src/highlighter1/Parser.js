class Highlighter {
  constructor (initialState) {
    this.initialState = initialState
    this.tabSpaces = 2
  }

  escapeHTMLOne (text) {
    var s = text
    s = s.replace(/&/g,"&amp;")
    s = s.replace(/</g,"&lt;")
    s = s.replace(/>/g,"&gt;")
    return s
  }

  stop (match, rest, state) {
    return null
  }

  tabSpace () {
    var tabSpace = ""
    for (var i = 0; i < this.tabSpaces; ++i)
      tabSpace += "&nbsp;"
    return tabSpace
  }

  hardenWhitespace (match, rest, state) {
    this.append(this.whitespaceHardener(match[0]))
    return state.continuation(rest)
  }

  whitespaceHardener (s) {
    s = s.replace(/ /g,"&nbsp;")
    s = s.replace(/\n/g,"<br />")
    s = s.replace(/\t/g,this.tabSpace())
    s = s.replace(/(&)(lt;?|gt;?)/g,`<span>$1</span>$2`)
    return s
  }

  escapeAndHarden (s) {
    s = escapeHTMLOne(s)
    return this.whitespaceHardener(s)
  }

  escapeHTML (match, rest, state) {
    this.append(escapeHTMLOne(match[0]))
    return state.continuation(rest)
  }

  style (style, cc) {
    var that = this
    return function (match,rest,state) {
      that.append('<span style="'+style+'">'+that.escapeHTMLOne(match[0])+'</span>')
      return cc ? cc(rest) : state.continuation(rest)
    }
  }

  classify (classNames, cc) {
    var that = this
    return (matches,rest,state) => {
      delete matches['index']
      for (let i in matches) {
        let match = matches[i]
        let className = classNames[i]
        that.append('<span class="'+className+'">'+that.escapeHTMLOne(match)+'</span>')
      }
      return cc ? cc(rest) : state.continuation(rest)
    }
  }

  rewrite (f, cc) {
    var that = this
    return function (match,rest,state) {
      that.append(f.call(that,match))
      return cc ? cc(rest) : state.continuation(rest)
    }
  }

  rewriteAndClassify (f, classNames, cc) {
    var that = this
    return function (matches,rest,state) {
      delete matches['index']
      for (let i in matches) {
        let match = matches[i]
        let className = classNames[i]
        that.append('<span class="'+className+'">'+f.call(that,match)+'</span>')
      }
      return cc ? cc(rest) : state.continuation(rest)
    }
  }

  normal (match, rest, state) {
    this.append(escapeHTMLOne(match[0]))
    return state.continuation(rest)
  }

  eta (methodName) {
    var that = this
    return function () {
      return (that[methodName]).apply(that,arguments)
    }
  }

  highlight (input) {
    var buffer = ''
    this.append = (html) => {
      buffer += html
    }
    this.initialState.lex(input)
    return buffer
  }
}

let highlightClass = Highlighter

export default highlightClass
