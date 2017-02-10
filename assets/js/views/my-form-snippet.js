define([
       "jquery", "underscore", "backbone",
       "views/snippet", "views/temp-snippet",
       "helper/pubsub",
       "text!templates/popover/popover-message.html"
], function(
  $, _, Backbone,
  SnippetView, TempSnippetView,
  PubSub,
  PopoverMessage
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
      $(".popover #defaultValueType").on("change",  this.defaultValueTypeChange(that));

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


      /**
       * Handle when the `save` button is pressed on the popover. This function handles form validation and saving field settings back to the model
       * @param boundContext  Context containing the model of the snippet
       * @returns {Function}  returns this functions functionality as a function to be used as a callback
       */
    , saveHandler : function(boundContext) {
        var that = this;
      return function(mouseEvent) {
        mouseEvent.preventDefault();
        var fields = $(".popover .field");

        //the element being used for the check (either defaultValue or options)
        var element;
        var passedCheck = false;

        //if there are options
        element = $(".popover #options");

        //clear any errors that might be left over from a previous check
        element.popover("destroy");
        element.parent().removeClass("error");

        if(element.length > 0)
        {
            if(!that.typeCheck(element))
            {
                that.showErrorPopoverMessage(element, "Not all options of selected data type");
                return
            }

            //if we have a default value, make sure its in the list of options
            var defaultValue = $(".popover #defaultValue");
            if(defaultValue.length > 0)
            {
                if(!that.optionsDVCheck(element))
                {
                   that.showErrorPopoverMessage(defaultValue, "Not a valid supplied option");
                    return
                }
            }
        }
        else
        {
            element = $(".popover #defaultValue");

            //clear any errors that might be left from a previous check
            element.popover("destroy");
            element.parent().removeClass("error");

            if(element.length > 0)
            {
                if(!that.typeCheck(element))
                {
                    that.showErrorPopoverMessage(element, "Value not of selected data type");
                    return
                }
            }
        }

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

      /**
       * Handle when the cancel button is pressed on the popover
       * @param boundContext Context containing the model of the snippet
       * @returns {Function}  returns this functions functionality to be used as a callback
       */
    , cancelHandler : function(boundContext) {
      return function(mouseEvent) {
        mouseEvent.preventDefault();
        $(".popover").remove();
        PubSub.trigger("cancelCheck", mouseEvent, boundContext.model);
        boundContext.model.trigger("change");
      }
    }

      /**
       * Changes the default value type of the current snippet being operated on. This takes place in the popover.
       * @param boundContext  The context containing the model of the snippet
       * @returns {Function}  returns the function that does the default value type changing. This is used as a callback function
       */
    , defaultValueTypeChange : function(boundContext) {

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

      /**
       *  Checks if the given element is entirely compliant with the selected data type of the corresponding snippet
       * @param element Element to check
       * @returns {boolean}  Returns whether the element is compliant
       */
    , typeCheck: function(element) {
          var allGood;

          var dataType = $(".popover #dataType").find(":selected").val();
          allGood = true;
          var numbers = element.val().split("\n");

          if (typeof dataType !== 'undefined') {
              if (dataType.includes("integer")) {
                  _.each(numbers, function (o) {
                      if (isNaN(o) || o % 1) allGood = false;
                  });
              }
              else if (dataType.includes("float")) {
                  _.each(numbers, function (o) {
                      if (isNaN(o)) allGood = false;
                  });
              }
          }
          return allGood;
      }

      /**
       *  Options default value check. This checks to make sure the default value is a valid option given in the options list,
       *  Pass the JQuery element representing the options list
       * @param element
       */
      ,optionsDVCheck: function(element)
      {
          var allGood = false;
          var defaultValue = $(".popover #defaultValue").val();

          //automatically return true if the default value is empty. (aka we dont have a default value)
          if(defaultValue == "") {return true;}

          var options = element.val().split("\n");
          _.each(options, function(o)
          {
             if(defaultValue == o) {allGood = true;}
          });
          return allGood;
      }

      /**
       * Shows an error message as a popover next to the specified root element
       * @param rootElement The element to show the message for
       * @param message The message to display
       */
      ,showErrorPopoverMessage: function(rootElement, message)
      {
          rootElement.focus();
          rootElement.attr('data-content', message);
          rootElement.parent().addClass("error");
          rootElement.popover({
              template: PopoverMessage
          });
          rootElement.popover("show");
      }


  });
});
