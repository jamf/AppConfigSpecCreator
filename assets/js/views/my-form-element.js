//views/my-form-element
define([
    "jquery", "underscore", "backbone", "bootstrap"
], function(
   $, _, Backbone, Bootstrap
){
    return Backbone.View.extend({

        /**
         * constructor that takes a Backbone view. This will either be a SnippetView or GroupView
         * @param view
         */
        initialize: function(view)
        {
            this.view = view;
        }

        ,render: function()
        {

        }
    });
});