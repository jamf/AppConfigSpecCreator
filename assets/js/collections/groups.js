//collections/groups
define([
    "jquery", "underscore", "backbone", "helper/pubsub", "models/group"
], function(
   $, _, Backbone, PubSub, GroupModel
){
    return Backbone.Collection.extend({

        model: GroupModel,

        initialize: function()
        {
            PubSub.on("GroupAdd", this.addGroup, this);
        }

        ,addGroup: function(group)
        {
            this.add(group);
        }

	    , setLocalesCollection: function (collection) {
		    this.localesCollection = collection;
		    return this;
	    }

	    , getLocalesCollection: function () {
		    return this.localesCollection;
	    }

    });
});