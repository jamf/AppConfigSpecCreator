//views/modal/bundle-version
define([
    "jquery", "underscore", "backbone", "bootstrap", "helper/pubsub",
    "text!templates/modal/bundle-version.html"
], function(
   $, _, Backbone, Bootstrap, PubSub,
   BundleVersionModal
){
    return Backbone.View.extend({

        template: _.template(BundleVersionModal),

        initialize: function()
        {
            this.render();

            $("#bundleVersionModal").modal("show");

            this.$el.on("shown.bs.modal", function () {
                $("#bundleId").focus();
            });
        }

        ,render: function()
        {
            this.$el.html(this.template(this.model.get("fields")));

            this.$el.appendTo("#modalsDiv");
        }

        ,events: {
            "click #bundleVersionSave" : "saveHandler",
            "click #bundleVersionCancel" : "cancelHandler",
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
            this.model.setFields(this.getBundleId(), this.getVersion());

            this.dismissModal();
        }

        ,cancelHandler: function()
        {
            this.dismissModal()
        }

        ,getBundleId: function()
        {
            return $("#bundleId").val();
        }

        ,getVersion: function()
        {
            return $("#versionNumber").val();
        }

        /**
         * Dismiss the modal
         */
        ,dismissModal: function()
        {
            $("#bundleVersionModal").modal('hide');


            this.$el.on("hidden.bs.modal", function(){
                PubSub.trigger("deleteView", this);
            });
        }
    });
});