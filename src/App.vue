<template>
  <div id="app">
    <div class="highlight" v-html="highlightedCode"></div>
    <div id="overlay">
      <div class="lines" v-html="lines"></div>
      <div class="cursor" :style="caretPos"></div>
    </div>
    <textarea v-model="code" spellcheck="false" ref="text"></textarea>
  </div>
</template>

<script>
import Highlighter from './tokenizer/Highlighter'

export default {
  name: 'app',
  data () {
    return {
      selectionStart: 0,
      selectionEnd: 0,
      code: `<div id="app">
  <p>hello</p>
</div>`
    }
  },
  computed: {
    highlightedCode () {
      const code = this.code

      let highlightedCode = new Highlighter('html').Highlight(code)

      return highlightedCode
    },
    lines () {
      let pos = this.currentPos
      let code = this.code
      let lines = code.split('\n')
      let lineHTML = ''
      for (let i in lines) {
        lineHTML += `<div class="line" id="${i}"></div>`
      }
      return lineHTML
    },
    currentLine () {
      const that = this
      return this.code.substr(0, that.selectionStart).split("\n").length
    },
    selection () {
      return { start: this.selectionStart, end: this.selectionEnd }
    },
    currentPos () {
      let currentLine = this.currentLine
      let selectionStart = this.selectionStart
      let lines = this.code.split('\n')
      let pos = 0
      let text = ''
      for (let i in lines) {
        if (i < currentLine - 1) {
          text += lines[i] + 'i'
        }
        if (i == currentLine - 1) {
          selectionStart -= text.length
          pos = selectionStart
        }
      }
      return { line: currentLine, cursor: pos, char: lines[currentLine-1].charAt(pos)  }
    },
    caretPos () {
      let pos = this.currentPos
      let lineHeight = 33
      let charWidth = 14.4
      return { top: lineHeight * (pos.line - 1) + 'px', left: charWidth * pos.cursor + 'px' }
    }
  },
  watch: {
    selectionStart () {
      const that = this
      setTimeout(() => {
        let currentLine = that.currentLine - 1
        let lineEl = document.querySelector(`.line[id='${currentLine}']`)
        let lineEls = document.querySelectorAll('.line')
        for (let i = 0; i < lineEls.length; i++) {
          lineEls[i].classList.remove('current')
        }
        lineEl.classList.add('current')
      },10)
    }
  },
  mounted () {
    const that = this
    setInterval(() => {
      if(that.$refs.text) {
        that.selectionStart = that.$refs.text.selectionStart
        that.selectionEnd = that.$refs.text.selectionEnd
      }
    }, 1)
  }
}
</script>

<style>
@font-face {
  font-family: 'Roboto Mono';
  font-style: normal;
  font-weight: 400;
  src: local('Roboto Mono'), local('RobotoMono-Regular'), url(https://fonts.gstatic.com/s/robotomono/v5/hMqPNLsu_dywMa4C_DEpY44P5ICox8Kq3LLUNMylGO4.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215;
}

html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: 'Roboto Mono';
  text-rendering: optimizeLegibility;
}

#app {
  //width: calc(100vw - 160px;);
  //height: calc(100vh - 160px);
  //margin: 80px;
  height: 100vh;
  background: #1e1e1e;
  position: relative;
  box-shadow: 0 0 60px 10px rgba(0,0,0,.4), 5px 5px 5px rgba(0,0,0,.6);
}

.highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
  font-size: 24px;
  font-weight: normal;
  font-family: inherit;
  white-space: pre;
  background: none;
  color: #e0e0e0;
	tab-size: 2;
}
textarea {
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  resize: none;
  background: transparent;
  font-size: 24px;
  font-weight: normal;
  font-family: inherit;
  border: none;
  padding: 0;
  outline: none;
  box-shadow: none;
  color: transparent;
	tab-size: 2;
}
::selection {
  background: rgba(255,255,255, .05);
  border: 2px solid yellow;
}

.cursor {
  height: 33px;
  width: 3px;
  background: #4D88FF;
  position: absolute;
  animation: flicker 0.8s infinite;
  z-index: 11;
}

@keyframes flicker {
  0% {
    opacity: 0;
  }
  49.9% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}

.lines {
  position: relative;
  z-index: 8;
}

.line {
  height: 33px;
}

.line.current {
  height: 31px;
  border: 1px solid rgba(255,255,255, .4);
  border-left: none;
  border-right: none;
}

.tab {
  border-left: 1px solid white;
}

.cyberduck {
  color: #e0e0e0
}
.cyberduck.operator,
.cyberduck.keyword {
  color: #4D88FF
}
.cyberduck.number {
  color: #44CC00
}
.cyberduck.constructor,
.cyberduck.storage {
  color: #F23D33
}
.cyberduck.list.punct,
.cyberduck.string.punct {
  color: #00F288
}
.cyberduck.string {
  color: #FF7A00
}

.css.selector {
  color: #4D88FF
}
.css.atr {
  color: #00E0E9
}
.css.atr.value {
  color: #F23D33
}
.css.atr.value.number {
  color: #44CC00
}
.css.atr.punct {
  color: #e0e0e0
}

.html.tag {
  color: #4D88FF
}
.html.tag.punct {
  color: #e0e0e0
}
.html.atr.name {
  color: #4D88FF
}
.html.atr.punct {
  color: #e0e0e0
}
.html.string {
  color: #FF7A00
}
.html.string.quotes {
  color: #00F288
}
</style>
