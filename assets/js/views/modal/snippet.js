//views/modal/snippet
define([
	"jquery", "underscore", "backbone", "bootstrap", "helper/pubsub", "helper/variable-types",
	"text!templates/modal/snippet.html", "models/snippet",
	"views/modal/array-option", "views/array-option", "models/array-option", "text!templates/array-option.html",
	"views/default-value", "views/array-options", "models/localized-value", "models/localized-value"

], function ($, _, Backbone, Bootstrap, PubSub, VariableTypes,
             SnippetModal, SnippetModel,
             ArrayOptionModalView, ArrayOptionView, ArrayOptionModel, ArrayOption,
             DefaultValueView, ArrayOptionsView, LocalizedValueModel) {
	return Backbone.View.extend({

		mainTemplate: _.template(SnippetModal),


		initialize: function () {
			this.defaultValueView = new DefaultValueView({model: this.model.get("fields").defaultValue}).linkView(this);
			this.arrayOptionsView = new ArrayOptionsView({collection: this.model.get("fields").options});
			this.render();

			//this prevents the modal from being exited from clicking the background or hitting the escape key
			$("#snippetModal").modal({
				backdrop: "static",
				keyboard: false
			});
			//Show the modal
			$("#snippetModal").modal("show");

			// the form needs to render before focus() has an effect
			this.$el.on("shown.bs.modal", function () {
				$("#fieldKeyName").focus();
			});

			PubSub.on("snippetModal:Update", this.renderSubsets, this);
			PubSub.on("snippetModal:EditArrayOption", this.showArrayOptionModal, this);

			// setup temp data for modal locale shenanigans
			var fields = this.model.get("fields");
			this.localeTemp = {selection: "en-US", label: fields.label, description: fields.description};
		}

		// when locale dropdown changes,
		// show localized values according to selection in the form fields and cache changes to current values
		, localeSelectionChanged: function () {
			var prevLocale = this.localeTemp.selection;
			var newLocale = $("#fieldLocale").val();
			this.localeTemp.selection = newLocale;

			// LABEL
			this.localeTemp.label.setLocalizedValue(prevLocale, $("#fieldLabel").val());
			$("#fieldLabel").val(this.localeTemp.label.getLocalizedValue(newLocale));

			// DESCRIPTION
			this.localeTemp.description.setLocalizedValue(prevLocale, $("#fieldDescription").val());
			$("#fieldDescription").val(this.localeTemp.description.getLocalizedValue(newLocale));
		}

		/**
		 * Render the entire modal
		 */
		, render: function () {
			this.$el.html(this.mainTemplate({model: this.model, locales: this.locales}));
			this.$el.appendTo("#modalsDiv");


			//set the selected default value type
			this.setDefaultValueType(this.model.get("fields").defaultValue.get("type"))
			//set the group
			this.setGroup(this.model.get("fields").group);
			//set the array type
			this.setArrayType(this.model.get("fields").arrayType);

			//render the subsets
			this.renderSubsets();
		}

		/**
		 * Just render the modal array options
		 */
		, renderArrayOptions: function () {
			this.$el.find("#fieldArrayOptions").empty();
			this.$el.find("#fieldArrayOptions").append(this.arrayOptionsView.render().$el);
		}

		/**
		 * Just render the default values portion
		 */
		, renderDefaultValue: function () {
			this.$el.find("#fieldDefaultValueAnchor").empty();
			this.$el.find("#fieldDefaultValueAnchor").append(this.defaultValueView.render().$el);
		}

		/**
		 * Just render the constraints
		 */
		, renderConstraints: function () {
			this.$el.find("#fieldConstraints").empty();

			//We have to call `render()` twice here because the first one returns the ConstraintView and the second actually renders the view
			this.$el.find("#fieldConstraints").append(this.model.get("fields").constraints.render().render().$el);
		}

		/**
		 * Render all the subsets of this view. i.e. the array options, and the default value
		 */
		, renderSubsets: function () {
			this.renderArrayOptions();
			this.renderDefaultValue();
			this.renderConstraints();
		}


		/**
		 * updates the content of the modal
		 */
		, update: function () {
			this.$el.html(this.template(this.model));
		}

		, events: {
			"change #fieldDataType": "dataTypeChange",
			"change #fieldDefaultValueTypeDiv": "defaultValueTypeChange",
			"click #fieldSave": "saveHandler",
			"click #fieldCancel": "cancelHandler",
			"click #fieldArrayOptionsAdd": "arrayOptionModalCallback",
			"click #fieldDefaultValueAdd": "arrayOptionModalCallback",
			"change #fieldLocale": "localeSelectionChanged"
		}

		/**
		 * Save the fields from the modal
		 * @param e  The mouse event from the dom
		 */
		, saveHandler: function (e) {
			//prevent the default functionality because we want to specify our own
			e.preventDefault();

			//grab the current fields from the model
			var fields = this.model.get("fields");

			//save the changes from the modal
			fields.name = $("#fieldKeyName").val();

			// cache current locale values
			var currentLocale = $("#fieldLocale").val();
			this.localeTemp.label.setLocalizedValue(currentLocale, $("#fieldLabel").val());
			this.localeTemp.description.setLocalizedValue(currentLocale, $("#fieldDescription").val());
			console.log(this.localeTemp);

			// flush temp locale changes
			fields.label = this.localeTemp.label;
			fields.description = this.localeTemp.description;

			fields.dataType = this.getDataType();
			fields.defaultValue.set({"value": this.getDefaultValue()});
			fields.defaultValue.set({"type": this.getDefaultValueType()});
			fields.arrayType = this.getArrayType();

			//see if we have to requeue this snippet because we are switching groups
			var groupSwitched = fields.group != this.getGroup();
			fields.group = this.getGroup();

			//NOTE: We do not need to save the options array here. They are already saved to the model when saved from the ArrayOptionModalView

			//if the snippet is fresh, add it to the snippet queue
			if (this.model.fresh) {
				this.model.fresh = false;
				//PubSub.trigger("addSnippet", this.model);
				snippetQueue.push({snippet: this.model, index: -1});
			}
			else if (groupSwitched) {

				//remove the model from the old collection
				this.model.trigger("removeFromCollection", this.model);

				//buffer the clone as the new model
				snippetQueue.push({snippet: this.model, index: -1});
			}

			PubSub.trigger("refreshFormView");

			console.log(fields);

			this.dismissModal();
		}

		/**
		 * Cancel handler
		 * @param e  The mouse event
		 */
		, cancelHandler: function (e) {
			e.preventDefault();

			PubSub.trigger("refreshFormView");

			this.dismissModal();
		}



		/**
		 * This function handles when the data type changes. This will show the array type options if an array type is selected
		 * and will hide those options if a singular type is selected
		 */
		, dataTypeChange: function () {
			var dataType = this.getDataType();

			//Show the selector for the default value type if we have a String data type (for emm variable selection)
			if (dataType == "String") {
				$("#fieldDefaultValueTypeDiv").prop("hidden", false);
			}
			else {
				$("#fieldDefaultValueTypeDiv").prop("hidden", true);
			}

			// show array
			if (dataType.includes("Array")) {
				$("#fieldArrayTypeDiv").prop("hidden", false);
				$("#fieldArrayOptionsDiv").prop("hidden", false);
			}
			else {
				$("#fieldArrayTypeDiv").prop("hidden", true);
				$("#fieldArrayOptionsDiv").prop("hidden", true);
			}

			//update the default value
			this.model.get("fields").defaultValue.changeDataType(dataType);

			//update all array options with the new data type
			this.model.get("fields").options.each(function (option) {
				option.setDataType(dataType);
			});

			//update the constraints
			this.model.get("fields").constraints.setDataType(dataType);

			// Re-render the subsets
			this.renderSubsets();

			//we have to manually reset the defaultValueType
			this.setDefaultValueType(this.model.get("fields").defaultValue.get("type"));
		}


		/**
		 * called when the default value type select box changes selected values
		 * @param e  the mouse event from the DOM
		 */
		, defaultValueTypeChange: function (e) {
			//e.preventDefault();
			var type = this.getDefaultValueType();
			//First clear the value
			this.model.get("fields").defaultValue.value = null;
			//Set the new type
			this.model.get("fields").defaultValue.set({"type": type});
		}


		/**
		 * Open the array option modal. This will show a modal prompting the type, and value of an element to be included in the array
		 * @param e  The mouse event
		 */
		, arrayOptionModalCallback: function (e) {
			e.preventDefault();

			//This is grabbed from the data-array attribute on the button tags
			// defined in templates/modal/snippet and templates/modal/default-value
			var target = $(e.currentTarget).data('array');

			//this is the target array to be passed to the array options view. Defaulted to the main `options` array in the snippet model
			var collection = this.model.get("fields").options;

			//If we clicked on the "add" button for the default value, change the target to the default value array instead
			if (target == "defaultValue") collection = this.model.get("fields").defaultValue.collection;

			//create a new array modal view with the model being a new array element
			// model based on the currently selected data type
			var model = new ArrayOptionModel(this.getDataType())
			this.showArrayOptionModal(model, collection);
		}

		/**
		 * Set the context of the array modal.
		 * @param model  the model the modal should use
		 */
		, showArrayOptionModal: function (model, collection) {
			new ArrayOptionModalView({model: model}).linkParentView(this).setTargetCollection(collection).render();
		}

		/**
		 * helper functions
		 */

		/**
		 * Gets the data type
		 * @returns {*|jQuery}
		 */
		, getDataType: function () {
			return $("#fieldDataType").find(":selected").val();
		}

		, setDataType: function (dataType) {
			$("#fieldDataType").val(dataType);
			this.dataTypeChange();
		}

		, getDefaultValueType: function () {
			return $("#fieldDefaultValueType").find(":selected").val();
		}

		, setDefaultValueType: function (type) {
			$("#fieldDefaultValueType").val(type);
			this.defaultValueTypeChange()
		}


		, getDefaultValue: function () {
			var element = $("#fieldDefaultValue");
			var returnValue;
			var dataType = this.getDataType();

			if (dataType == "Boolean") {
				returnValue = $("#fieldDefaultValue").is(":checked");
			}
			else {
				returnValue = element.val();
			}
			return returnValue;
		}

		, getGroup: function () {
			return $("#fieldGroup").find(":selected").val();
		}

		, setGroup: function (group) {
			$("#fieldGroup").val(group);
		}

		, getArrayType: function () {
			return $("#fieldArrayType").find(":selected").val();
		}

		, setArrayType: function (type) {
			$("#fieldArrayType").val(type);
		}


		/**
		 * Dismiss the modal
		 */
		, dismissModal: function () {
			$("#snippetModal").modal('hide');

			this.$el.on("hidden.bs.modal", function () {
				PubSub.trigger("deleteView", this);
			});
		}
	});
});