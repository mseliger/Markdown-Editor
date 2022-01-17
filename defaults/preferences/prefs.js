/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// If TRUE than MarkDown Editor will be opened whenever mime handler finished 
// parsing of another `text/x-web-markdown` document. Editor self will be 
// opened according to rules set in `extensions.markdowneditor.useTab`.
pref("extensions.markdowneditor.showEditorAfterParse", false);

// If TRUE than MarkDown Editor will be open in browser's tab 
// instead of own window. 
pref("extensions.markdowneditor.useTab", true);

// If "none" than only editor is defaultly shown. If "vertical" or "horizontal" 
// than is the preview browser shown as well. Value corresponds with toolbar 
// buttons in `markdowneditor` binding self.
pref("extensions.markdowneditor.defaultViewSplit", "none");

// Holds default CSS used for previews.
pref("extensions.markdowneditor.defaultCss", "html, body{font-family: 'Calibri', 'DejaVu Sans', 'Lucida Sans', sans !important;font-size: 10pt;padding: 0px 0px 0px 0px;margin: 0px 0px 0px 0px;} body{width: 90%;padding: 20px 4% 0 5%;} h1{font-size:16pt;} h2{font-size:15pt;} h3{font-size:14pt;} h4{font-size:13pt;} h5{font-size:12pt;} h6{font-size:11pt;}");

// Maximal count of recent files to remember.
pref("extensions.markdowneditor.recentFilesMaxCount", 15);

// Holds JSON string with recent files.
pref("extensions.markdowneditor.recentFiles", "[]");
