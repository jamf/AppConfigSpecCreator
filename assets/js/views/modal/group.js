//views/modal/group
define([
	"jquery", "underscore", "backbone", "bootstrap", "helper/pubsub",
	"text!templates/modal/group.html"
], function ($, _, Backbone, Bootstrap, PubSub,
             GroupModalTemplate) {
	return Backbone.View.extend({

		template: _.template(GroupModalTemplate),

		initialize: function () {
			this.render();

			// localized group name temp data
			this.localeTemp = {selection: "en-US", name: this.model.localizedName};

			$("#groupModal").modal("show");

		}

		, render: function () {
			this.$el.html(this.template({model: this.model}));

			this.$el.appendTo("#modalsDiv");
		}

		, events: {
			"click #groupSave": "saveHandler",
			"click #groupCancel": "cancelHandler",
			"change #fieldLocale": "localeSelectionChanged"
		}

		// when locale dropdown changes, show localized value according to selection in the form field
		, localeSelectionChanged: function () {
			var prevLocale = this.localeTemp.selection;
			var newLocale = $("#fieldLocale").val();
			this.localeTemp.selection = newLocale;

			this.localeTemp.name.setLocalizedValue(prevLocale, $("#groupName").val());
			$("#groupName").val(this.localeTemp.name.getLocalizedValue(newLocale));
		}


		, saveHandler: function () {
			// cache current locale values
			var currentLocale = $("#fieldLocale").val();
			this.localeTemp.name.setLocalizedValue(currentLocale, $("#groupName").val());
			console.log(this.localeTemp);

			// flush temp locale changes
			this.model.saveLocaleData(this.localeTemp.name);

			//add this group to the form
			PubSub.trigger("GroupAdd", this.model);

			this.dismissModal();
		}

		, cancelHandler: function () {
			this.dismissModal();
		}

		/**
		 * Dismiss the modal
		 */
		, dismissModal: function () {
			$("#groupModal").modal('hide');


			this.$el.on("hidden.bs.modal", function () {
				PubSub.trigger("deleteView", this);
			});
		}
	});
});