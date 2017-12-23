class Parser {
  constructor (initialState) {
    this.initialState = initialState
  }

  Escape (input) {
    input = input.replace(/&/g,"&amp;")
    input = input.replace(/</g,"&lt;")
    input = input.replace(/>/g,"&gt;")
    return input
  }

  ParseAction (token, action) {
    let newAction = action
    let actionRegex = /<([=+-]+)(.+)>/
    if (actionRegex.test(action)) {
      let parts = action.match(actionRegex)
      parts.shift()
      if (parts[0] == '=') {
        let matchRegex = /(match)\[([0-9]+)\]/
        if (matchRegex.test(parts[1])) {
          let parts2 = parts[1].match(matchRegex)
          parts2.shift()
          newAction = newAction.replace(actionRegex,token[parts2[0]][parts2[1]])
        }
      }
    }
    return newAction
  }

  ParseActions (token) {
    let newActions = []
    let actions = token.action.split(',')
    for (let i in actions) {
      newActions.push(this.ParseAction(token, actions[i]))
    }
    return newActions
  }

  Parse (input, state, nextState) {
    let token = state.Run(input)
    let actions = this.ParseActions(token)
    let matches = token.match
    let output = ''
    for (let i in matches) {
      output += `<span class="${actions[i]}">${this.Escape(matches[i])}</span>`
    }
    let rest = token.rest
    let newState = token.state
    if (nextState) newState = nextState
    let newState2 = undefined
    if (token.returnState) newState2 = token.returnState
    return { output: output, rest: rest, state: newState, nextState: newState2 }
  }

  ParseAll (input) {
    let state = this.initialState
    let nextState = undefined
    let rest = input
    let output = ''
    while (rest) {
      let token = this.Parse(rest, state, nextState)
      state = token.state
      nextState = token.nextState
      rest = token.rest
      output += token.output
    }
    return output
  }

}

export default Parser
