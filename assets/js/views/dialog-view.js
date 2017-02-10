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
  , "text!templates/popover/popover-group.html"
  , "templates/snippet/snippet-templates"
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
  , _PopoverGroup
  , _snippetTemplates
){
  return Backbone.View.extend({
    tagName: "div"
    , className: "component" 
    , initialize: function(){
      this.template = _.template(_snippetTemplates[this.model.idFriendlyTitle()])
      this.popoverTemplates = {
        "input" : _.template(_PopoverInput)
        , "select" : _.template(_PopoverSelect)
        , "multiselect" : _.template(_PopoverMultiselect)
        , "textarea" : _.template(_PopoverTextArea)
        , "textarea-split" : _.template(_PopoverTextAreaSplit)
        , "checkbox" : _.template(_PopoverCheckbox)
        , "datetime" : _.template(_PopoverDatetime)
        , "group" : _.template(_PopoverGroup)
      }
    }
    , render: function(withAttributes){
      var that = this;
      var content = _.template(_PopoverMain)({
        "title": that.model.get("title"),
        "items" : that.model.get("fields"),
        "popoverTemplates": that.popoverTemplates
      });
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
  });
});
