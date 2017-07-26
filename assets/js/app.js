var snippetQueue = new Array();

define([
	"jquery", "underscore", "backbone",
	"helper/utility",
	"views/my-form", "collections/snippets", "views/modal/snippet", "models/snippet",
	"views/modal/groups", "collections/groups", "collections/form-elements",
	"views/modal/locales", "collections/locales"
], function ($, _, Backbone, Utility,
             MyFormView, SnippetsCollection, SnippetModalView, SnippetModel,
             GroupsModalView, GroupsCollection, FormElementsCollection, LocalesModalView, LocalesCollection) {
	return {
		// initialize is called implicitly through backbone but not through require as we are not extending a backbone class
		initialize: function () {

			// this calls Utility's 'initialize' function
			new Utility();

			// Groups collection
			var groupsCollection = new GroupsCollection();
			// Locales collection
			var localesCollection = new LocalesCollection();

			var formView = new MyFormView({collection: new FormElementsCollection()});
			formView.setGroupCollection(groupsCollection);
			formView.setLocalesCollection(localesCollection);
			formView.render();

			//when we click the "add field" button. create a new modal view with new model
			$("#addFieldButton").on("click", function () {
				new SnippetModalView({model: (new SnippetModel().setGroupsCollection(groupsCollection)).setLocalesCollection(localesCollection)}); // model is a field owned by Backbone.view
			});

			//when we click the "groups" button, show the groups view
			$("#groupsButton").on("click", function () {
				groupsCollection.setLocalesCollection(localesCollection);
				new GroupsModalView({collection: groupsCollection});
			});

			// when we click the "Localization" button. show the locales view
			$("#localeButton").on("click", function () {
				new LocalesModalView({collection: localesCollection});
			});
		}

	}
});
