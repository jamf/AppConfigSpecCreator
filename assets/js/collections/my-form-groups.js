/**
 * Created by mike.mello on 1/25/17.
 */
define([
    "jquery" , "underscore" , "backbone"
    , "models/group", "models/snippet", "models/plain-xml-model"
    , "collections/snippets"
    , "views/my-form-snippet", "views/plain-xml-view"
    , "text!data/fields.json"
    , "helper/pubsub"
], function(
    $, _, Backbone
    , GroupModel, SnippetModel, PlainXMLModel
    , SnippetsCollection
    , MyFormSnippetView, PlainXMLView
    , fieldsJSON
    , PubSub
){
    return Backbone.Collection.extend({

        model: GroupModel
        ,initialize: function(){
            this.collection = null;
        }

        ,addGroup: function(group)
        {
            var group = new GroupModel(group);
            this.add(group);
            PubSub.trigger("updateModal", this);
        }

        ,removeGroup: function(group)
        {
            var modelToRemove = _.findWhere(this.models, {value: group});
            console.log("removing : " + JSON.stringify(modelToRemove));
            //var modelToRemove = new GroupModel(group);
            this.remove(modelToRemove);
            PubSub.trigger("updateModal", this);
        }

        ,getGroups: function()
        {
            return _.reduce(this.models, function(o, v, k){
                o.groups[k] = {value: v["value"], label: v["label"], selected: v["selected"]}
                //o.groups[k] = v["label"];
                return o;
            }, {groups: []});
        }

        ,getLabel: function(encodedValue)
        {
            return _.findWhere(this.models, {value: encodedValue})["label"];
        }
    });
})
