class State {
  constructor (name) {
    this.name = name
    this.rules = []
  }

  Add (name) {
    return (regex) => {
      return (action, state, returnState) => {
        this.rules.push(new Rule(name, regex, action, state || this, returnState))
      }
    }
  }

  Run (input) {
    let rules = this.rules
    let matchedString = null
    let matchedRule = null
    let matchedLength = -1

    for (let i = rules.length-1; i >= 0; i--) {
      let rule = rules[i]
      let match = input.match(rule.regex)

      for (let j in match) {
        if (match[j] == undefined) delete match[j]
      }

      if (match && (match[0].length >= matchedLength)) {
        matchedRule = rule
        matchedLength = match[0].length
        if (match.length > 1) match.shift()
        delete match["input"]
        matchedString = match
      }
    }

    if (matchedRule) {
      let rest = input.substring(0,matchedString['index']) + input.substring(matchedString['index']+matchedLength,input.length)
      delete matchedString['index']
      return { match: matchedString, action: matchedRule.action, rest: rest, name: matchedRule.name, state: matchedRule.nextState, returnState: matchedRule.returnState }
    } else {
      return { match: [input], action: 'text', rest: '', state: this }
    }
  }

  RunAll (input) {
    let output = []
    let rest = input
    while (rest) {
      let run = this.Run(rest)
      output.push({
        match: run.match,
        action: run.action,
        name: run.name
      })
      rest = run.rest
    }
    return output
  }

  Continue (input, state) {
    state.RunAll(input)
  }

}

class Rule {
  constructor (name, regex, action, nextState, returnState) {
    let regexp = regex
    let testRegex = /^(?:(?:\(\?([\w$])+\))?)([\s\S]*)$/
    let modifier = ''
    if (!regexp.match) throw new Error('The regular expression should be a string, not a RegExp!')
    regexp = regexp.match(testRegex)
    regexp.shift()
    if (!regexp[0]) { regexp.shift(); regexp = regexp[0]; }
    else { modifier = regexp[0]; regexp = regexp[1]; }
    this.regex = new RegExp("^" + regexp, modifier)
    if (this.regex.compile) this.regex.compile(this.regex)
    this.returnState = returnState
    this.nextState = nextState
    this.action = action
    this.name = name
  }
}

export default State
