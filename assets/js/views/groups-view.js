/**
 * Created by mike.mello on 1/3/17.
 */
define([
       "jquery", "underscore", "backbone"
       , "helper/pubsub", "text!templates/app/add-group-template.html", "text!templates/app/add-group-modal-template.html", "text!templates/app/groups-template.html", "text!templates/popover/popover-message.html"
], function(
  $, _, Backbone
  , PubSub, _addGroupTemplate, _addGroupModalTemplate, _groupsTemplate, _popoverMessageTemplate
){
  return Backbone.View.extend({
      tagName: "div",
      el     : "#addGroup",

      initialize: function()
      {
          PubSub.on("updateModal", this.render, this);
          this.addGroupTemplate = _.template(_addGroupTemplate);
          this.addGroupModalTemplate = _.template(_addGroupModalTemplate);
          this.groupsTemplate = _.template(_groupsTemplate);
          this.initialRender();
      },

      initialRender: function(locale) {
          //this.template(this.groupModel.getGroups());
          this.$el.append(this.addGroupTemplate);
          this.$el.append(this.addGroupModalTemplate);
      },

      render: function(groupsCollection){
          //console.log("templated groups: " + JSON.stringify(this.groupsTemplate(groupsCollection)));
          $("#groupsDiv").html(this.groupsTemplate(groupsCollection));
      },

      events:
      {
          "click #addGroup": "addGroup",
          "click .groupRemove": "removeGroup",
          "click .cancelModal": "resetModal"
      },

      addGroup: function(mouseEvent)
      {
          var groupName = $("#groupName").val();

          //clear the groupname field
          $("#groupName").val("");

          //Make sure the group name isn't empty
          if(groupName == "")
          {
              $("#groupName").focus()
              $("#groupName").popover({
                 template: _popoverMessageTemplate,
                 placement: "left"
              });
              $("#groupName").popover("show");
              return;
          }

          //this.model.addGroup( groupName );
          //this.render();
          PubSub.trigger("addGroup", groupName);

          this.resetModal();
      },

      removeGroup: function(e){
          var button = $(e.target);
          if(button.attr('id').includes("RemoveButtonSpan")){
              button = button.parent();
          }

          PubSub.trigger("removeGroup", button.attr('id'));
          //this.model.removeGroup(button.attr("id"));

          //this.render();
      },

      resetModal: function()
      {
          $("#groupName").parent().removeClass("error");
          $("#modalMessage").css('display', 'none');
          $("#groupName").popover("hide");
      }
  })
});
