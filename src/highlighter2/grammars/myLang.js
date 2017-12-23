import State from '../State'
import Parser from '../Parser'

var CYBERDUCK     = new State('Cyberduck')
var CD_NEW        = new State('Cyberduck New')
var CD_LIST       = new State('Cyberduck List')
var CD_VARIABLE   = new State('Cyberduck Variable')
var CD_VALUE      = new State('Cyberduck Value')

CYBERDUCK.Add   ('operator')        ('(add|subtract|multiply|divide|sqrt|exp|to|by)') ('cyberduck operator')
CYBERDUCK.Add   ('state')           ('(if|else|is|while|this)')                       ('cyberduck keyword')
CYBERDUCK.Add   ('keyword')         ('new ')                                          ('cyberduck keyword', CD_NEW)
CYBERDUCK.Add   ('number')          ('(\\d+)([.]\\d+)?')                              ('cyberduck number,cyberduck number decimal')
CYBERDUCK.Add   ('punctuation')     ('(;|\\(|\\))')                                   ('cyberduck punct')
CYBERDUCK.Add   ('whitespace')      ('[\\n\\r \\t]+')                                 ('whitespace')

CD_NEW.Add      ('storage')         ('(variable|constant)(?= )')                      ('cyberduck storage', CD_VARIABLE)
CD_NEW.Add      ('constructor')     ('(List)(\\[)(?=[\\s\\S]*\\])')                   ('cyberduck constructor list,cyberduck list punct', CD_LIST)
CD_NEW.Add      ('variable')        ('(?=[A-Z][a-zA-Z_]+;)')                          ('cyberduck constructor other', CD_VARIABLE)

CD_VARIABLE.Add ('variable-name')   ('(?i)( ?\\w+(?= ?=))')                           ('cyberduck variable name')
CD_VARIABLE.Add ('variable-value')  ('(?i)( ?= ?)(?=.+(?=\\n|,|;))')                  ('cyberduck punct', CD_VALUE, CD_VARIABLE)
CD_VARIABLE.Add ('punctuation')     (',')                                             ('cyberduck punct')
CD_VARIABLE.Add ('punctuation')     ('(\\n|;)')                                       ('cyberduck punct semicolon', CYBERDUCK)
CD_VARIABLE.Add ('whitespace'     ) ('[\\n\\r \\t]+')                                 ('whitespace')

CD_LIST.Add     ('list-item')       ('(?=[^,]+(?=, ?|\\]))')                          ('cyberduck list', CD_VALUE, CD_LIST)
CD_LIST.Add     ('punctuation')     ('(, ?)')                                         ('cyberduck punct')
CD_LIST.Add     ('punctuation')     ('\\]')                                           ('cyberduck list punct', CYBERDUCK)

CD_VALUE.Add    ('string double')   ('(?i)([\"])([^\"]*)(\\1)')                       ('cyberduck value string punct,cyberduck value string,cyberduck value string punct')
CD_VALUE.Add    ('string single')   ('(?i)([\'])([^\']*)(\\1)')                       ('cyberduck value string punct,cyberduck value string,cyberduck value string punct')
CD_VALUE.Add    ('string template') ('(?i)([\`])([^\`]*)(\\1)')                       ('cyberduck value string punct,cyberduck value string,cyberduck value string punct')
CD_VALUE.Add    ('text')            ('(?i)([a-z0-9_\\-?!@#$%&~*\\/]+)')               ('cyberduck value text')

const highlighter = new Parser(CYBERDUCK)

export default highlighter
