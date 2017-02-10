define([
      'jquery', 'underscore', 'backbone'
], function($, _, Backbone) {
  return Backbone.Model.extend({
    getValues: function(){
      var that = this;
      return _.reduce(this.get("fields"), function(o, v, k){
        if (v["type"] == "select") {
          o[k] = _.find(v["value"], function(o){return o.selected})["value"];
        } else {
          o[k]  = v["value"];
        }
        return o;
      }, {});
    },
    getGroup: function()
    {
      var that = this;
      if("group" in this.get("fields")){
        return _.findWhere(this.get("fields")["group"]["value"], {selected: true})["value"];
      }
      else {
        return "__FORM_NAME__";
      }
    }
  });
});
