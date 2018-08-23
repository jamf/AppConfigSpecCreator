//views/array-options
define([
    "jquery", "underscore", "backbone", "bootstrap",
    "views/constraint-value"
], function(
    $, _, Backbone, Bootstrap,
    ConstraintValueView
){
   return Backbone.View.extend({

       initialize: function()
       {
       }

       ,render: function()
       {
           var that = this;
           this.$el.empty();
           this.collection.each(function(constraintValue){
               var view = new ConstraintValueView({model: constraintValue}).render();
               that.$el.append(view.$el);
           });

           return this;
       }
   });
});