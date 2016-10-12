define([
      'jquery', 'underscore', 'backbone'
], function($, _, Backbone) {
  return Backbone.Model.extend({
    defaults: {
      value: "",
    },
    initialize: function() {
      console.log("Initializing locale model");
    },  
  });
});
