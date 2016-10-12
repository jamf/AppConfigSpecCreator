define([
       "jquery" , "underscore" , "backbone"
       , "models/locale-model"
       , "views/locale-view"
], function(
  $, _, Backbone
  , LocaleModel
  , LocaleView
){
  return Backbone.Collection.extend({
    model: LocaleModel
    , renderAll: function(){
      return this.map(function(locale){
        return new LocaleView({model: locale}).render();
      });
    }
  });
});
