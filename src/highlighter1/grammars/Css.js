const Lexer       = require('../Lexer').default
const Highlighter = require('../Parser').default
var CSS           = new Lexer.State()
var ATRS          = new Lexer.State()
var ATR_VALUE     = new Lexer.State()
var ATR_VALUE_END = new Lexer.State()
var END           = new Lexer.State()

let highlighter   = new Highlighter(CSS)

CSS (/(\s*[^\r\n,{}]+)(,(?=[^}]*{)|\s*{)(?=[\s\S]*})/) (highlighter.classify(['css selector','css punct'], Lexer.Continue(ATRS)))
CSS (/$/) (highlighter.stop)

//(\s*[a-zA-Z-]+)(:)(\s+[a-zA-z0-9]+)(;)(?=\s*}|\s*[a-zA-z-]+:\s+[a-zA-z0-9]+;)
ATRS (/(\s*[a-zA-Z-]+)(:)(?=\s+.+;)/) (highlighter.classify(['css atr name','css atr punct'], Lexer.Continue(ATR_VALUE)))
ATRS (/\s*}/)                                   (highlighter.classify(['css punct'], Lexer.Continue(CSS)))

ATR_VALUE (/(\s*[0-9]+)/)          (highlighter.classify(['css atr value number'], Lexer.Continue(ATR_VALUE)))
ATR_VALUE (/(\s*[^0-9;{}]+)/)      (highlighter.classify(['css atr value text'], Lexer.Continue(ATR_VALUE)))
ATR_VALUE (/(?=\s*;)/)             (highlighter.classify(['css atr value'], Lexer.Continue(ATR_VALUE_END)))

ATR_VALUE_END (/(;)/) (highlighter.classify(['css atr punct'], Lexer.Continue(ATRS)))

export default highlighter
