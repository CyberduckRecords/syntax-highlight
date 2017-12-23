export default class Highlighter {
  constructor (text, language) {
    const Lexer = require('./Lexer')
    const highlighter = require('./grammars/' + language).default
    const highlighted = highlighter.highlight(text)
    return { highlightedCode: highlighted }
  }
}
