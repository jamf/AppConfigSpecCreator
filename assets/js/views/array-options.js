//views/array-options
define([
    "jquery", "underscore", "backbone", "bootstrap",
    "views/array-option"
], function(
    $, _, Backbone, Bootstrap,
    ArrayOptionView
){
   return Backbone.View.extend({

       initialize: function()
       {
       }

       ,render: function()
       {
           var that = this;
           this.$el.empty();
           this.collection.each(function(option){
               var view = new ArrayOptionView({model: option}).render();
               that.$el.append(view.$el);
           });

           return this;
       }
   });
});