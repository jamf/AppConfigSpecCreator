//models/group
define([
		"jquery", "underscore", "backbone",
		"collections/snippets", "models/form-element", "helper/locale-list"
	],
	function ($, _, Backbone, SnippetsCollection, FormElementModel, LocaleList) {
		return FormElementModel.extend({

			type: "locale",

			// locale model is one locale code to be added to the collection for use in the form
			initialize: function (name) {
				this.setName(name); // name = locale code
				this.set("localeList", LocaleList.locales);
			}

			, setName: function (name) {
				this.set("name", name);
			}

			, isGroup: function () {
				return false
			}

			, getContents: function () {
				return this.get("name");
			}

			, setLocalesCollection: function (collection) {
				this.localesCollection = collection;
				return this;
			}

			, getLocalesCollection: function () {
				return this.localesCollection;
			}

		});
	});