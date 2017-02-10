// model/snippet.js aka SnippetModel
define([
      'jquery', 'underscore', 'backbone',
      'helper/pubsub'
], function($, _, Backbone, PubSub) {
	
  return Backbone.Model.extend({
    initialize: function() {
      this.set("fresh", true);
      //this.initGroup();
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
        model.get("fields")["defaultValue"]["defaultType"] =  type;
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
      },

      getGroupLabel: function()
      {
        if("group" in this.get("fields")){
            return _.findWhere(this.get("fields")["group"]["value"], {selected: true})["label"];
        }
        else
        {
            return "__FORM_NAME__";
        }
      }

      ,addGroup: function(group)
      {
          if("group" in this.get("fields")) {
              this.get("fields")["group"]["value"].push(group.getJSON());
              console.log("groups: " + JSON.stringify(this.get("fields")["group"]["value"]));
          }
      }

      ,setGroup: function(group)
      {
          if("group" in this.get("fields")) {
              _.findWhere(this.get("fields")["group"]["value"], {selected: true})["selected"] = false;
              _.findWhere(this.get("fields")["group"]["value"], {label: group})["selected"] = true;
              this.trigger("change");
          }
      }

      ,setGroups: function(groups){
          var that = this;

          // Only set the groups if the current number of groups is only 1.
          // This will only be the case if a new snippet is being added to the form, and
          // guards against duplicate group representations if a snippet is reordered in the form
          //console.log(JSON.stringify(this.get("fields")));
          if(this.get("fields").hasOwnProperty("group") && this.get("fields")["group"]["value"].length == 1)
          {
              //that.initGroup();
              _.each(groups.groups, function(group) {
                  that.get("fields")["group"]["value"].push(group);
              });
          }
      },

      removeGroup: function(group)
      {
          if("group" in this.get("fields")){
              var groups = this.get("fields")["group"]["value"];
              var groupToRemove = _.findWhere(groups, {value: group});

              console.log("Removing group: " + JSON.stringify(groupToRemove));

              //if the current selected group is the group to remove, change the group to `none`
              if(groupToRemove.selected){
                  _.findWhere(groups, {value: ""}).selected = true;
              }

              this.get("fields")["group"]["value"] = _.without(groups, groupToRemove);
          }
      }

  });
});
