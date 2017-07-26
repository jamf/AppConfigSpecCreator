//views/modal/groups
define([
	"jquery", "underscore", "backbone", "bootstrap", "helper/pubsub",
	"text!templates/modal/locales.html", "views/modal/locale", "models/locale", "views/modal/locales-list-element"
], function(
	$, _, Backbone, Bootstrap, PubSub,
	LocaleModalTemplate, LocaleModalView, LocaleModel, LocaleView
){
	return Backbone.View.extend({

		template: _.template(LocaleModalTemplate),

		// locales modal for showing locales already in the form and to add/modify them
		initialize: function()
		{
			var that = this;
			this.render();

			$("#localesModal").modal("show");

			this.collection.on("all", function(){that.renderLocalesList()});

		}

		,render: function()
		{
			this.$el.html(this.template(this.model));


			this.$el.appendTo("#modalsDiv");
			this.renderLocalesList();
		}

		,renderLocalesList: function()
		{
			var that = this;
			var localesList = $("#locales");
			//empty out our DOM element so we dont keep our previous set of groups on the page
			localesList.empty();

			//append each group to our DOM element
			this.collection.each(function(locale){
				var view = new LocaleView({model: locale, collection: that.collection}).render();
				localesList.append(view.$el);
			});
		}

		,events: {
			"click #localesAdd" : "addGroup",
			"click #localesCancel": "cancelHandler"
		}

		,addGroup: function()
		{
			new LocaleModalView({model: new LocaleModel(), collection: this.collection});
		}

		,cancelHandler: function()
		{
			PubSub.trigger("refreshFormView");
			this.dismissModal();
		}

		/**
		 * Dismiss the modal
		 */
		,dismissModal: function()
		{
			$("#localesModal").modal('hide');


			this.$el.on("hidden.bs.modal", function(){
				PubSub.trigger("deleteView", this);
			});
		}
	})
})