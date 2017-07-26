//views/bundle-version
define([
    "jquery", "underscore", "backbone", "bootstrap",
    "text!templates/bundle-version.html", "views/modal/bundle-version"
], function(
    $, _, Backbone, Bootstrap,
    BundleVersionTemplate, BundleVersionModal
){
   return Backbone.View.extend({

       template: _.template(BundleVersionTemplate),

       initialize: function()
       {
            this.model.on("change", this.render, this);
	          this.$el.addClass("unsortable");
       }

       ,render: function()
       {
            this.$el.empty();
            this.$el.html(this.template(this.model.get("fields")));
            this.$el.append("<br><br><br>")

            return this;
       }

       ,events: {
           "click" : "edit"
       }

       ,edit: function()
       {
           new BundleVersionModal({model: this.model});
       }
   });
});