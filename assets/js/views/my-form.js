//views/my-form
define([
	"jquery", "underscore", "backbone", "helper/pubsub", "helper/data-types",
	"views/snippet", "views/group", "models/bundle-version", "views/bundle-version",
	"models/snippet", "models/group", "models/array-option",
	"text!templates/xml/end-dict.xml",
	"text!templates/xml/start-pres.xml",
	"text!templates/xml/end-pres.xml",
	"text!templates/xml/end-spec.xml",
	"models/localized-value",
	"models/constraint-value",
	"models/locale",
	"xmllint",
	"models/errors",
	"views/modal/errors",
	"text!templates/xml/appconfigschema.xsd",
	"jquery-ui"
], function ($, _, Backbone, PubSub, DataTypes,
             SnippetView, GroupView, BundleVersionModel, BundleVersionView,
             SnippetModel, GroupModel, ArrayOptionModel,
             EndDictTemplate,
             StartPresTemplate,
             EndPresTemplate,
             EndSpecTemplate,
             LocalizedValueModel,
             ConstraintValueModel,
             LocaleModel,
             xmllint,
             ErrorsModel,
             ErrorsModalView,
             AppConfigSchema){

	return Backbone.View.extend({

		tagName: 'ul',

		//the permanent model for the bundle id and version number
		bundleVersion: new BundleVersionModel(),

		initialize: function () {
			//This is a holder for the views we are rendering. This is used as a reference for dragging snippets around
			this.views = new Array();

			var that = this;

			PubSub.on("GroupAdd", function (group) {
				this.collection.add(group);
				this.render();
			}, this);
			PubSub.on("refreshFormView", this.render, this);
			PubSub.on("drag", this.drag, this);
			PubSub.on("drop", this.drop, this);

			$("#download").on("click", $.proxy(this.download, this));
			$("#importSpec").on("click", function (e) {
				if (!confirm("Importing will clear the current form. Continue?")) e.preventDefault();
			});

			$("#importSpec").change(function () {
				importFile(this);
			});
			function importFile(input) {
				if (input.files && input.files[0]) {
					var reader = new FileReader();
					reader.onload = function (e) {
						that.import(e.target.result);
					}
					reader.readAsText(input.files[0]);
				}
			}
		}

		, render: function () {
			this.fetch();
			var that = this;
			this.$el.empty();

			this.views = new Array();

			//render the bundle id and version number snippet first
			this.$el.append(new BundleVersionView({model: this.bundleVersion}).render().$el);

			this.collection.each(function (element) {
				if (element.isGroup()) {
					//if this element is a group
					var view = new GroupView({model: element}).render();
					that.$el.append(view.$el);
					that.views.push(view);
				}
				else {
					var view = new SnippetView({model: element}).render();
					that.$el.append(view.$el);
					that.views.push(view);
				}
			});


			$("#specForm").append(this.$el);

			$(function () {

				// sortable for groups and snippets not in groups
				$("#specForm > ul").sortable({
					containment: "parent",
					items: "> *",
					handle: ".glyphicon-menu-hamburger",
					cancel: ".unsortable",
					appendTo: document.body,
					update: function(event, ui) {
						ui.item.trigger('drop');
					}
				});
			});

			// sortable for snippets in groups
			$("#specForm > ul > ul").sortable({
				containment: "parent",
				items: "> li",
				handle: ".glyphicon-menu-hamburger",
				cancel: ".unsortable",
				appendTo: document.body,
				update: function(event, ui) {
					ui.item.trigger('drop');
				}
			});
		}

		, setLocalesCollection: function (locales) {
			this.localesCollection = locales;
			return this;
		}
		, getLocalesCollection: function () {
			return this.localesCollection;
		}

		/**
		 * Set the groups collection
		 * @param groups
		 * @returns {exports}
		 */
		, setGroupCollection: function (groups) {
			this.groupsCollection = groups;
			return this;
		}

		/**
		 * This function fetches any pending snippets from the buffer collection
		 * and adds them to the appropriate grouped collection
		 */
		, fetch: function () {
			//route any buffered snippets to their respective collections
			while (snippetQueue.length > 0) {
				//get the object
				var obj = snippetQueue.shift();

				//if we are a group
				if (obj.snippet.isGroup()) {
					this.collection.insertAt(obj.snippet, obj.index);
				}
				else {
					//If we're in our reserved `none` group, just add it to our base collection
					if (obj.snippet.get("fields").group == "-- none --") {
						this.collection.insertAt(obj.snippet, obj.index);
					}
					else {
						//else add it to the respective group collection
						this.collection.each(function (element) {

							//if the current element is a group
							if (element.isGroup()) {
								//if the group name matches the group of our snippet
								if (element.get("name") == obj.snippet.get("fields").group) {
									//add our snippet to the group
									element.insertAt(obj.snippet, obj.index);
								}
							}

						});
					}
				}
			}
		}


		/**
		 * Download the spec file for the current state of the form
		 */
		, download: function () {

			//start out with rendering the bundle id and version
			var xml = this.bundleVersion.renderXML();

			//render the dict xml from the snippets
			this.collection.each(function (element) {
				xml += element.renderDictXML();
			});

			xml += EndDictTemplate;

			xml += StartPresTemplate;

			//render the prex xml from the snippets
			this.collection.each(function (element) {
				xml += element.renderPresXML();
			});

			xml += EndPresTemplate;

			xml += EndSpecTemplate;


			var filename = "specfile.xml";
			var pom = document.createElement('a');
			var bb = new Blob([xml], {type: 'text/plain'});

			pom.setAttribute('href', window.URL.createObjectURL(bb));
			pom.setAttribute('download', filename);
			pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
			pom.draggable = true;
			pom.classList.add('dragout');

			let lint = xmllint.validateXML({
				xml: xml,
				schema: AppConfigSchema
			});

			var errors = lint.errors;
			if (errors != null && errors.length > 0) {
				console.log(lint);

				new ErrorsModalView({
					model: new ErrorsModel(errors, xml)
				});

			} else {
				var event = new MouseEvent('click');
				pom.dispatchEvent(event); // pom.click() does not work in all browsers
			}
		}

		/**
		 * Import a spec file
		 * @param e  the clickevent
		 */
		, import: function (xml) {
			//clear the form
			this.collection.reset();

			//reset the bundle id and version
			this.bundleVersion.setFields("com.mycompany.app", "1");

			//initialize the form from the xml
			this.initForm(xml);

			//render the finished imported form
			this.render();
		}

		, initForm: function (xml) {
			var that = this;

			xml = xml.replace(/^\s*/gm, ""); // remove indentations with spaces as it breaks importing
			xmlDoc = $.parseXML(xml.replace(/(\r\n|\n|\r|\t)/gm, "")),
				$xml = $(xmlDoc),
				$title = $xml.find('dict');
			specAsJSON = this.xmlToJson(xmlDoc);

			var dictSections = {};
			$.each(specAsJSON.managedAppConfiguration.dict, function (dataType) {
				if (this.constructor == Array) {
					$.each(this, function () {
						this.dataType = dataType;
						if(this.dataType != "#comment") { // don't accidentally try and import comments
							dictSections[this["@attributes"].keyName] = this;
						}
					});
				} else {
					// Preload dict sections in a dictionary indexed by keyName
					this.dataType = dataType;
					if(this.dataType != "#comment") { // don't accidentally try and import comments
						dictSections[this["@attributes"].keyName] = this;
					}
				}
			});

			// Import bundleId and version. This goes into bundleVersion model
			this.bundleVersion.setFields(specAsJSON.managedAppConfiguration.bundleId["#text"], specAsJSON.managedAppConfiguration.version["#text"]);

			//Groups
			if (specAsJSON.managedAppConfiguration.presentation.hasOwnProperty("fieldGroup")) {
				var groups = specAsJSON.managedAppConfiguration.presentation.fieldGroup;
				//If only one fieldGroup, it will be an object. Turn it into an array
				if (groups && groups.constructor !== Array) {
					var old = groups;
					groups = [];
					groups.push(old);
				}
				this.groupsCollection.setLocalesCollection(that.localesCollection);
				_.each(groups, function (group) {
					//Add our group

					// if there is only one language, it's an object but we want it to be an array.
					if (group.name.language.constructor !== Array) {
						var old = group.name.language;
						group.name.language = [];
						group.name.language.push(old);
					}

					var localizedGroupName = new LocalizedValueModel();

					// iterate through languages and set locale values
					_.each(group.name.language, function (lang) {
						var locale = lang["@attributes"].value;
						var value = lang["#text"];
						localizedGroupName.setLocalizedValue(locale, value);

						// import global locales
						var localeModel = new LocaleModel(locale);
						PubSub.trigger("LocaleAdd", localeModel);
					});

					// create group model using english (en-US) name value
					var groupModel = new GroupModel(localizedGroupName.getLocalizedValue("en-US"));
					groupModel.saveLocaleData(localizedGroupName);
					groupModel.setLocalesCollection(that.localesCollection);
					PubSub.trigger("GroupAdd", groupModel);

					//grab the fields
					var fields = {};
					fields.field = _.clone(group.field);

					//iterate over the snippets in the group
					jQuery.map(fields, function (obj) {
						//if we have more than one snippet in a group, we have to iterate over the array
						if (obj && obj.constructor !== Array) {
							var old = obj;
							obj = [];
							obj.push(old);
						}
						_.each(obj, function (snippet) {
							//configure and add the snippet
							that.configureSnippets(snippet, localizedGroupName.getLocalizedValue("en-US"), dictSections);
							// remove snippet from dictSections after import
							delete dictSections[snippet["@attributes"].keyName];
						});
					});
				});
			}

			// If only one field, fields will be an object, not an array as required. Turn it into an array
			var fields = specAsJSON.managedAppConfiguration.presentation.field;
			if (fields && fields.constructor !== Array) {
				var old = fields;
				fields = [];
				fields.push(old);
			}

			jQuery.map(fields, function (field) {
				that.configureSnippets(field, null, dictSections);
				// remove snippet from dictSections after import
				delete dictSections[field["@attributes"].keyName];
			});

			// import snippets that do not have presentation elements
			_.each(dictSections, function(dictElement) {
				// dictElement = single element from leftover dictSections used as field
				// reference in order to grab the key name in configureSnippets function
				that.configureSnippets(dictElement, null, dictSections)
			});
		}

		/**
		 * configure a snippet that is being read in from XML
		 * @param field  The field JSON object being parsed
		 * @param group  The group the field is a memeber of (nullable)
		 * @param dictSections  a reference to the dictionary section to get data types, default values, etc
		 */
		, configureSnippets: function (field, group, dictSections) {
			var that = this;

			var model = new SnippetModel()
				.setGroupsCollection(this.groupsCollection)
				.setLocalesCollection(this.localesCollection);


			var fields = model.get("fields");
			var dict = dictSections[field["@attributes"].keyName];
			var constraints = dict.constraint;

			//set the fields for the model from the xml
			if (typeof field["@attributes"].keyName !== 'undefined') {
				fields.name = field["@attributes"].keyName;
			}

			if (typeof field.label !== 'undefined') {

				// if there is only one language, it's an object but we want it to be an array.
				if (field.label.language.constructor !== Array) {
					var old = field.label.language;
					field.label.language = [];
					field.label.language.push(old);
				}

				// iterate through languages and set locale values
				_.each(field.label.language, function (lang) {
					var locale = lang["@attributes"].value;
					var value = lang["#text"];
					fields.label.setLocalizedValue(locale, value);

					// import global locales
					var localeModel = new LocaleModel(locale);
					PubSub.trigger("LocaleAdd", localeModel);
				});
			}

			if (group != null) {
				fields.group = group
			}

			if (typeof field.description !== 'undefined') {

				// if there is only one language, it's an object but we want it to be an array.
				if (field.description.language.constructor !== Array) {
					var old = field.description.language;
					field.description.language = [];
					field.description.language.push(old);
				}

				// iterate through languages and set locale values
				_.each(field.description.language, function (lang) {
					var locale = lang["@attributes"].value;
					var value = lang["#text"];
					fields.description.setLocalizedValue(locale, value);

					// import global locales
					var localeModel = new LocaleModel(locale);
					PubSub.trigger("LocaleAdd", localeModel);
				});
			}

			if (field["@attributes"].type == "hidden") {
				fields.hidden = true;
			}
			fields.dataType = _.findWhere(DataTypes, {key: dict.dataType}).label  // <-- This works because the "key" is set earlier in the initForm function

			//set the default value(s)
			if (typeof dict.defaultValue !== 'undefined') {
				//If we have an array data type
				if (fields.dataType.includes("Array")) {
					//put them into the collection
					$.each(dict.defaultValue, function (key) {
						//If the value element is not an array, turn it into an array for underscore iteration
						if (dict.defaultValue[key].constructor !== Array) {
							var old = dict.defaultValue[key];
							dict.defaultValue[key] = [];
							dict.defaultValue[key].push(old);
						}
						_.each(dict.defaultValue[key], function (value) {
							var m = new ArrayOptionModel();
							//If we have an emm variable, the value is an xml attribute
							if (key.includes("Variable")) {
								//only grab the prefix (user,device) from the variable key since its the key we use in our variables JSON object
								var variableKey = key.substring(0, key.indexOf("Variable"));
								//Grab the label from the specified variable as defined in our variables JSON object and set it as the model's value
								m.set({"value": _.findWhere(m.emmVariables[variableKey], {key: value["@attributes"].value}).label});
								//set the type of the model, NOTE: we only have to do that if it's a variable because it defaults to a Literal.
								m.type = _.findWhere(m.variableTypes, {key: key}).label;
							} else {
								//Just set the value
								m.set({value: value["#text"]});
							}
							//Set the model as fresh since we are automatically adding it to the collection
							m.fresh = false;
							//add the model to the collection
							fields.defaultValue.collection.add(m);
						});

						fields.defaultValue.collection.collectionType = "defaultValue";
					});
				} else {
					var key = "";
					if (dict.defaultValue.userVariable !== undefined) {
						key = "userVariable";
					} else if (dict.defaultValue.deviceVariable !== undefined) {
						key = "deviceVariable";
					}

					if (key.includes("Variable")) {
						//only grab the prefix (user,device) from the variable key since its the key we use in our variables JSON object
						var variableKey = key.substring(0, key.indexOf("Variable"));

						//Grab the label from the specified variable as defined in our variables JSON object and set it as the model's value
						let v = _.findWhere(fields.defaultValue.emmVariables[variableKey], {key: dict.defaultValue[key]["@attributes"].value});
						fields.defaultValue.set({"value": v.label});

						//set the type of the model, NOTE: we only have to do that if it's a variable because it defaults to a Literal.
						let t = _.findWhere(model.variableTypes, {key: key});
						// fields.defaultValue.type = t.label;
						fields.defaultValue.attributes.type = t.label;
					} else {
						//else assign the singular value
						fields.defaultValue.set({"value": dict.defaultValue.value["#text"]});
					}
				}
			}

			// array options
			if (typeof field.options !== 'undefined'
				&& typeof field.options.option !== 'undefined')
			{ // snippet has multiple options
				if (field.options.option instanceof Array) {
					_.each(field.options.option, function (option) {
						var m = new ArrayOptionModel();
						m.setLocalesCollection(that.getLocalesCollection())

						if (typeof(option["@attributes"]) !== "undefined") {
							m.set({"value": option["@attributes"].value});
						}

						// iterate through languages and set locale values
						if (option.language instanceof Array) { // options have multiple localizations
							_.each(option.language, function (lang) {
								var locale = lang["@attributes"].value;
								var value = lang["#text"];
								m.localizedLabel.setLocalizedValue(locale, value);

								// import global locales
								var localeModel = new LocaleModel(locale);
								PubSub.trigger("LocaleAdd", localeModel);
							});

						} else { // options have one localization value
							var lang = option.language;
							var locale = lang["@attributes"].value;
							var value = lang["#text"];
							m.localizedLabel.setLocalizedValue(locale, value);

							// import global locales
							var localeModel = new LocaleModel(locale);
							PubSub.trigger("LocaleAdd", localeModel);
						}

						m.fresh = false;
						fields.options.add(m);
					});
				} else { // snippet has one option
					var option = field.options.option;
					var m = new ArrayOptionModel();
					m.setLocalesCollection(that.getLocalesCollection())

					if (typeof(option["@attributes"]) !== "undefined") {
						m.set({"value": option["@attributes"].value});
					}

					// iterate through languages and set locale values
					if (option.language instanceof Array) { // option has multiple localizations
						_.each(option.language, function (lang) {
							var locale = lang["@attributes"].value;
							var value = lang["#text"];
							m.localizedLabel.setLocalizedValue(locale, value);

							// import global locales
							var localeModel = new LocaleModel(locale);
							PubSub.trigger("LocaleAdd", localeModel);
						});

					} else { // option has one localization value
						var lang = option.language;
						var locale = lang["@attributes"].value;
						var value = lang["#text"];
						m.localizedLabel.setLocalizedValue(locale, value);

						// import global locales
						var localeModel = new LocaleModel(locale);
						PubSub.trigger("LocaleAdd", localeModel);
					}

					m.fresh = false;
					fields.options.add(m);
				}

				fields.options.collectionType = "arrayElement"
			}

			//constraints
			if (typeof constraints !== 'undefined') {
				var constr = model.get("fields").constraints;
				console.log("constraints: " + JSON.stringify(constraints));

				try {
					var nullable = constraints["@attributes"].nullable;
					var min = constraints["@attributes"].min;
					var max = constraints["@attributes"].max;
					var pattern = constraints["@attributes"].pattern;

					if (typeof nullable !== 'undefined' && nullable == "true") {
						constr.setNullable(true);
						constr.setNullableSelected(true);
					}

					if (typeof min !== 'undefined') {
						constr.setMin(min);
						constr.setMinSelected(true);
					}

					if (typeof max !== 'undefined') {
						constr.setMax(max);
						constr.setMaxSelected(true);
					}

					if (typeof pattern !== 'undefined') {
						constr.setPattern(pattern);
						constr.setPatternSelected(true);
					}
				} catch(error) {
					// error when reading constraint attributes if none exist
					// console.error(error);
				}

				if (typeof constraints.values !== 'undefined'
					&& typeof constraints.values.value !== 'undefined')
				{
					var values = constraints.values.value;

					var valuesCollection = constr.getValuesCollection();
					for (var i = 0; i < values.length; i++) {
						var value = values[i]["#text"];
						var valueModel = new ConstraintValueModel();
						valueModel.set("value", value);
						valuesCollection.add(valueModel);
					}
					constr.setValuesCollection(valuesCollection);
				}

				//make sure we have the right data type
				constr.setDataType(model.get("fields").dataType);
			}

			model.setLocalesCollection(this.localesCollection);
			model.fresh = false;

			//queue up this model to be routed to its correct collection
			snippetQueue.push({snippet: model, index: -1});
		}


		, xmlToJson: function (xml) {
			// Create the return object
			var obj = {};

			if (xml.nodeType == 1) { // element
				// do attributes
				if (xml.attributes.length > 0) {
					obj["@attributes"] = {};
					for (var j = 0; j < xml.attributes.length; j++) {
						var attribute = xml.attributes.item(j);
						obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
					}
				}
			} else if (xml.nodeType == 3) { // text
				obj = xml.nodeValue;
			}

			// do children
			if (xml.hasChildNodes()) {
				for (var i = 0; i < xml.childNodes.length; i++) {
					var item = xml.childNodes.item(i);
					var nodeName = item.nodeName;
					if (typeof(obj[nodeName]) == "undefined") {
						obj[nodeName] = this.xmlToJson(item);
					} else {
						if (typeof(obj[nodeName].push) == "undefined") {
							var old = obj[nodeName];
							obj[nodeName] = [];
							obj[nodeName].push(old);
						}
						obj[nodeName].push(this.xmlToJson(item));
					}
				}
			}
			return obj;
		}


		/**
		 * called on drop events fired from snippet views
		 * @param e event object containing the view and the mouse event
		 */
		, drop: function (e) {
			var view = e.view;
			var e = e.e;

			//drop the model from the current collection
			view.model.trigger("removeFromCollection", view.model);

			//find the view collection to use to find the index. This should be the collection the model is in (i.e. groups)
			var views = this.views;
			if (view.type != "group") {
				if (view.model.get("fields").group != "-- none --") {

					_.each(this.views, function (v) {
						if (v.type == "group") {
							console.log("view name: " + v.model.get("name"))
							if (v.model.get("name") == view.model.get("fields").group) {
								//We have found our group view
								views = v.views;
							}
						}
					})
				}
			} else {
				//we are dragging a group
			}

			// find the position in the collection the moved view should now be in
			var index = 0;
			views.forEach(function (v) {
				if (v.getPosition().top < view.getPosition().top) {
					index++;
				}
			});

			snippetQueue.push({snippet: view.model, index: index});

			//refresh the form view
			PubSub.trigger("refreshFormView")
		}

	});
});