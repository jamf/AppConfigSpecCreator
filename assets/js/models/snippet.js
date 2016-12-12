// model/snippet.js aka SnippetModel
define([
      'jquery', 'underscore', 'backbone',
      'helper/pubsub'
], function($, _, Backbone, PubSub) {
	
  return Backbone.Model.extend({

    initialize: function() {
      this.set("fresh", true);
      PubSub.on("inputDefaultValueTypeChange", this.defaultValueTypeChange, this);
    }
	
    , getValues: function(){
      var that = this;
      return _.reduce(this.get("fields"), function(o, v, k){
        if (v["type"] == "select") {
          //console.log(v["value"])
          o[k] = _.find(v["value"], function (o) {
              //console.log("o" + o["value"]);
              return o.selected
          })["value"];
      }
        else {
            o[k] = v["value"];
        }


        return o;
      }, {});
    }
	
    , idFriendlyTitle: function(){
      return this.get("title").replace(/\W/g,'').toLowerCase();
    }
	
    , setField: function(name, value) {
      var fields = this.get("fields")
      fields[name]["value"] = value;
      this.set("fields", fields);
    }
    , parseInputField: function(){

      }
	,
      defaultValueTypeChange: function(mouseEvent, boundContext, type) {
        var model = boundContext.model;
        if(model.get("title") == "input")
        {

            switch(type)
            {
                case "Literal Value":
                    //console.log("literal");
                    model.get("fields")["defaultValue"]["type"] = "input";
                    model.get("fields")["defaultValue"]["value"] = null;
                    break;

                case "Device Variable":
                    //console.log(model.get("fields"));
                    model.get("fields")["defaultValue"]["type"] = "select";
                    model.get("fields")["defaultValue"]["value"] = model.get("fields")["defaultValue"]["variables"]["deviceVariable"];
                    console.log(model.get("fields")["defaultValue"]["value"]);
                    break;

                case "User Variable":
                    //console.log("user");
                    model.get("fields")["defaultValue"]["type"] = "select";
                    model.get("fields")["defaultValue"]["value"] = model.get("fields")["defaultValue"]["variables"]["userVariable"];
                    break;

           }

        }
        model.get("fields")["defaultValue"]["defaultType"] =  type;
      }
  });
});
