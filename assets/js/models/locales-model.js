define([
      'jquery', 'underscore', 'backbone'
], function($, _, Backbone) {
  return Backbone.Collection.extend({
    defaults: {
      value: "",
    },
    initialize: function() {
      console.log("Initializing locales model");
      //this.listenTo('delete', this.remove);
    },  
  });
});
