/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

var EXPORTED_SYMBOLS = [
		"MarkDownEditor_RecentFiles"
];

var prefSrv = Components.classes["@mozilla.org/preferences-service;1"].
	getService(Components.interfaces.nsIPrefService).
	getBranch("extensions.markdowneditor.");

// Test preferences
try{
	var maxCount = prefSrv.getIntPref("recentFilesMaxCount");
}catch(e){
	Components.utils.reportError("Preference `recentFilesMaxCount` is not set yet!");
	prefSrv.setIntPref("recentFilesMaxCount", 15);
}
try{
	var files = prefSrv.getCharPref("recentFiles");
}catch(e){
	Components.utils.reportError("Preference `recentFiles` is not set yet!");
	prefSrv.setCharPref("recentFiles", "[]");
}

/**
 * Recent files prototype.
 */
function RecentFiles(){}
RecentFiles.prototype = {
	
	/** 
	 * Add recent file.
	 *  
	 * If recent file already exists in the list than is moved to the first place.
	 * 
	 * @param aPath string
	 */
	add: function(aPath)
	{
		// Maximum recent files count (0 = no recent files).
	    var maxRecent = prefSrv.getIntPref("recentFilesMaxCount");
	    if(maxRecent < 1){
	      return;
	    }
	    
	    // Get current recent files
		var recentFiles = this.get();
		var filesCount = recentFiles.length,
			fileIndex = recentFiles.indexOf(aPath);
		
		// Check if given path is already in recent files or not.
		if(fileIndex > -1){
			if(fileIndex === (filesCount - 1)){
				// The path we're adding is already the newest - nothing to do.
				return;
			}
			// Remove path from old position
			recentFiles.splice(fileIndex, 1);
		}else if(filesCount === maxRecent){
			// Remove the last recent files if maximal count reached.
			recentFiles.shift();
		}
		
		// Add path
		recentFiles.push(aPath);
		
		// Save preferences
	    prefSrv.setCharPref("recentFiles", JSON.stringify(recentFiles));
	}, // end add(aPath)
				
	/** 
	 * Get array with paths to the recent files.
	 * 
	 * @return array
	 */
	get: function()
	{
		var recentFilesObj = JSON.parse(prefSrv.getCharPref("recentFiles"));
		
		return recentFilesObj;
	} // end get()
	
}; // End of RecentFiles

var MarkDownEditor_RecentFiles = new RecentFiles();
