//views/modal/group-list-element
define([
	"jquery", "underscore", "backbone", "bootstrap", "helper/pubsub",
	"text!templates/modal/locale-list-element.html", "views/modal/locale"
], function(
	$, _, Backbone, Bootstrap, PubSub,
	GroupTemplate, GroupModalView
){
	return Backbone.View.extend({

		template: _.template(GroupTemplate),

		initialize: function()
		{

		}

		,render: function()
		{
			this.$el.empty();
			this.$el.html(this.template({model: this.model}));

			return this;
		}

		,events: {
			"click .group-remove" : "remove",
			"click .group-edit": "edit"
		}

		,remove: function()
		{
			PubSub.trigger("RemoveGroup", this.model.get("name"));
			this.model.destroy();
		}

		,edit: function()
		{
			new GroupModalView({model: this.model, collection: this.collection});
		}
	});
});
