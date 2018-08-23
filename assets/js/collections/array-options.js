//collections/array-options
define([
    "jquery", "underscore", "backbone",
    "models/array-option", "views/array-options"
], function(
    $, _, Backbone,
    ArrayOptionModel, ArrayOptionsView
){
   return Backbone.Collection.extend({


       initialize: function()
       {
           this.on("all", this.render);

       }

       ,render: function()
       {
           new ArrayOptionsView({collection: this}).render();
       }

        , setLocalesCollection: function (collection) {
            this.localesCollection = collection;
            return this;
        }

        , getLocalesCollection: function () {
            return this.localesCollection;
        }
   });
});