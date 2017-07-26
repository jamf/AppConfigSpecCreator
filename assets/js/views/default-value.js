//views/default-value
define([
    "jquery", "underscore", "backbone", "bootstrap",
    "text!templates/modal/default-value.html", "views/array-options"
], function(
    $, _, Backbone, Bootstrap,
    DefaultValueTemplate, ArrayOptionsView
){
   return Backbone.View.extend({


       template: _.template(DefaultValueTemplate)

       ,initialize: function()
       {
            this.model.on("change", this.render, this);


            this.arrayView = new ArrayOptionsView({collection: this.model.collection});
       }

       /**
        * Render the default value view. This also checks if the data type is of an array type to also render the collection of options
        * @returns {exports}  return this view for method chaining
        */
       ,render: function()
       {
           this.$el.empty();

           this.$el.html(this.template({view: this}))

           var dataType = this.linkedView.getDataType();
           if(typeof dataType !== "undefined" && dataType.includes("Array"))
           {
               console.log("rendering array view: " + JSON.stringify(this.arrayView.collection));
               this.$el.find("#defaultValue").append(this.arrayView.render().$el);
           }

           return this;
       }

       /**
        * Link a view to this view
        * @param view  the Backbone view to link
        * @returns {exports}  return `this` for method chaining
        */
       ,linkView: function(view)
       {
           this.linkedView = view;

           return this;
       }
   });
});