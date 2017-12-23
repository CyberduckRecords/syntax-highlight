const Lexer       = require('../Lexer').default
const Highlighter = require('../Parser').default
var CYBERDUCK     = new Lexer.State()
var CD_NEW        = new Lexer.State()
var CD_LIST       = new Lexer.State()
var CD_VARIABLE   = new Lexer.State()

let highlighter   = new Highlighter(CYBERDUCK)

CYBERDUCK ('(add|subtract|multiply|divide|sqrt|exp|to|by)') (highlighter.classify(['cyberduck operator']))
CYBERDUCK ('(if|else|is|while|this)')                       (highlighter.classify(['cyberduck keyword']))
CYBERDUCK ('new ')                                          (highlighter.rewriteAndClassify(highlighter.whitespaceHardener, ['cyberduck keyword'], Lexer.Continue(CD_NEW)))
CYBERDUCK ('(\\d+)([.]\\d+)?')                              (highlighter.classify(['cyberduck number','cyberduck number decimal']))
CYBERDUCK ('(;|\\(|\\))')                                   (highlighter.classify(['cyberduck punct']))
CYBERDUCK ('[\\n\\r \\t]+')                                 (highlighter.eta('hardenWhitespace'))
CYBERDUCK ('$')                                             (highlighter.stop)

CD_NEW ('(variable|constant)(?= )')    (highlighter.classify(['cyberduck storage'], Lexer.Continue(CD_VARIABLE)))
CD_NEW ('(List)(\\[)(?=[\\s\\S]*\\])') (highlighter.classify(['cyberduck constructor list','cyberduck list punct'], Lexer.Continue(CD_LIST)))
CD_NEW ('(?=[A-Z][a-zA-Z_]+;)')        (highlighter.classify(['cyberduck constructor other'], Lexer.Continue(CD_VARIABLE)))

CD_VARIABLE ('(?i)( ?\\w+(?=\\n|,|;))') (highlighter.classify(['cyberduck variable'], Lexer.Continue(CD_VARIABLE)))
CD_VARIABLE (',')                       (highlighter.classify(['cyberduck punct'], Lexer.Continue(CD_VARIABLE)))
CD_VARIABLE ('(\\n|;)')                 (highlighter.rewriteAndClassify(highlighter.whitespaceHardener,['cyberduck punct semicolon'], Lexer.Continue(CYBERDUCK)))
CD_VARIABLE ('[\\n\\r \\t]+')           (highlighter.eta('hardenWhitespace'))

CD_LIST ('([^,]+)(, ?)')   (highlighter.classify(['cyberduck list item','cyberduck punct']))
CD_LIST ('([^,]+)(?=\\])') (highlighter.classify(['cyberduck list item']))
CD_LIST ('\\]')            (highlighter.classify(['cyberduck list punct'], Lexer.Continue(CYBERDUCK)))

export default highlighter
