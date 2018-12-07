//views/modal/errors
define([
	"jquery", "underscore", "backbone", "bootstrap", "helper/pubsub",
	"text!templates/modal/errors.html"
], function ($, _, Backbone, Bootstrap, PubSub, ErrorsModalTemplate) {
	return Backbone.View.extend({

		template: _.template(ErrorsModalTemplate),

		initialize: function () {
			this.render();
			$("#errorsModal").modal("show");
		}

		, render: function () {
			this.$el.html(this.template({model: this.model}));
			this.$el.appendTo("#modalsDiv");
		}

		, events: {
			"click #errorsDownload": "saveHandler",
			"click #errorsClose": "cancelHandler",
		}

		, saveHandler: function () {
			var filename = "specfile.xml";
			var pom = document.createElement('a');
			var bb = new Blob([this.model.xml], {type: 'text/plain'});

			pom.setAttribute('href', window.URL.createObjectURL(bb));
			pom.setAttribute('download', filename);
			pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
			pom.draggable = true;
			pom.classList.add('dragout');

			var event = new MouseEvent('click');
			pom.dispatchEvent(event);

			this.dismissModal();
		}

		, cancelHandler: function () {
			this.dismissModal();
		}

		, dismissModal: function () {
			$("#errorsModal").modal('hide');

			this.$el.on("hidden.bs.modal", function () {
				PubSub.trigger("deleteView", this);
			});
		}
	});
});