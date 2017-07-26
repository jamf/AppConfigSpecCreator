//models/group
define([
		"jquery", "underscore", "backbone",
		"collections/snippets", "models/form-element",
		"text!templates/xml/start-group.xml",
		"text!templates/xml/end-group.xml",
		"models/localized-value"
	],
	function ($, _, Backbone,
	          SnippetsCollection, FormElementModel,
	          StartGroupTemplate,
	          EndGroupTemplate,
	          LocalizedValueModel) {
		return FormElementModel.extend({

			type: "group",
			startTemplate: _.template(StartGroupTemplate),
			endTemplate: _.template(EndGroupTemplate),

			// groups are identified only by their name. in order for things not to get too complicated,
			// the snippets that belong to them are linked via their english (en-US) name.
			initialize: function (name) {
				//Create a snippet collection for this
				this.collection = new SnippetsCollection();

				this.localizedName = new LocalizedValueModel(); // localized group name
				this.setName(name);
			}

			, setLocalesCollection: function (collection) {
				this.localesCollection = collection;
				return this;
			}

			, getLocalesCollection: function () {
				return this.localesCollection;
			}

			// save temporary localized name data
			, saveLocaleData: function (localeNameData) {
				this.localizedName = localeNameData;
				this.setName(localeNameData.getLocalizedValue("en-US"));
			}

			/**
			 * Set the name of the group
			 * @param name  the name to set
			 */
			, setName: function (name) { // set the identifying name of the group to the english (en-US) value
				this.localizedName.setLocalizedValue("en-US", name);
				this.set("name", this.localizedName.getLocalizedValue("en-US"));
			}

			, isGroup: function () {
				return true;
			}

			, add: function (snippet) {
				this.collection.add(snippet);
			}

			, insertAt: function (snippet, index) {
				this.collection.insertAt(snippet, index);
			}

			, getContents: function () {
				return this.get("name");
			}

			/**
			 * Renders the xml of this group
			 * @returns {string}  the xml representation of this group
			 */
			, renderXML: function () {
				var xml = "<group>\n"
				this.collection.each(function (snippet) {
					xml += snippet.renderXML();
				});
				xml += "</group>\n";
				return xml;
			}

			, renderDictXML: function () {
				var xml = "";
				this.collection.each(function (snippet) {
					xml += snippet.renderDictXML();
				});
				return xml;
			}

			, renderPresXML: function () {
				var xml = this.startTemplate({model: this});

				this.collection.each(function (snippet) {
					xml += snippet.renderPresXML();
				});

				xml += this.endTemplate();
				return xml;
			}
		});
	});