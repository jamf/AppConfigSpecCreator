// model/group.js aka GroupModel
define([
      'jquery', 'underscore', 'backbone',
      'helper/pubsub'
], function($, _, Backbone, PubSub) {

    return Backbone.Model.extend({
        initialize: function (name) {
            //this.groups = [];
            //PubSub.on("requestGroupModel", this.modelRequest, this);
            this.encode(name);
        },

        encode: function(name)
        {
            var encoded = "";
            //encode the group name with ascii values with hyphens between character values
            for(var i = 0; i < name.length; i++)
            {
                encoded += name.charCodeAt(i);
                encoded += "-";
            }

            //remove the last hyphen
            encoded = encoded.substring(0, encoded.length - 1);

            this.value = encoded;
            this.label = name;
            this.selected = false;
        }
        ,getJSON: function()
        {
            return {value: this.value, label: this.label, selected: false};
        }

        ,removeGroup: function (groupName) {
            this.groups = _.without(this.groups, _.findWhere(this.groups, {"label": groupName}));

            PubSub.trigger("removeGroup", groupName);
            PubSub.trigger("setGroups");
        },

        clearGroups: function()
        {
            this.groups = [];
        },

        modelRequest: function(requester)
        {
            requester.setGroupModel(this);
        }

    });
});
