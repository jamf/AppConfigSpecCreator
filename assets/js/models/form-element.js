//models/form-element
define([
    "jquery", "underscore", "backbone"
], function(
    $, _, Backbone
){
   return Backbone.Model.extend({

       type: "abstract",

       initialize: function()
       {

       },


       isGroup: function()
       {
           return false;
       }

       ,getContents: function() {}
       ,getPosition: function(){}
   });
});