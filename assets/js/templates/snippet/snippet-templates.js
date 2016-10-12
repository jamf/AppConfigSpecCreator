define(function(require) {
  var formname               = require('text!templates/snippet/formname.html')
  , checkbox                 = require('text!templates/snippet/checkbox.html')
  , select                   = require('text!templates/snippet/select.html')
  , multiselect              = require('text!templates/snippet/multiselect.html')
  , hidden                   = require('text!templates/snippet/hidden.html')
  , input                    = require('text!templates/snippet/input.html')
  , datetime                 = require('text!templates/snippet/datetime.html')
  , list                     = require('text!templates/snippet/list.html')

  return {
    formname                   : formname
    , checkbox                 : checkbox
    , select                   : select
    , multiselect              : multiselect
    , hidden                   : hidden
    , input                    : input
    , datetime                 : datetime
    , list                     : list
  }
});
