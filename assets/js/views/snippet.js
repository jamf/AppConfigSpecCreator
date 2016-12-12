// views/snippet.js
define([
  "jquery", "underscore", "backbone"
  , "text!templates/popover/popover-main.html"
  , "text!templates/popover/popover-input.html"
  , "text!templates/popover/popover-select.html"
  , "text!templates/popover/popover-multiselect.html"
  , "text!templates/popover/popover-textarea.html"
  , "text!templates/popover/popover-textarea-split.html"
  , "text!templates/popover/popover-checkbox.html"
  , "text!templates/popover/popover-datetime.html"
  , "templates/snippet/snippet-templates"
  , "templates/snippet/xml/snippet-xml-templates"
  , "helper/pubsub"
  , "bootstrap"
], function(
  $, _, Backbone
  , _PopoverMain
  , _PopoverInput
  , _PopoverSelect
  , _PopoverMultiselect
  , _PopoverTextArea
  , _PopoverTextAreaSplit
  , _PopoverCheckbox
  , _PopoverDatetime
  , _snippetTemplates
  , _snippetXmlTemplates
  , _PubSub
){
  return Backbone.View.extend({
    tagName: "div"
    , className: "component" 
    , initialize: function(){
      _PubSub.on("updatePopoverTemplate", this.updatePopoverTemplate, this);
      this.template = _.template(_snippetTemplates[this.model.idFriendlyTitle()])
      this.dictTemplate = _.template(_snippetXmlTemplates[this.model.idFriendlyTitle() + "Dict"]);
      this.presTemplate = _.template(_snippetXmlTemplates[this.model.idFriendlyTitle() + "Pres"]);

      this.popoverTemplates = {
        "input" : _.template(_PopoverInput)
        , "select" : _.template(_PopoverSelect)
        , "multiselect" : _.template(_PopoverMultiselect)
        , "textarea" : _.template(_PopoverTextArea)
        , "textarea-split" : _.template(_PopoverTextAreaSplit)
        , "checkbox" : _.template(_PopoverCheckbox)
        , "datetime" : _.template(_PopoverDatetime)
      }
    }
    , render: function(withAttributes){
      var that = this;

      //populates the main popover template with the more specific popover template of the specified field type
      var content = _.template(_PopoverMain)({
        "title": that.model.get("title"),
        "items" : that.model.get("fields"),
        "popoverTemplates": that.popoverTemplates
      });

      //console.log("content: " + content);
      //Add listener to input for "Default Value Type"

      if (withAttributes) {
        return this.$el.html(
          that.template(that.model.getValues())
        ).attr({
          "data-content"     : content
          , "data-title"     : that.model.get("title")
          , "data-trigger"   : "manual"
          , "data-html"      : true
        });
      } else {
        return this.$el.html(
          that.template(that.model.getValues())
        )
      }      
    }
    , renderDictXML: function() {
      var that = this;
      return that.dictTemplate(that.model.getValues());
    }
    , renderPresXML: function() {
      var that = this;
      return that.presTemplate(that.model.getValues());
    }
    ,
      updatePopoverTemplate: function(model, elem, type) {
        console.log("updating popover");

        //this.template(model.getValues());
        switch(type)
        {
            case "input":
              var template = this.popoverTemplates["input"](model.get("fields")["defaultValue"]);
              //console.log("template" + template);
              elem.replaceWith(template);
              break;
            case "select":
                var template = this.popoverTemplates["select"](model.get("fields")["defaultValue"]);
                //console.log("template: " + template);
              elem.replaceWith(template);
              break;
              /*
              ... can continue switch cases for the rest of the element types here
               */
        }


      }
  });
});
