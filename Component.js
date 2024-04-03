sap.ui.define([
	"sap/ui/core/Component",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/ActionSheet"
], function (Component, Button, Bar, MessageToast, MessageBox, ActionSheet) {

	return Component.extend("tag.flp.switchlanguage.Component", {

		metadata: {
			"manifest": "json"
		},

		init: function () {
			var rendererPromise = this._getRenderer();
			this._oResourceBundle = this.getModel("i18n").getResourceBundle();
			/**
			 * Add item to the header
			 */
			rendererPromise.then((oRenderer) => {
				oRenderer.addHeaderEndItem("", {
					id: "switchLanguage",
					icon: "sap-icon://world",
					tooltip: this._oResourceBundle.getText("switchLanguage"),
					press: (oEvent) => {
						var oButton = oEvent.getSource();
						if (!this._oMenu) {
							this._oMenu = this._createMenu();
						}
						this._oMenu.openBy(oButton);
					}
				}, true, false);
			});

		},

		_createMenu: function () {
			var oMenu = new ActionSheet({
				showCancelButton: false,
				buttons: [
					new Button({
						id: "btnEN",
						text: "English",
						press: (oEvent) => this._changeLanguage(oEvent)
					}),
					new Button({
						id: "btnFR",
						text: "Français",
						press: (oEvent) => this._changeLanguage(oEvent)
					})
				]
			});
			return oMenu;
		},

		_changeLanguage: function (oAction) {
			var sBtnId = oAction.oSource.sId;
			var sNewLanguage = sBtnId.replace("btn", "");
			if (window.location.hash !== "#Shell-home") {
				MessageBox.show(this._oResourceBundle.getText("confirmationText"), {
					icon: MessageBox.Icon.QUESTION,
					title: this._oResourceBundle.getText("switchLanguage"),
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					onClose: function (sButton) {
						if (sButton === MessageBox.Action.OK) {
							window.location.hash = "#Shell-home";
							window.location.search = "?sap-language=" + sNewLanguage;
						}
					}
				});
			} else {
				window.location.hash = "#Shell-home";
				window.location.search = "?sap-language=" + sNewLanguage;
			}
		},

		/**
		 * Returns the shell renderer instance in a reliable way,
		 * i.e. independent from the initialization time of the plug-in.
		 * This means that the current renderer is returned immediately, if it
		 * is already created (plug-in is loaded after renderer creation) or it
		 * listens to the &quot;rendererCreated&quot; event (plug-in is loaded
		 * before the renderer is created).
		 *
		 *  @returns {object}
		 *      a jQuery promise, resolved with the renderer instance, or
		 *      rejected with an error message.
		 */
		_getRenderer: function () {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oRenderer;

			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
			if (!that._oShellContainer) {
				oDeferred.reject(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					that._onRendererCreated = function (oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		}
	});
});