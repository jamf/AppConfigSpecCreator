// collection/snippet.js aka SnippetsCollection - this appears as all of the form elements the user can build their form from.
define([
       "jquery" , "underscore" , "backbone"
       , "models/snippet"
       , "views/tab-snippet"
], function(
  $, _, Backbone
  , SnippetModel
  , TabSnippetView
){
  return Backbone.Collection.extend({
	  
    model: SnippetModel
	  
    , renderAll: function(){
      return this.map(function(snippet){
        return new TabSnippetView({model: snippet}).render();
      });
    }
	
  });
});
