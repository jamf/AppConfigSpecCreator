//views/snippet

define([
	"jquery", "underscore", "backbone", "helper/pubsub",
	"models/snippet", "text!templates/snippet.html", "views/modal/snippet", "views/default-value"

], function ($, _, Backbone, PubSub,
             SnippetModel, SnippetTemplate, SnippetModalView, DefaultValueView) {

	return Backbone.View.extend({

		tagName: "li", // this is default html tag given to a backbone view, we can override this by using this property

		//the type of view (snippet or group)
		type: "snippet",

		// now initialize acts as a constructor because we are extending a backbone class
		initialize: function () {
			this.template = _.template(SnippetTemplate);
			this.model.on("change", this.render, this);

			//set css class
			this.$el.addClass()
		},

		/**
		 * Renders this SnippetView
		 * @returns {exports}  returns this view for method chaining
		 */
		render: function () {
			this.$el.html(this.template(this.model.get("fields")));

			return this;
		}

		, events: {
			"click": "edit",
			"drop": "drop",
			"click .remove-snippet": "removeSnippet",
		},

		removeSnippet: function (e) {
			e.preventDefault();
			e.stopPropagation();
			this.model.trigger("removeFromCollection", this.model);
			PubSub.trigger("refreshFormView")
		}

		/**
		 * Open a snippet modal to edit the snippet clicked on from the form
		 * @param e  the mouse event
		 */
		, edit: function (e) {
			e.preventDefault();
			e.stopPropagation();
			new SnippetModalView({model: this.model});
		}

		, drop: function (e) {
			PubSub.trigger("drop", {"view": this, "e": e});
		}


		/**
		 * Get the position on the screen of this element
		 * @returns {*}  an object containing the `top` and `left` coordinates
		 */
		, getPosition: function () {
			return this.$el.offset();
		}

		/**
		 * returns the height of the DOM element rendered by this view
		 * @returns {*}
		 */
		, getHeight: function () {
			return this.$el.height();
		}

	});
});