/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

/**
 * Open MarkDownEditor.
 * @param aArgument An argument to pass to the window (may be null)
 */
function openWindow(aArgument){
	Services.ww.openWindow(
			null, 
			"chrome://markdowneditor/content/markdowneditor.xul", 
			"_blank", 
			"chrome,menubar,toolbar,status,resizable,dialog=no", 
			aArgument
	);
}
 
/** 
 * Command line handler for MarkDown Editor.
 */
function CommandLineHandler(){};
CommandLineHandler.prototype = {
	classDescription: "MarkDownEditorHandler",
	classID: Components.ID("{b7dad35f-a68c-4c35-96ef-842da208a123}"),
	contractID: "@mozilla.org/commandlinehandler/general-startup;1?type=markdowneditor",
	
	_xpcom_categories: [{
		category: "command-line-handler",
		entry: "m-markdowneditor"
	}],
	
	QueryInterface: XPCOMUtils.generateQI([
		Components.interfaces.nsICommandLineHandler
	]),
	
	// Implementation of nsICommandLineHandler
	handle: function clh_handle(aCmdLine){
		try {
			var uristr = aCmdLine.handleFlagWithParam("markdownfile", false);
			if(uristr){
				var uri = aCmdLine.resolveURI(uristr);
				openWindow(uri);
				aCmdLine.preventDefault = true;
			}
		}catch(e){
			Components.utils.reportError(
				"Incorrect parameter passed to -markdownfile on the command line."
			);
		}
		if(aCmdLine.handleFlag("markdowneditor", false)){
			openWindow(null);
			aCmdLine.preventDefault = true;
		}
	},
	
	helpInfo: "  -markdowneditor      Open MarkDown Editor\n" + 
	          "  -markdownfile <file> Open MarkDown Editor with given file.\n"
};
 
var NSGetFactory = XPCOMUtils.generateNSGetFactory([CommandLineHandler]);
	