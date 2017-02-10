define(function(require) {
  var checkboxDict           = require('text!templates/snippet/xml/snippetDict.xml')
  , checkboxPres             = require('text!templates/snippet/xml/snippetPres.xml')
  , selectDict               = require('text!templates/snippet/xml/snippetDict.xml')
  , selectPres               = require('text!templates/snippet/xml/snippetPres.xml')
  , multiselectDict          = require('text!templates/snippet/xml/snippetDict.xml')
  , multiselectPres          = require('text!templates/snippet/xml/snippetPres.xml')
  , hiddenDict               = require('text!templates/snippet/xml/snippetDict.xml')
  , hiddenPres               = require('text!templates/snippet/xml/snippetPres.xml')
  , inputDict                = require('text!templates/snippet/xml/snippetDict.xml')
  , inputPres                = require('text!templates/snippet/xml/snippetPres.xml')
  , datetimeDict             = require('text!templates/snippet/xml/snippetDict.xml')
  , datetimePres             = require('text!templates/snippet/xml/snippetPres.xml')
  , listDict                 = require('text!templates/snippet/xml/snippetDict.xml')
  , listPres                 = require('text!templates/snippet/xml/snippetPres.xml')
  , formnameDict             = require('text!templates/snippet/xml/formnameDict.xml')
  , formnamePres             = require('text!templates/snippet/xml/tbd.xml')
  , endDict                  = require('text!templates/snippet/xml/endDict.xml')
  , startPres                = require('text!templates/snippet/xml/startPres.xml')
  , endPres                  = require('text!templates/snippet/xml/endPres.xml')
  , endSpec                  = require('text!templates/snippet/xml/endSpec.xml')
  , startGroup               = require('text!templates/snippet/xml/startGroup.xml')
  , endGroup                 = require('text!templates/snippet/xml/endGroup.xml')

  return {
    checkboxDict              : checkboxDict
    , checkboxPres            : checkboxPres
    , selectDict              : selectDict
    , selectPres              : selectPres
    , multiselectDict         : multiselectDict
    , multiselectPres         : multiselectPres
    , hiddenDict              : hiddenDict
    , hiddenPres              : hiddenPres
    , inputDict               : inputDict
    , inputPres               : inputPres
    , datetimeDict            : datetimeDict
    , datetimePres            : datetimePres
    , listDict                : listDict
    , listPres                : listPres
    , formnameDict            : formnameDict
    , formnamePres            : formnamePres
    , endDict                 : endDict
    , startPres               : startPres
    , endPres                 : endPres
    , endSpec                 : endSpec
    , startGroup              : startGroup
    , endGroup                : endGroup
  }
});
