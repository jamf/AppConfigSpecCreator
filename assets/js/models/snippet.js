//models/snippet

define([
	"jquery", "underscore", "backbone", "helper/pubsub",
	"helper/data-types", "helper/array-types", "helper/variable-types",
	"models/form-element", "views/snippet", "models/default-value", "models/constraint",
	"collections/array-options",
	"text!templates/xml/dict-snippet.xml",
	"text!templates/xml/pres-snippet.xml",
	"models/localized-value"
], function ($, _, Backbone, PubSub, DataTypes, ArrayTypes, VariableTypes,
             FormElementModel, SnippetView, DefaultValueModel, ConstraintsModel,
             ArrayOptionsCollection, DictXMLTemplate, PresXMLTemplate, LocalizedValueModel) {
	return FormElementModel.extend({

		type: "snippet",
		dictTemplate: _.template(DictXMLTemplate),
		presTemplate: _.template(PresXMLTemplate),

		initialize: function () {
			this.dataTypes = DataTypes;
			this.arrayTypes = ArrayTypes;
			this.variableTypes = VariableTypes;

			//This variable is used to track if this model is just being added for the first time
			this.fresh = true;

			var fields = {
				name: "",
				label: new LocalizedValueModel(),
				dataType: "Integer", // <- the default dataType will be a plain Integer
				defaultValue: new DefaultValueModel(this),  // <- create the default value model for this snippet
				arrayType: "Select",
				description: new LocalizedValueModel(),
				options: new ArrayOptionsCollection(),  //<- the collection of array options
				group: "-- none --",  // <- the default group will be the reserved `-- none --` group
				constraints: new ConstraintsModel("Integer")
			};

			this.set("fields", fields);
			PubSub.on("RemoveGroup", this.removeGroup, this);

			PubSub.on("LocaleAdd", this.add, this);
		}

		, setLocalesCollection: function (collection) {
			this.localesCollection = collection;
			return this;
		}

		, getLocalesCollection: function () {
			return this.localesCollection;
		}

		, setGroupsCollection: function (collection) {
			this.groupsCollection = collection;
			return this;
		}

		, getGroupsCollection: function () {
			return this.groupsCollection;
		}

		, removeGroup: function (groupName) {
			if (this.get("fields").group == groupName) {
				this.get("fields").group = "-- none --";
			}
		}

		, getContents: function () {
			return this.get("fields");
		}

		/**
		 * renders the Presentation portion of this snippets XML representation
		 * @returns {*}  returns the XML as a string
		 */
		, renderPresXML: function () {
			return this.presTemplate({model: this});
		}

		/**
		 * renders the Dictionary portion of this snippets XML representation
		 * @returns {*}  returns the XML as a string
		 */
		, renderDictXML: function () {
			return this.dictTemplate({model: this});
		}

		/**
		 * determins the appropriate `type` attribute for the presentation `field` tag
		 * @returns {String} returns the string `type` attribute
		 */
		, getPresType: function () {
			var that = this;
			var dataType = this.get("fields").dataType;
			return dataType.includes("Array") ? _.findWhere(that.arrayTypes, {label: that.get("fields").arrayType}).key : dataType == "Date" ? "datetime" : dataType == "Boolean" ? "checkbox" : "input";
		}
	});
});