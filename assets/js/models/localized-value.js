//models/localized-value
define([
		"jquery", "underscore", "backbone"
	],
	function ($, _, Backbone) {
		return Backbone.Model.extend({

			type: "localized-value",

			// localized-value is an object which can store localized strings for certain properties
			initialize: function () {
				this.localizations = []; // stores the localized strings
				this.addLocalizedValue("en-US", ""); // initialize with blank english value
			}

			// set localized value for the given locale
			, setLocalizedValue: function (locale, value) {
				// if the localized value has already has been set, update it
				for (var i in this.localizations) {
					var item = this.localizations[i];
					if (item.locale == locale) {
						item.value = value;
						return true;
					}
				}

				// if the localized value hasn't been set before, it needs to be created first
				this.addLocalizedValue(locale, value);
				return this.getLocalizedValue(locale);
			}

			// get value stored for a given locale
			, getLocalizedValue: function (locale) {
				for (var i in this.localizations) {
					var item = this.localizations[i];
					if (item.locale == locale) {
						return item.value;
					}
				}

				// if locale does not exist return new blank one and try again
				this.addLocalizedValue(locale, "");
				return this.getLocalizedValue(locale);
			}

			// create new key-value pair in the localizations array for a new localized value
			, addLocalizedValue: function (locale, value) {
				var obj = {locale: "", value: ""};
				obj.locale = locale;
				obj.value = value;
				this.localizations.push(obj);
			}

			// delete a localized value in the localizations array
			, removeLocalizedValue: function (locale) {
				for (var i in this.localizations) {
					var item = this.localizations[i];
					if (item.locale == locale) {
						this.localizations.splice(item);
						return true;
					}
				}
				return false;
			}

		});
	});