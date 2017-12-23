class Highlighter {
  constructor (lang) {
    this.parser = require('./grammars/' + lang).default
  }

  Highlight (input) {
    let parsed = this.parser.ParseAll(input)
    let parts = parsed.split('\n')
    let lines = ''
    for (let i in parts) {
      lines += `<div class="line ${i*1+1}">`
      lines += parts[i]
      lines += `</div>`
    }
    return lines
  }
}

export default Highlighter
