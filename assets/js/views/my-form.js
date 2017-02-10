define([
       "jquery", "underscore", "backbone"
      , "views/temp-snippet"
      , "helper/pubsub"
      , "text!templates/app/renderform.html"
      , "text!templates/app/groups-form.html"
], function(
  $, _, Backbone
  , TempSnippetView
  , PubSub
  , _renderForm
  , _groupsForm
){
  return Backbone.View.extend({
    tagName: "fieldset"
    , initialize: function(){
      this.collection.on("add", this.render, this);
      this.collection.on("remove", this.render, this);
      this.collection.on("change", this.render, this);
      PubSub.on("mySnippetDrag", this.handleSnippetDrag, this);
      PubSub.on("tempMove", this.handleTempMove, this);
      PubSub.on("tempDrop", this.handleTempDrop, this);
      this.$build = $("#build");
      this.renderForm = _.template(_renderForm);
      this.groupsForm = _.template(_groupsForm);
      this.render();
    }

    , render: function(){
      //Render Snippet Views
      this.$el.empty();
      var that = this;
      var containsFile = false;

      this.$el.append("<div id='bundleVersionDiv'></div>");


      if(this.collection.groupCollection.models.length > 0) {
        this.$el.append("<div class='span6'><div id='groupsFormDiv' class='span6' ></div></div>");

        $("#groupsFormDiv").append(this.groupsForm(this.collection.groupCollection));
      }


      this.$el.append("<div class='span6'><div id='defaultFormDiv'</div>")

      //For each snippet, render it to the form
      _.each(this.collection.renderAll(), function(snippet){
        if(snippet.attr("data-group") == "__FORM_NAME__"){
          that.$el.find("#bundleVersionDiv").append(snippet);
        } else if(snippet.attr("data-group") == ""){
          that.$el.find("#defaultFormDiv").append(snippet);
        }else {
          var groupDiv = "#" + snippet.attr("data-group") + "_DIV";
          console.log("appending to: " + groupDiv);
          $(groupDiv).append(snippet);
        }

      });

      $("#render").val(that.renderForm({
        multipart: this.collection.containsFileType(),
        text: _.map(this.collection.renderAllClean(), function(e){return e.html()}).join("\n")
      }));

      //append the form to the dom
      this.$el.appendTo("#build form");
      this.delegateEvents();
    }

    , getBottomAbove: function(eventY){
      var myFormBits = $(this.$el.find(".component"));
      var topelement = _.find(myFormBits, function(renderedSnippet) {
        if (($(renderedSnippet).position().top + $(renderedSnippet).height()) > eventY  - 90) {
          return true;
        }
        else {
          return false;
        }
      });
      if (topelement){
        return topelement;
      } else {
        return myFormBits[0];
      }
    }

    , handleSnippetDrag: function(mouseEvent, snippetModel) {
      $("body").append(new TempSnippetView({model: snippetModel}).render());
      this.collection.remove(snippetModel);
      PubSub.trigger("newTempPostRender", mouseEvent);
    }

    , handleTempMove: function(mouseEvent){
      $(".target").removeClass("target");
      if(mouseEvent.pageX >= this.$build.position().left &&
          mouseEvent.pageX < (this.$build.width() + this.$build.position().left) &&
          mouseEvent.pageY >= this.$build.position().top &&
          mouseEvent.pageY < (this.$build.height() + this.$build.position().top)){
        $(this.getBottomAbove(mouseEvent.pageY)).addClass("target");
      } else {
        $(".target").removeClass("target");
      }
    }

    , handleTempDrop: function(mouseEvent, model, index){
      if(mouseEvent.pageX >= this.$build.position().left &&
         mouseEvent.pageX < (this.$build.width() + this.$build.position().left) &&
         mouseEvent.pageY >= this.$build.position().top &&
         mouseEvent.pageY < (this.$build.height() + this.$build.position().top)) {
        var index = $(".target").index();
        $(".target").removeClass("target");
        this.collection.add(model,{at: index+1});
      } else {
        $(".target").removeClass("target");
      }
    }
  })
});
