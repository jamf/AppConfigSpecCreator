//views/modal/group
define([
	"jquery", "underscore", "backbone", "bootstrap", "helper/pubsub",
	"text!templates/modal/locale.html", "datalist-polyfill"
], function(
	$, _, Backbone, Bootstrap, PubSub,
	LocaleModalTemplate
){
	return Backbone.View.extend({

		template: _.template(LocaleModalTemplate),

		// locale modal for adding a new locale to the form
		initialize: function()
		{
			this.render();

			$("#localeModal").modal("show");

			this.$el.on("shown.bs.modal", function () {
				$("#localeName").focus();
			});
		}

		,render: function()
		{
			this.$el.html(this.template({model: this.model}));

			this.$el.appendTo("#modalsDiv");
		}

		,events: {
			"click #localeSave" : "saveHandler",
			"click #localeCancel" : "cancelHandler",
			"keydown": "keyAction"
		}

		, keyAction: function(e) {
			var code = e.keyCode || e.which;
			if (code == 27) {
				this.cancelHandler(e);
			} else if (code == 13) {
				this.saveHandler(e);
			}
		}


		,saveHandler: function()
		{
			this.model.setName($("#localeName").val());

			//add this group to the form
			PubSub.trigger("LocaleAdd", this.model);

			this.dismissModal();
		}

		,cancelHandler: function()
		{
			this.dismissModal();
		}


		/**
		 * Dismiss the modal
		 */
		,dismissModal: function()
		{
			$("#localeModal").modal('hide');


			this.$el.on("hidden.bs.modal", function(){
				PubSub.trigger("deleteView", this);
			});
		}
	});
});