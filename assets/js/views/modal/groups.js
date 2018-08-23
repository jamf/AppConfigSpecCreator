//views/modal/groups
define([
    "jquery", "underscore", "backbone", "bootstrap", "helper/pubsub",
    "text!templates/modal/groups.html", "views/modal/group", "models/group", "views/modal/groups-list-element"
], function(
    $, _, Backbone, Bootstrap, PubSub,
    GroupsModalTemplate, GroupModalView, GroupModel, GroupView
){
    return Backbone.View.extend({

        template: _.template(GroupsModalTemplate),

        initialize: function()
        {
            var that = this;
            this.render();

            $("#groupsModal").modal("show");

            this.collection.on("all", function(){that.renderGroupsList()});

        }

        ,render: function()
        {
            this.$el.html(this.template(this.model));


            this.$el.appendTo("#modalsDiv");
            this.renderGroupsList();
        }

        ,renderGroupsList: function()
        {
            var that = this;
            var groupsList = $("#groups");
            //empty out our DOM element so we dont keep our previous set of groups on the page
            groupsList.empty();

            var localesCollection = this.collection.localesCollection;
            //append each group to our DOM element
            this.collection.each(function(group){
               group.setLocalesCollection(localesCollection);
               var view = new GroupView({model: group, collection: that.collection}).render();
               groupsList.append(view.$el);
            });
        }

        ,events: {
            "click #groupsAdd" : "addGroup",
            "click #groupsCancel": "cancelHandler",
            "keydown": "keyAction"
        }

        , keyAction: function(e) {
            var code = e.keyCode || e.which;
            if (code == 27) {
              this.cancelHandler(e);
            }
        }

        ,addGroup: function()
        {
            console.log(this.collection.localesCollection);
            var newGroup = new GroupModel().setLocalesCollection(this.collection.localesCollection);
            new GroupModalView({model: newGroup, collection: this.collection});
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
            $("#groupsModal").modal('hide');


            this.$el.on("hidden.bs.modal", function(){
                PubSub.trigger("deleteView", this);
            });
        }
    })
})