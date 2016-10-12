define([
       "jquery", "underscore", "backbone"
      , "views/temp-snippet", "collections/locales-collection"
      , "helper/pubsub"
      , "text!templates/app/locales-template.html"
], function(
  $, _, Backbone
  , TempSnippetView, localesCollection
  , PubSub
  , _localesTemplate
){
  return Backbone.View.extend({
    el: "#localeInput",
    initialize: function(){
      this.collection.on("add", this.render, this);
      this.collection.on("remove", this.render, this);
      this.collection.on("change", this.render, this);
      this.localesTemplate = _.template(_localesTemplate);
      this.render();
    }

    , render: function(){
      //Render Locale Views
      this.$el.empty();
      var that = this;
      _.each(this.collection.renderAll(), function(locale){
        that.$el.append(locale);
      });

      this.$el.appendTo("#localeInput");
      this.delegateEvents();
    }
  })
});
