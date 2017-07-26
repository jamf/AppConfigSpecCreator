//views/group
define([
    "jquery", "underscore", "backbone", "bootstrap", "helper/pubsub",
    "views/snippet", "text!templates/group.html"
], function(
    $, _, Backbone, Bootstrap, PubSub,
    SnippetView, GroupTemplate
){
    return Backbone.View.extend({

        template: _.template(GroupTemplate),

	      tagName: 'ul',

        //the type of view (snippet or group)
        type: "group",

        initialize: function()
        {
            this.views = [];
        }

        ,render: function()
        {
            var that = this;
            this.views = [];
            this.$el.empty();

            this.$el.html(this.template({model: this.model}));

            this.model.collection.each(function(snippet)
            {
                var view = new SnippetView({model: snippet}).render();
                that.$el.append(view.$el);
                that.views.push(view);
            });

            this.$el.addClass('group');

            return this;
        }

        ,events: {
			    "drop": "drop"
        }

        , drop: function(e)
        {
            PubSub.trigger("drop", {view: this, e: e});
        }

        /**
         * Get the position on the screen of this element
         * @returns {*}  an object containing the `top` and `left` coordinates
         */
        ,getPosition: function()
        {
            //return this.pos;
            return this.$el.offset();
        }

        /**
         * returns the height of the DOM element rendered by this view
         * @returns {*}
         */
        ,getHeight: function()
        {
            return this.$el.height();
        }

        ,printPositions: function()
        {
            this.views.forEach(function(view){
                console.log("snippet (" + view.model.get("fields").label + ") y: " + view.$el.offset().top);
            })
        }


    });
});