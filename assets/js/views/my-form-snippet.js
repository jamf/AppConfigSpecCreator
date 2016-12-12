define([
       "jquery", "underscore", "backbone",
       "views/snippet", "views/temp-snippet",
       "helper/pubsub",
       //"text!templates/snippet/deviceVariable.html", "text!templates/snippet/userVariable.html", "text!templates/snippet/literalValue.html"
       "text!templates/popover/popover-input.html", "text!templates/popover/popover-select.html"
], function(
  $, _, Backbone,
  SnippetView, TempSnippetView,
  PubSub,
  //deviceVariableTemplate, userVariableTemplate, literalValueTemplate
  PopoverInputTemplate, PopoverSelectTemplate
){
  return SnippetView.extend({
    events:{
      "click"   : "preventPropagation" //stops checkbox / radio reacting.
      , "mousedown" : "mouseDownHandler"
      , "mouseup"   : "mouseUpHandler"
    }

      //This is the function called when you click on a form field and the popover shows up
    , mouseDownHandler : function(mouseDownEvent){
      mouseDownEvent.stopPropagation();
      mouseDownEvent.preventDefault();
      var that = this;
      
      this.$el.popover("destroy");

      //popover
      this.$el.on("shown.bs.popover", function(){
        $('.popover').css('top',parseInt($('.popover').css('top')) + parseInt($('.popover').css('height')) * .3 + 'px')
      });   

      $(".popover").remove();

      this.$el.popover({placement: "right"});
      this.$el.popover("show");

      $(".popover #save").on("click", this.saveHandler(that));
    
      $(".popover #cancel").on("click", this.cancelHandler(that));
     
      //handle if we change the defaultValueType of an input element
      $(".popover #defaultValueType").on("change",  this.defaultValueTypeChange(that, mouseDownEvent));

      //check if we have a defaultValueType and its selected to a variable. if so, only string dataType is available
      if($(".popover #defaultValueType").find(":selected").text() == "User Variable" || $(".popover #defaultValueType").find(":selected").text() == "Device Variable")
      {
          console.log("Only String");
          $(".popover #dataType").val('string');
          $(".popover #dataType").prop('disabled', 'disabled');
      }

      //add drag event for all but form name
      if(this.model.get("title") !== "Form Name"){
        $("body").on("mousemove", function(mouseMoveEvent){
          if(
            Math.abs(mouseDownEvent.pageX - mouseMoveEvent.pageX) > 10 ||
            Math.abs(mouseDownEvent.pageY - mouseMoveEvent.pageY) > 10
          ){
            that.$el.popover('destroy');
            PubSub.trigger("mySnippetDrag", mouseDownEvent, that.model);
            that.mouseUpHandler();
          };
        });
      }

      }

    , preventPropagation: function(e) {
      e.stopPropagation();
      e.preventDefault();
    }

    , mouseUpHandler : function(mouseUpEvent) {
        $("body").off("mousemove");
    }

    , saveHandler : function(boundContext) {
      return function(mouseEvent) {
        mouseEvent.preventDefault();
        var fields = $(".popover .field");
        _.each(fields, function(e){

          var $e = $(e)
          , type = $e.attr("data-type")
          , name = $e.attr("id");

          switch(type) {
            case "checkbox":
              boundContext.model.setField(name, $e.is(":checked"));
              break;
            case "input":
              boundContext.model.setField(name, $e.val());
              break;
            case "textarea":
              boundContext.model.setField(name, $e.val());
              break;
            case "textarea-split":
              boundContext.model.setField(name,
                _.chain($e.val().split("\n"))
                  .map(function(t){return $.trim(t)})
                  .filter(function(t){return t.length > 0})
                  .value()
                  );
              break;
            case "select":
                console.log("saving select");
              var valarr = _.map($e.find("option"), function(e){
                return {value: e.value, selected: e.selected, label:$(e).text()};
              });
              boundContext.model.setField(name, valarr);
              break;
            case "datetime":
              boundContext.model.setField(name, $e.val());
              break;
          }
        });
        boundContext.model.trigger("change");
        $(".popover").remove();
      }
    }

    , cancelHandler : function(boundContext) {
      return function(mouseEvent) {
        mouseEvent.preventDefault();
        $(".popover").remove();
        PubSub.trigger("cancelCheck", mouseEvent, boundContext.model);
        boundContext.model.trigger("change");
      }
    }

    , defaultValueTypeChange : function(boundContext, mouseDownEvent) {

        return function(mouseEvent)
        {
            mouseEvent.preventDefault();
            var type = $("#defaultValueType").find(":selected").text();

            _.map(boundContext.model.get("fields")["defaultValueType"]["value"], function(o){
               o["selected"] = false;
            });
            _.find(boundContext.model.get("fields")["defaultValueType"]["value"], function(o){
                return o["label"] == type;
            })["selected"] = true;


            var defaultValueElement = $(".popover #defaultValue");

            //remove the label since it will get redrawn from the template
            defaultValueElement.prev().remove();

            PubSub.trigger("inputDefaultValueTypeChange", mouseEvent, boundContext, type);
            PubSub.trigger("updatePopoverTemplate", boundContext.model, defaultValueElement, boundContext.model.get("fields")["defaultValue"]["type"]);

            //if deviceVariable of userVariable is selected, only the string data type is available
            if(type != "Literal Value")
            {
                $(".popover #dataType").val('string');
                $(".popover #dataType").prop('disabled', 'disabled');
            }
            else
            {
                $(".popover #dataType").prop('disabled', false);
            }
        }

    }

  });
});
