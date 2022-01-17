/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://markdowneditor/MarkDownConverter.jsm");

var/*const*/ CHROME_URI = "chrome://markdowneditor";

/** 
 * Converter from text/x-web-markdown to text/html.
 */
function MD_StreamConverter(){
	// Load string bundles and preferences service
	var strBundleSrv = Components.classes["@mozilla.org/intl/stringbundle;1"].
        	getService(Components.interfaces.nsIStringBundleService),
        prefSrv = Components.classes["@mozilla.org/preferences-service;1"].
			getService(Components.interfaces.nsIPrefService);
	this.strbundle = strBundleSrv.createBundle(
			CHROME_URI + "/locale/md-mime-handler.properties"
	);
	this.prefs = prefSrv.getBranch("extensions.markdowneditor.");
}
MD_StreamConverter.prototype = {
	
	/**
	 * ID of the class.
	 * 
	 * @type Components.ID
	 */
	classID: Components.ID("{75a849c3-fcd6-478e-a3d7-c38c4f7671f1}"),
	
	/**
	 * Array with available document MIME types conversions.
	 * 
	 * @see http://codecraft.io/2011/07/18/ubuntu-markdown-files-mime-type-and-association/
	 * @todo Maybe include other types "?from=text/x-markdown&to=text/html" 
	 *       or "?from=text/vnd.daringfireball.markdown&to=text/html".
	 * @type Array
	 */
	conversions: ["?from=text/x-web-markdown&to=text/html"],
	
	/**
	 * Contract ID
	 * 
	 * @type String
	 */
	contractID: "@mozilla.org/streamconv;1",
	
	/**
	 * Name of component.
	 * 
	 * @type String
	 */
	name: "Handler for MarkDown documents",
	
	/**
	 * Holds string bundle service.
	 * 
	 * @type nsIStringBundleService
	 */
	strbundle: null,
	
	/**
	 * Holds data (CSV document contents).
	 * 
	 * @type String
	 */
	data: "",
	
	/**
	 * Holds original document's URI.
	 * 
	 * @type String
	 */ 
	uri: "",
	
	/**
	 * Holds handler's channel.
	 * 
	 * @type nsIChannel
	 */
	channel: null,
	
	/**
	 * Listener for converter.
	 * 
	 * @type Object 
	 */
	listener: null,
	
	/**
	 * Holds tab where MarkDown Editor is opened.
	 * 
	 * @type nsIDOMElement
	 */
	tab: null,
   
	/** 
	 * Implementation of nsIRequest::onStartRequest.
	 * 
	 * @param Object aRequest
	 * @param Object aContext
	 */
	onStartRequest: function(aRequest, aContext) 
	{
		// Initialize
		this.data = "";
		this.uri = aRequest.QueryInterface(Components.interfaces.nsIChannel).URI.spec;
		this.channel = aRequest;
		this.channel.contentType = "text/html";
		// Inform listener
		this.listener.onStartRequest(this.channel, aContext);
	}, // end onStartRequest(aRequest, aContext)
	
	/**
	 * Implementation of nsIRequest::onStopRequest.
	 * 
	 * @param nsIRequest aRequest
	 * @param Object aContext
	 * @param Object aStatus
	 */
	onStopRequest: function(aRequest, aContext, aStatus)
	{
		var html = "";
		// Get HTML
		try{
			var showdown = new Showdown.converter();
			html = showdown.makeHtml(this.data);
		}catch(e){
			Components.utils.reportError(e);
		}
		// Show HTML
		var conv = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
				createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		conv.charset = "UTF-8";
		var stream = conv.convertToInputStream(html);
		var len = stream.available();
		// Pass the data to the main content listener
		this.listener.onDataAvailable(this.channel, aContext, stream, 0, len);
		this.listener.onStopRequest(this.channel, aContext, aStatus);
		// If `showEditorAfterParse` is TRUE we need to finish editor loading.
		if(true === this.prefs.getBoolPref("showEditorAfterParse")){
			var uri = this.uri, 
				source = this.data;
			var event = {
				observe: function(subject, topic, data){
					var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].
							getService(Components.interfaces.nsIWindowMediator);
					var wmEnum = wm.getEnumerator("navigator:browser");
					while(wmEnum.hasMoreElements()){
						var tb = wmEnum.getNext();
						with(tb){
							MarkDownEditor_Global.openUri(uri, source);
						}
					}
				}
			};
			var timer = Components.classes["@mozilla.org/timer;1"].
					createInstance(Components.interfaces.nsITimer);
			timer.init(event, 23*3, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
		}
	}, // end onStopRequest(aRequest, aContext, aStatus) 
	
	/** 
	 * Implementation of nsIStreamListener::onDataAvailable.
	 * 
	 * @param nsIRequest aRequest
	 * @param Object aContext
	 * @param nsIStream aStream
	 * @param Object aOffset
	 * @param Object aStatus
	 */
	onDataAvailable: function(aRequest, aContext, aStream, aOffset, aCount) 
	{
		var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].
				createInstance();
		sis = sis.QueryInterface(Components.interfaces.nsIScriptableInputStream);
		sis.init(aStream);
		
		this.data += sis.read(aCount);
	}, // end onDataAvailable(aRequest, aContext, aStream, aOffset, aCount)
	
	/** 
	 * Implementation of nsIStreamListener::asyncConvertData.
	 * 
	 * @param Object aFromType
	 * @param Object aToType
	 * @param nsIStreamListener aListener
	 * @param Object aContext
	 */
	asyncConvertData: function(aFromType, aToType, aListener, aContext) 
	{
		this.listener = aListener;
	}, // end asyncConvertData(aFromType, aToType, aListener, aContext) 
	
	/** 
	 * Implementation of nsIStreamListener::onDataAvailable.
	 * 
	 * @param nsIStream aStream
	 * @param Object aFromType
	 * @param Object aToType
	 * @param Object aContext
	 */
	convert: function(aStream, aFromType, aToType, aContext) 
	{
		return aStream;
	}, // end convert(aStream, aFromType, aToType, aContext) 
	
	///////////////////////////////////////////////////////////////////////////
	//// nsISupports
	
	QueryInterface: XPCOMUtils.generateQI([
			Components.interfaces.nsIStreamConverter,
			Components.interfaces.nsIStreamListener,
			Components.interfaces.nsIRequestObserver
	])
	
}; // End of MD_StreamConverter

///////////////////////////////////////////////////////////////////////////
//// Module

let components = [MD_StreamConverter]
var NSGetFactory = XPCOMUtils.generateNSGetFactory(components);
