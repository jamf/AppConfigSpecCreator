//collections/groups
define([
	"jquery", "underscore", "backbone", "helper/pubsub", "models/locale"
], function($, _, Backbone, PubSub, LocaleModel){
	return Backbone.Collection.extend({

		model: LocaleModel,

		// locale collection stores all the locales to use in the current state of the form
		initialize: function() {
			PubSub.on("LocaleAdd", this.addLocale, this);
		}

		, addLocale: function(locale) { // only add locale if it doesn't exist
			var names = this.pluck("name");
			if(!_.contains(names, locale.attributes.name) && locale.attributes.name != "en-US"){
				this.add(locale);
			} else {
				// console.error("locale already exists")
			}
		}

	});
});