const Lexer       = require('../Lexer').default
const Highlighter = require('../Parser').default
var HTML          = new Lexer.State()
var TAG_END       = new Lexer.State()
var TAG_STUFF     = new Lexer.State()
var STRING_DOUBLE = new Lexer.State()
var STRING_SINGLE = new Lexer.State()
var TEXT          = new Lexer.State()

let highlighter   = new Highlighter(HTML)

HTML ('<!--[\\s\\S]*-->')                     (highlighter.classify(['html comment']))
HTML ('[\\n\\r \\t]+')                        (highlighter.eta('hardenWhitespace'))
HTML ('(<\\/?)(body|head|html)(?=\\s|\\/?>)') (highlighter.classify(['html tag punct','html tag name structure'], Lexer.Continue(TAG_STUFF)))
HTML ('(<\\/?)(address|blockquote|dd|div|section|article|aside|header|footer|nav|menu|dl|dt|fieldset|form|frame|frameset|h1|h2|h3|h4|h5|h6|iframe|noframes|object|ol|p|ul|applet|center|dir|hr|pre)(?=\\s|\\/?>)') (highlighter.classify(['html tag punct','html tag name block'], Lexer.Continue(TAG_STUFF)))
HTML ('(<\\/?)(a|abbr|acronym|area|b|base|basefont|bdo|big|br|button|caption|cite|code|col|colgroup|del|dfn|em|font|head|html|i|img|input|ins|isindex|kbd|label|legend|li|link|map|meta|noscript|optgroup|option|param|q|s|samp|script|select|small|span|strike|strong|style|sub|sup|table|tbody|td|textarea|tfoot|th|thead|title|tr|tt|u|var)(?=\\s|\\/?>)') (highlighter.classify(['html tag punct','html tag name inline'], Lexer.Continue(TAG_STUFF)))
HTML ('(<\\/?)([a-zA-Z0-9:-]+)(?=\\s|\\/?>)') (highlighter.classify(['html tag punct','html tag name other'], Lexer.Continue(TAG_STUFF)))
HTML ('($)') (highlighter.stop)

TAG_STUFF ('[\\n\\r \\t]+')             (highlighter.eta('hardenWhitespace'))
TAG_STUFF ('([^\\s/=>"\'<]+)(=)(?=")')  (highlighter.classify(['html atr name','html atr punct'], Lexer.Continue(STRING_DOUBLE)))
TAG_STUFF ('([^\\s/=>"\'<]+)(=)(?=\')') (highlighter.classify(['html atr name','html atr punct'], Lexer.Continue(STRING_SINGLE)))
TAG_STUFF ('([^\\s/=>"\'<]+)(=)(?=>)')  (highlighter.classify(['html atr name','html atr punct'], Lexer.Continue(TAG_END)))
TAG_STUFF ('([^\\s/=>"\'<]+)(?=\\s)')   (highlighter.classify(['html atr name','html atr punct'], Lexer.Continue(TAG_STUFF)))
TAG_STUFF ('([^\\s/=>"\'<]+)(?=\\/?>)') (highlighter.classify(['html atr name','html atr punct'], Lexer.Continue(TAG_END)))
TAG_STUFF ('(?=\\s|\\/?>)')             (highlighter.classify(['html atr'], Lexer.Continue(TAG_END)))

STRING_DOUBLE ('(")([^"]*?)(")(?=\\s)')   (highlighter.classify(['html string quotes double','html string double','html string quotes double'], Lexer.Continue(TAG_STUFF)))
STRING_DOUBLE ('(")([^"]*?)(")(?=\\/?>)') (highlighter.classify(['html string quotes double','html string double','html string quotes double'], Lexer.Continue(TAG_END)))

STRING_SINGLE ('(\')([^\']*?)(\')(?=\\s)')   (highlighter.classify(['html string quotes single','html string single','html string quotes single'], Lexer.Continue(TAG_STUFF)))
STRING_SINGLE ('(\')([^\']*?)(\')(?=\\/?>)') (highlighter.classify(['html string quotes single','html string single','html string quotes single'], Lexer.Continue(TAG_END)))

TEXT ('[\\s\\S]*?(?=<)') (highlighter.rewriteAndClassify(highlighter.whitespaceHardener, ['html text'], Lexer.Continue(HTML)))

TAG_END ('\\/?>') (highlighter.classify(['html tag punct'], Lexer.Continue(TEXT)))
TAG_END ('\\s')   (highlighter.rewrite(highlighter.whitespaceHardener, Lexer.Continue(TAG_END)))

export default highlighter
