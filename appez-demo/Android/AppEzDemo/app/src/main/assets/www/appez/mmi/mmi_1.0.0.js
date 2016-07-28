/*
 Copyright 2011 Abdulla Abdurakhmanov
 Original sources are available at https://code.google.com/p/x2js/

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

function X2JS() {
	var VERSION = "1.0.11";
	var escapeMode = false;

	var DOMNodeTypes = {
		ELEMENT_NODE 	   : 1,
		TEXT_NODE    	   : 3,
		CDATA_SECTION_NODE : 4,
		DOCUMENT_NODE 	   : 9
	};
	
	function getNodeLocalName( node ) {
		var nodeLocalName = node.localName;			
		if(nodeLocalName == null) // Yeah, this is IE!! 
			nodeLocalName = node.baseName;
		if(nodeLocalName == null || nodeLocalName=="") // =="" is IE too
			nodeLocalName = node.nodeName;
		return nodeLocalName;
	}
	
	function getNodePrefix(node) {
		return node.prefix;
	}
		
	function escapeXmlChars(str) {
		if(typeof(str) == "string")
			return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
		else
			return str;
	}

	function unescapeXmlChars(str) {
		return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#x2F;/g, '\/')
	}	

	function parseDOMChildren( node ) {
		if(node.nodeType == DOMNodeTypes.DOCUMENT_NODE) {
			var result = new Object;
			var child = node.firstChild; 
			var childName = getNodeLocalName(child);
			result[childName] = parseDOMChildren(child);
			return result;
		}
		else
		if(node.nodeType == DOMNodeTypes.ELEMENT_NODE) {
			var result = new Object;
			result.__cnt=0;
			
			var nodeChildren = node.childNodes;
			
			// Children nodes
			for(var cidx=0; cidx <nodeChildren.length; cidx++) {
				var child = nodeChildren.item(cidx); // nodeChildren[cidx];
				var childName = getNodeLocalName(child);
				
				result.__cnt++;
				if(result[childName] == null) {
					result[childName] = parseDOMChildren(child);
					result[childName+"_asArray"] = new Array(1);
					result[childName+"_asArray"][0] = result[childName];
				}
				else {
					if(result[childName] != null) {
						if( !(result[childName] instanceof Array)) {
							var tmpObj = result[childName];
							result[childName] = new Array();
							result[childName][0] = tmpObj;
							
							result[childName+"_asArray"] = result[childName];
						}
					}
					var aridx = 0;
					while(result[childName][aridx]!=null) aridx++;
					(result[childName])[aridx] = parseDOMChildren(child);
				}			
			}
			
			// Attributes
			for(var aidx=0; aidx <node.attributes.length; aidx++) {
				var attr = node.attributes.item(aidx); // [aidx];
				result.__cnt++;
				result["_"+attr.name]=attr.value;
			}
			
			// Node namespace prefix
			var nodePrefix = getNodePrefix(node);
			if(nodePrefix!=null && nodePrefix!="") {
				result.__cnt++;
				result.__prefix=nodePrefix;
			}
			
			if( result.__cnt == 1 && result["#text"]!=null  ) {
				result = result["#text"];
			} 
			
			if(result["#text"]!=null) {
				result.__text = result["#text"];
				if(escapeMode)
					result.__text = unescapeXmlChars(result.__text)
				delete result["#text"];
				delete result["#text_asArray"];
			}
			if(result["#cdata-section"]!=null) {
//				alert("result[#cdata-section]!=null:"+result["#cdata-section"]);
				result.__cdata = result["#cdata-section"];
				delete result["#cdata-section"];
				delete result["#cdata-section_asArray"];
			}
			
			if(result.__text!=null || result.__cdata!=null) {
//				alert("has cdata section");
				result.toString = function() {
					return (this.__text!=null? this.__text:'')+( this.__cdata!=null ? this.__cdata:'');
				}
			}
//			alert("result:"+result);
			return result;
		}
		else
		if(node.nodeType == DOMNodeTypes.TEXT_NODE || node.nodeType == DOMNodeTypes.CDATA_SECTION_NODE) {
//			alert("node.nodeType == DOMNodeTypes.TEXT_NODE || node.nodeType == DOMNodeTypes.CDATA_SECTION_NODE:Node value->"+node.nodeValue);
			return node.nodeValue;
		}	
	}
	
	function startTag(jsonObj, element, attrList, closed) {
		var resultStr = "<"+ ( (jsonObj!=null && jsonObj.__prefix!=null)? (jsonObj.__prefix+":"):"") + element;
		if(attrList!=null) {
			for(var aidx = 0; aidx < attrList.length; aidx++) {
				var attrName = attrList[aidx];
				var attrVal = jsonObj[attrName];
				resultStr+=" "+attrName.substr(1)+"='"+attrVal+"'";
			}
		}
		if(!closed)
			resultStr+=">";
		else
			resultStr+="/>";
		return resultStr;
	}
	
	function endTag(jsonObj,elementName) {
		return "</"+ (jsonObj.__prefix!=null? (jsonObj.__prefix+":"):"")+elementName+">";
	}
	
	function endsWith(str, suffix) {
	    return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}
	
	function jsonXmlSpecialElem ( jsonObj, jsonObjField ) {
		if(endsWith(jsonObjField.toString(),("_asArray")) 
				|| jsonObjField.toString().indexOf("_")==0 
				|| (jsonObj[jsonObjField] instanceof Function) )
			return true;
		else
			return false;
	}
	
	function jsonXmlElemCount ( jsonObj ) {
		var elementsCnt = 0;
		if(jsonObj instanceof Object ) {
			for( var it in jsonObj  ) {
				if(jsonXmlSpecialElem ( jsonObj, it) )
					continue;			
				elementsCnt++;
			}
		}
		return elementsCnt;
	}
	
	function parseJSONAttributes ( jsonObj ) {
		var attrList = [];
		if(jsonObj instanceof Object ) {
			for( var ait in jsonObj  ) {
				if(ait.toString().indexOf("__")== -1 && ait.toString().indexOf("_")==0) {
					attrList.push(ait);
				}
			}
		}
		return attrList;
	}
	
	function parseJSONTextAttrs ( jsonTxtObj ) {
		var result ="";
		
		if(jsonTxtObj.__cdata!=null) {										
			result+="<![CDATA["+jsonTxtObj.__cdata+"]]>";					
		}
		
		if(jsonTxtObj.__text!=null) {			
			if(escapeMode)
				result+=escapeXmlChars(jsonTxtObj.__text);
			else
				result+=jsonTxtObj.__text;
		}
		return result
	}
	
	function parseJSONTextObject ( jsonTxtObj ) {
		var result ="";

		if( jsonTxtObj instanceof Object ) {
			result+=parseJSONTextAttrs ( jsonTxtObj )
		}
		else
			if(jsonTxtObj!=null) {
				if(escapeMode)
					result+=escapeXmlChars(jsonTxtObj);
				else
					result+=jsonTxtObj;
			}
		
		return result;
	}
	
	function parseJSONArray ( jsonArrRoot, jsonArrObj, attrList ) {
		var result = ""; 
		if(jsonArrRoot.length == 0) {
			result+=startTag(jsonArrRoot, jsonArrObj, attrList, true);
		}
		else {
			for(var arIdx = 0; arIdx < jsonArrRoot.length; arIdx++) {
				result+=startTag(jsonArrRoot[arIdx], jsonArrObj, parseJSONAttributes(jsonArrRoot[arIdx]), false);
				result+=parseJSONObject(jsonArrRoot[arIdx]);
				result+=endTag(jsonArrRoot[arIdx],jsonArrObj);						
			}
		}
		return result;
	}
	
	function parseJSONObject ( jsonObj ) {
		var result = "";	

		var elementsCnt = jsonXmlElemCount ( jsonObj );
		
		if(elementsCnt > 0) {
			for( var it in jsonObj ) {
				
				if(jsonXmlSpecialElem ( jsonObj, it) )
					continue;			
				
				var subObj = jsonObj[it];						
				
				var attrList = parseJSONAttributes( subObj )
				
				if(subObj == null || subObj == undefined) {
					result+=startTag(subObj, it, attrList, true)
				}
				else
				if(subObj instanceof Object) {
					
					if(subObj instanceof Array) {					
						result+=parseJSONArray( subObj, it, attrList )					
					}
					else {
						var subObjElementsCnt = jsonXmlElemCount ( subObj );
						if(subObjElementsCnt > 0 || subObj.__text!=null || subObj.__cdata!=null) {
							result+=startTag(subObj, it, attrList, false);
							result+=parseJSONObject(subObj);
							result+=endTag(subObj,it);
						}
						else {
							result+=startTag(subObj, it, attrList, true);
						}
					}
				}
				else {
					result+=startTag(subObj, it, attrList, false);
					result+=parseJSONTextObject(subObj);
					result+=endTag(subObj,it);
				}
			}
		}
		result+=parseJSONTextObject(jsonObj);
		
		return result;
	}
	
	this.parseXmlString = function(xmlDocStr) {
		var xmlDoc;
		if (window.DOMParser) {
			var parser=new window.DOMParser();			
			xmlDoc = parser.parseFromString( xmlDocStr, "text/xml" );
		}
		else {
			// IE :(
			if(xmlDocStr.indexOf("<?")==0) {
				xmlDocStr = xmlDocStr.substr( xmlDocStr.indexOf("?>") + 2 );
			}
			xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async="false";
			xmlDoc.loadXML(xmlDocStr);
		}
		return xmlDoc;
	}

	this.xml2json = function (xmlDoc) {
		return parseDOMChildren ( xmlDoc );
	}
	
	this.xml_str2json = function (xmlDocStr) {
		var xmlDoc = this.parseXmlString(xmlDocStr);	
		return this.xml2json(xmlDoc);
	}

	this.json2xml_str = function (jsonObj) {
		return parseJSONObject ( jsonObj );
	}

	this.json2xml = function (jsonObj) {
		var xmlDocStr = this.json2xml_str (jsonObj);
		return this.parseXmlString(xmlDocStr);
	}
	
	this.getVersion = function () {
		return VERSION;
	}		
	
	this.escapeMode = function(enabled) {
		escapeMode = enabled;
	}
}

var x2js = new X2JS();;/**
 * Contains helper functions for using services of appez native containers(Android, iOS, WP)
 * 
 */
appez.mmi = {
		manager : {
			"android":{},
			"ios":{},
			"wp":{},
			"web":{}
		},
		model : {},
		notifier : {},
		service : {
			"nativePlatform": {},
			"web": {}
		},
		util : {
			
		},
		
		logManager : null,
		mobiletManager : null,
		platformService : null,
		isProgressDialogShown : false,
		
		nativeEventListenerScope : null,
		nativeEventListenerFunction : null,
		
		originalViewportHeight : 0,
		
		isSmartEventUnderExec : false,
		
		init : function(){
			//TODO Initialise services JSON object so that directly service objects can be obtained
			//TODO initialise the platform specific managers such as LogManager and MobiletManager
			this.logManager = appez.mmi.manager[appez.getDevice().getOsString()].LogManager;
			this.mobiletManager = appez.mmi.manager[appez.getDevice().getOsString()].MobiletManager;
			if(appez.getDevice().deviceOS!=appez.getDevice().DEVICE_OS.WEB){
				//In case of web version, the web equivalent of the services will get loaded
				this.platformService = appez.mmi.service.nativePlatform;
			} else{
				this.platformService = appez.mmi.service.web;
			}
			
			//Determine the original height of the page viewport
			this.originalViewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
			var me = this;
			//Register the window resize listener so as to capture the soft keyboard show/hide
			window.onresize = function() { 
				appez.mmi.log('Window resize');
				//Specify the action to be taken on window resize. Remember to add the following entry ' android:windowSoftInputMode="adjustResize"' in the AndroidManifest.xml for Android platform
				var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
				if(viewportHeight==me.originalViewportHeight){
					appez.mmi.log('keyboard hidden');
					appez.mmi.manager.MobiletManager.notificationFromNative(appez.mmi.constant.NATIVE_EVENT_SOFT_KB_HIDE);
				} else if(viewportHeight<me.originalViewportHeight){
					appez.mmi.log('keyboard shown');
					appez.mmi.manager.MobiletManager.notificationFromNative(appez.mmi.constant.NATIVE_EVENT_SOFT_KB_SHOW);
				}

			};
		},
		
		createClass : function(memberVariables) {
			return appez.mmi.util.ClassManager.createClass(memberVariables);
		},
		
		base64Encode : function(stringToEncode) {
			return appez.mmi.util.Base64.encode(stringToEncode);
		},

		base64Decode : function(stringToDecode) {
			return appez.mmi.util.Base64.decode(stringToDecode);
		},
		
		getLogManager : function(){
			return this.logManager;
		},
		
		getMobiletManager : function(){
			return this.mobiletManager;
		},
		
		log : function(message, logLevel){
			this.getLogManager().log(message, logLevel);
		},
		
		/**
		 * This method can be used when the user wants to access the entire 'SmartEvent' object. 
		 * This might be needed, since the completion of service would be returning only 'SmartEventResponse' and user might need to access 'SmartEventRequest' also.
		 * 
		 * @return SmartEvent
		 * 
		 * */
		getCurrentSmartEvent : function(){
			//TODO add handling as to what will this function return when run on Web platform 
			return appez.mmi.manager.MobiletManager.getCurrentSmartEvent();
		},
		
		/**
		 * Checks whether or not a SmartEvent is currently under execution or not. 
		 * Returns 'true' if one of the events is under execution at the native layer, returns 'false' otherwise 
		 * 
		 * */
		isSmartEventUnderExecution : function(){
			return this.isSmartEventUnderExec;
		},
		
		/**
		 * Set the status of SmartEvent under execution as 'true' or 'false'
		 *
		 * @param isEventUnderExec
		 * */
		setSmartEventUnderExecution : function(isEventUnderExec){
			if(isEventUnderExec!=undefined){
				this.isSmartEventUnderExec = isEventUnderExec;
			}
		},
		
		/**
		 * 
		 * User application can register a listener for listening to native events like Back key pressed, system notifications(such as low battery, network change etc.) 
		 * */
		registerNativeEventListener : function(listenerScope, listenerFunction){
			this.nativeEventListenerScope = listenerScope;
			this.nativeEventListenerFunction = listenerFunction;
		},
		
		getNativeListenerScope : function(){
			return this.nativeEventListenerScope;
		},
		
		getNativeListenerFunction : function(){
			return this.nativeEventListenerFunction;
		},
		
		//Helper functions for accessing UI service
		showProgressDialog : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			if(!this.isProgressDialogShown){
				this.isProgressDialogShown = true;
				smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_SHOW_ACTIVITY_INDICATOR);
			} else {
				smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_UPDATE_LOADING_MESSAGE);
			}

			this.platformService[appez.mmi.constant.SERVICE_UI].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		showProgressIndicator : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_SHOW_INDICATOR);
			this.platformService[appez.mmi.constant.SERVICE_UI].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},

		hideProgressDialog : function(requestData, callbackFunc, callbackFuncScope){
			if(this.isProgressDialogShown){
				this.isProgressDialogShown = false;
				var smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_HIDE_ACTIVITY_INDICATOR);
				this.platformService[appez.mmi.constant.SERVICE_UI].processRequest(smartEvent, callbackFunc, callbackFuncScope);
			} else {
				//TODO send the response back to the user that the dialog is currently not shown
			}
		},
		
		hideProgressIndicator : function(requestData, callbackFunc, callbackFuncScope) {
			var smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_HIDE_INDICATOR);
			this.platformService[appez.mmi.constant.SERVICE_UI].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		showInformationDialog : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_SHOW_MESSAGE);
			this.platformService[appez.mmi.constant.SERVICE_UI].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		showDecisionDialog : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_SHOW_MESSAGE_YESNO);
			this.platformService[appez.mmi.constant.SERVICE_UI].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		showSelectionList : function(requestData, callbackFunc, callbackFuncScope) {
			var smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_SHOW_DIALOG_SINGLE_CHOICE_LIST);
			this.platformService[appez.mmi.constant.SERVICE_UI].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		showSelectionListRadio : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_SHOW_DIALOG_SINGLE_CHOICE_LIST_RADIO_BTN);
			this.platformService[appez.mmi.constant.SERVICE_UI].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		showMultiSelectionList : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_SHOW_DIALOG_MULTIPLE_CHOICE_LIST_CHECKBOXES);
			this.platformService[appez.mmi.constant.SERVICE_UI].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		showDatePicker : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_SHOW_DATE_PICKER);
			this.platformService[appez.mmi.constant.SERVICE_UI].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		//Helper functions for accessing HTTP service
		executeHttpRequest : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_HTTP_REQUEST);
	
			this.platformService[appez.mmi.constant.SERVICE_HTTP].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		executeHttpRequestWithSaveData : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_HTTP_REQUEST_SAVE_DATA);
	
			this.platformService[appez.mmi.constant.SERVICE_HTTP].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		executeAjaxRequest : function(requestData, callbackFunc, callbackFuncScope){
			//TODO handle this request
		},
		
		//Helper functions for accessing Persistence service
		saveData : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_SAVE_DATA_PERSISTENCE);
	
			this.platformService[appez.mmi.constant.SERVICE_PERSISTENCE].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		retrieveData : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_RETRIEVE_DATA_PERSISTENCE);
	
			this.platformService[appez.mmi.constant.SERVICE_PERSISTENCE].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		deleteData : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_DELETE_DATA_PERSISTENCE);
	
			this.platformService[appez.mmi.constant.SERVICE_PERSISTENCE].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		//Helper functions for accessing Database service
		
		//This function provides the application object for initialising the database. Since, the MMI layer is separated from the SmartWeb, thus the MMI layer on its own is unable to determine the application object in case, the user has used SmartWeb
		//Also, this method is meant for supporting DB service in the web layer and not the native layer.
		initDb : function(applicationObj){
			appez.mmi.service.web.DatabaseService.initDb(applicationObj);
		},
		
		openDatabase : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			if(requestData!=null && requestData !=undefined){
				requestData[appez.mmi.constant.MMI_REQUEST_PROP_SERVICE_SHUTDOWN] = false;
				smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_OPEN_DATABASE);
				
				this.platformService[appez.mmi.constant.SERVICE_DATABASE].processRequest(smartEvent, callbackFunc, callbackFuncScope);
			}
		},
		
		//TODO Can have a helper function like 'isTableExists(tableName)' that can check the presence of a table. User can instantly check the presence of table with it 
		
		executeDbQuery : function(requestData, callbackFunc, callbackFuncScope) {
			var smartEvent = null;
			if(requestData!=null && requestData !=undefined){
				requestData[appez.mmi.constant.MMI_REQUEST_PROP_SERVICE_SHUTDOWN] = false;
				smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_EXECUTE_DB_QUERY);
		
				this.platformService[appez.mmi.constant.SERVICE_DATABASE].processRequest(smartEvent, callbackFunc, callbackFuncScope);
			}
		},
		
		executeReadDbQuery : function(requestData, callbackFunc, callbackFuncScope) {
			var smartEvent = null;
			if(requestData!=null && requestData !=undefined){
				requestData[appez.mmi.constant.MMI_REQUEST_PROP_SERVICE_SHUTDOWN] = false;
				smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_EXECUTE_DB_READ_QUERY);
		
				this.platformService[appez.mmi.constant.SERVICE_DATABASE].processRequest(smartEvent, callbackFunc, callbackFuncScope);
			}
		},
		
		closeDatabase : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_CLOSE_DATABASE);
			
			this.platformService[appez.mmi.constant.SERVICE_DATABASE].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		//Helper functions for accessing Co-event service
		//TODO need to check whether there would be any helper functions for this service
		
		//Helper functions for accessing App-event service
		//TODO need to check whether there would be any helper functions for this service
		
		//Helper functions for accessing Map service
		showMap : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.MAPVIEW_SHOW);
	
			this.platformService[appez.mmi.constant.SERVICE_MAP].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		showMapWithDirections : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.MAPVIEW_SHOW_WITH_DIRECTIONS);
	
			this.platformService[appez.mmi.constant.SERVICE_MAP].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		showMapWithAnimation : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.MAPVIEW_SHOW_WITH_ANIMATION);
	
			this.platformService[appez.mmi.constant.SERVICE_MAP].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		//Helper functions for using File service
		readFileContents : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_READ_FILE_CONTENTS);
	
			this.platformService[appez.mmi.constant.SERVICE_FILE].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		readFolderContents : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_READ_FOLDER_CONTENTS);
	
			this.platformService[appez.mmi.constant.SERVICE_FILE].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		}, 
		
		unarchiveFile : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_UNZIP_FILE_CONTENTS);
	
			this.platformService[appez.mmi.constant.SERVICE_FILE].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		archiveResource : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_ZIP_CONTENTS);
	
			this.platformService[appez.mmi.constant.SERVICE_FILE].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		//Helper functions for accessing Camera service
		captureImageFromCamera : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			if(requestData!=null && requestData!=undefined){
				requestData[appez.mmi.constant.MMI_REQUEST_PROP_IMG_SRC] = appez.mmi.constant.LAUNCH_CAMERA;
			}
			//Add the default value of the service parameters if the user has not provided them
			if(requestData[appez.mmi.constant.MMI_REQUEST_PROP_IMG_COMPRESSION]==undefined){
				requestData[appez.mmi.constant.MMI_REQUEST_PROP_IMG_COMPRESSION] = 0;
			}
			if(requestData[appez.mmi.constant.MMI_REQUEST_PROP_IMG_ENCODING]==undefined){
				requestData[appez.mmi.constant.MMI_REQUEST_PROP_IMG_ENCODING] = appez.mmi.constant.IMAGE_JPEG;
			}
			if(requestData[appez.mmi.constant.MMI_REQUEST_PROP_IMG_FILTER]==undefined){
				requestData[appez.mmi.constant.MMI_REQUEST_PROP_IMG_FILTER] = appez.mmi.constant.STANDARD;
			}
			//---------------------------------------------------------------------------------
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_CAMERA_OPEN);
	
			this.platformService[appez.mmi.constant.SERVICE_CAMERA].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		captureImageFromGallery : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			if(requestData!=null && requestData!=undefined){
				requestData[appez.mmi.constant.MMI_REQUEST_PROP_IMG_SRC] = appez.mmi.constant.LAUNCH_GALLERY;
			}
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_IMAGE_GALLERY_OPEN);
	
			this.platformService[appez.mmi.constant.SERVICE_CAMERA].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		//Location service helper function(s)
		getLocation : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_USER_CURRENT_LOCATION);
	
			this.platformService[appez.mmi.constant.SERVICE_LOCATION].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		//---------------------------------------------------------------
		
		//Signature service helper function(s)
		captureAndSaveUserSign : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			//If the user has not provided pen color, the set the default to BLACK color
			if(requestData[appez.mmi.constant.MMI_REQUEST_PROP_SIGN_PENCOLOR]==undefined){
				requestData[appez.mmi.constant.MMI_REQUEST_PROP_SIGN_PENCOLOR] = "#000000";
			}
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_SIGNATURE_SAVE_IMAGE);
	
			this.platformService[appez.mmi.constant.SERVICE_SIGNATURE].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		
		captureAndGetUserSign : function(requestData, callbackFunc, callbackFuncScope){
			var smartEvent = null;
			//If the user has not provided pen color, the set the default to BLACK color
			if(requestData[appez.mmi.constant.MMI_REQUEST_PROP_SIGN_PENCOLOR]==undefined){
				requestData[appez.mmi.constant.MMI_REQUEST_PROP_SIGN_PENCOLOR] = "#000000";
			}
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, true, appez.mmi.constant.WEB_SIGNATURE_IMAGE_DATA);
	
			this.platformService[appez.mmi.constant.SERVICE_SIGNATURE].processRequest(smartEvent, callbackFunc, callbackFuncScope);
		},
		//---------------------------------------------------------------
		
		//Service independent helper functions for accessing native features
		showNativeMenuOptions : function(){
			//TODO add the handling for showing the overflow/traditional menu items(Android) or action sheets(iOS) or Application bar(WP)
		},
		
		/**
		 * Can be called by the application after the first page is ready to be shown
		 * 
		 * */
		showWebView : function(){
			appez.mmi.log('appez-mmi->showWebView');
			var smartEvent = null;
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent({}, true, appez.mmi.constant.CONTEXT_WEBVIEW_SHOW);
	
			this.platformService[appez.mmi.constant.SERVICE_CO_EVENT].processRequest(smartEvent, this.showWebViewCallback, this);
		},
		
		showWebViewCallback : function(response){
			appez.mmi.log('appez-mmi->showWebViewCallback');
		},
		
		
		/**
		 * Send AppEvent to the native layer of the client code to be handled by the client
		 * 
		 * @param eventData : String message that needs to be communicated to the native layer. 
		 * @param notification: Should be a notification >30000
		 * 
		 * */
		sendAppEvent : function(eventData, notification){
			appez.mmi.log('appez-mmi->sendAppEvent');
			var smartEvent = null;
			var requestData = {
					"message" : eventData
			}
			smartEvent = appez.mmi.util.FrameworkUtil.prepareSmartEvent(requestData, false, notification);
	
			this.platformService[appez.mmi.constant.SERVICE_APP_EVENT].processRequest(smartEvent, null, null);
		},
		
		/**
		 * Sends the menu ID's specified by the user to the native layer
		 * 
		 * @param menuItems : JSON array containing the menu ID's(and other details) required by the native layer to show on overflow menu item(Android), UIActionSheet(iOS)
		 * 
		 * */
		setCurrentMenuItems : function(menuItems){
			this.sendAppEvent(menuItems, appez.mmi.constant.APP_NOTIFY_MENU_ACTION);
		},
		
		/**
		 * Helper function for showing the UiActionSheet in iOS devices
		 * 
		 * */
		showMenu : function(){
			//First check if the platform is iOS. Send the notification to native only in case the platform is iOS
			if(appez.isIPhone()||appez.isIPad()){
				//Send the notification to the iOS native container for showing the UIActionSheet
				this.sendAppEvent({}, appez.mmi.constant.APP_NOTIFY_CREATE_MENU);
			}
		},
		
		//Notifier event methods
		registerNetworkStateNotifier : function(registerParams, callbackFunc, callbackFuncScope){
			var notifierEvent = appez.mmi.util.FrameworkUtil.prepareNotifierEvent(registerParams, appez.mmi.constant.NETWORK_STATE_NOTIFIER, appez.mmi.constant.NOTIFIER_ACTION_REGISTER);
			appez.mmi.notifier.NetworkStateNotifier.register(notifierEvent,callbackFunc, callbackFuncScope);
		},
		
		unregisterNetworkStateNotifier : function(registerParams, callbackFunc, callbackFuncScope){
			var notifierEvent = appez.mmi.util.FrameworkUtil.prepareNotifierEvent(unregisterParams, appez.mmi.constant.NETWORK_STATE_NOTIFIER, appez.mmi.constant.NOTIFIER_ACTION_UNREGISTER);
			appez.mmi.notifier.NetworkStateNotifier.unregister(notifierEvent,callbackFunc, callbackFuncScope);
		}
		//-----------------------------------------
}
;appez.mmi.constant = {
		//LOG LEVELS
		LOG_LEVEL_ERROR : 1,
		LOG_LEVEL_DEBUG : 2,
		LOG_LEVEL_INFO : 3,
		
		//Service class names
		SERVICE_APP_EVENT : 'AppEventService',
		SERVICE_CAMERA : 'CameraService',
		SERVICE_CO_EVENT : 'CoEventService',
		SERVICE_DATABASE : 'DatabaseService',
		SERVICE_FILE : 'FileService',
		SERVICE_HTTP : 'HttpService',
		SERVICE_MAP : 'MapService',
		SERVICE_PERSISTENCE : 'PersistenceService',
		SERVICE_UI : 'UIService',
		SERVICE_LOCATION : 'LocationService',
		SERVICE_SIGNATURE : 'SignatureService',
		
										//SERVICE CONSTANTS
		// UI Service constants
		WEB_SHOW_ACTIVITY_INDICATOR : 10101,
		WEB_HIDE_ACTIVITY_INDICATOR : 10102,
		WEB_UPDATE_LOADING_MESSAGE : 10103,
		WEB_SHOW_DATE_PICKER : 10104,
		WEB_SHOW_MESSAGE : 10105,
		WEB_SHOW_MESSAGE_YESNO : 10106,
		WEB_SHOW_INDICATOR : 10107,
		WEB_HIDE_INDICATOR : 10108,
		WEB_SHOW_DIALOG_SINGLE_CHOICE_LIST : 10109,
		WEB_SHOW_DIALOG_SINGLE_CHOICE_LIST_RADIO_BTN : 10110,
		WEB_SHOW_DIALOG_MULTIPLE_CHOICE_LIST_CHECKBOXES : 10111,
		
		// HTTP Service constants
		WEB_HTTP_REQUEST : 10201,
		WEB_HTTP_REQUEST_SAVE_DATA : 10202,
		
		// Data Persistence service constants
		WEB_SAVE_DATA_PERSISTENCE : 10401,
		WEB_RETRIEVE_DATA_PERSISTENCE : 10402,
		WEB_DELETE_DATA_PERSISTENCE : 10403,
		WEB_CLOSE_DATABASE : 10504,
		
		// DB Service constants
		WEB_OPEN_DATABASE : 10501,
		WEB_EXECUTE_DB_QUERY : 10502,
		WEB_EXECUTE_DB_READ_QUERY : 10503,
		
		//File Reading service constants
		WEB_READ_FILE_CONTENTS : 10801,
		WEB_READ_FOLDER_CONTENTS : 10802,
		WEB_UNZIP_FILE_CONTENTS : 10803,
		WEB_ZIP_CONTENTS : 10804,
		
		//Camera service constants
		WEB_CAMERA_OPEN : 10901,
		WEB_IMAGE_GALLERY_OPEN : 10902,
		
		//Location service constants
		WEB_USER_CURRENT_LOCATION : 11001,
		//-------------------------------------
		
		//Signature service constants
		WEB_SIGNATURE_SAVE_IMAGE : 11201,
		WEB_SIGNATURE_IMAGE_DATA : 11202,
		//-------------------------------
		
		//Context service constants
		CONTEXT_CHANGE : 20601,
		CONTEXT_WEBVIEW_SHOW : 20602,
		CONTEXT_WEBVIEW_HIDE : 20603,
		
		//Map service constants
		MAPVIEW_SHOW : 20701,
		MAPVIEW_SHOW_WITH_DIRECTIONS : 20702,
		MAPVIEW_SHOW_WITH_ANIMATION : 20703,

		//App event constant
		APP_DEFAULT_ACTION : 30001,
		APP_NOTIFY_EXIT : 30002,
		APP_NOTIFY_MENU_ACTION : 30003,
		APP_NOTIFY_DATA_ACTION : 30004,
		APP_NOTIFY_ACTIVITY_ACTION : 30005,
		APP_CONTROL_TRANSFER : 30006,
		APP_NOTIFY_CREATE_TABS : 30007,
		APP_NOTIFY_CREATE_MENU : 30008,
		APP_MANAGE_STARTUP : 30009,
		APP_NOTIFY_OPEN_BROWSER : 30010,
		
		//NOTIFIER CONSTANTS
		NETWORK_STATE_NOTIFIER : 1002,
		
		NOTIFIER_ACTION_REGISTER : 1,
		NOTIFIER_ACTION_UNREGISTER : 2,
		//---------------------------
		
		//Native event constants
		NATIVE_EVENT_BACK_PRESSED : 0,
		NATIVE_EVENT_PAGE_INIT_NOTIFICATION : 1,
		NATIVE_EVENT_ENTER_PRESSED : 2,
		NATIVE_EVENT_ACTIONBAR_UP_PRESSED : 3,
		NATIVE_EVENT_SOFT_KB_SHOW : 4,
		NATIVE_EVENT_SOFT_KB_HIDE : 5,
		//-----------------------------------------
		
		RETRIEVE_ALL_FROM_PERSISTENCE : "*",
		
		//Default timeout for location requests. Currently 2 minutes.
		LOCATION_SERVICE_DEFAULT_TIMEOUT : 2*60*1000,
		
		//EXCEPTION TYPES AND MESSAGES
		UNKNOWN_EXCEPTION : -1,
		SERVICE_TYPE_NOT_SUPPORTED_EXCEPTION : -2,
		SMART_APP_LISTENER_NOT_FOUND_EXCEPTION : -3,
		SMART_CONNECTOR_LISTENER_NOT_FOUND_EXCEPTION : -4,
		INVALID_PAGE_URI_EXCEPTION : -5,
		INVALID_PROTOCOL_EXCEPTION : -6,
		INVALID_ACTION_CODE_PARAMETER : -7,
		ACTION_CODE_NUMBER_FORMAT_EXCEPTION : -8,
		IO_EXCEPTION : -9,
		HTTP_PROCESSING_EXCEPTION : -10,
		NETWORK_NOT_REACHABLE_EXCEPTION : -11,
		FILE_NOT_FOUND_EXCEPTION : -12,
		MALFORMED_URL_EXCEPTION : -13,
		PROTOCOL_EXCEPTION : -14,
		UNSUPPORTED_ENCODING_EXCEPTION : -15,
		SOCKET_EXCEPTION_REQUEST_TIMED_OUT : -16,
		ERROR_SAVE_DATA_PERSISTENCE : -17,
		ERROR_RETRIEVE_DATA_PERSISTENCE : -18,
		ERROR_DELETE_DATA_PERSISTENCE : -19,
		JSON_PARSE_EXCEPTION : -20,
		UNKNOWN_CURRENT_LOCATION_EXCEPTION : -21,
		DB_OPERATION_ERROR : -22,
		SOCKET_EXCEPTION : -23,
		UNKNOWN_NETWORK_EXCEPTION : -24,
		DEVICE_SUPPORT_EXCEPTION : -25,
		FILE_READ_EXCEPTION : -26,
		EXTERNAL_SD_CARD_NOT_AVAILABLE_EXCEPTION : -27,
		PROBLEM_SAVING_IMAGE_TO_EXTERNAL_STORAGE_EXCEPTION : -28,
		PROBLEM_CAPTURING_IMAGE_EXCEPTION : -29,
		ERROR_RETRIEVING_CURRENT_LOCATION : -30,
		DB_SQLITE_INIT_ERROR : -31,
		FILE_UNZIP_ERROR : -32,
		FILE_ZIP_ERROR : -33,
		DB_OPEN_ERROR : -34,
		DB_QUERY_EXEC_ERROR : -35,
		DB_READ_QUERY_EXEC_ERROR : -36,
		DB_TABLE_NOT_EXIST_ERROR : -37,
		DB_CLOSE_ERROR : -38,
		INVALID_SERVICE_REQUEST_ERROR: -39,
		INVALID_JSON_REQUEST: -40,
		LOCATION_ERROR_GPS_NETWORK_DISABLED : -41,
		LOCATION_ERROR_PLAY_SERVICE_NOT_AVAILABLE : -42,
		NOTIFIER_REQUEST_INVALID : -43,
		NOTIFIER_REQUEST_ERROR : -44,

		// EXCEPTION MESSAGE
		NETWORK_NOT_REACHABLE_EXCEPTION_MESSAGE : "Network not reachable",
		UNABLE_TO_PROCESS_MESSAGE : "Unable to process request",
		UNKNOWN_CURRENT_LOCATION_EXCEPTION_MESSAGE : "Could not get current location",
		JSON_PARSE_EXCEPTION_MESSAGE : "Unable to parse JSON",
		HARDWARE_CAMERA_IN_USE_EXCEPTION_MESSAGE : "Camera already in use",
		PROBLEM_CAPTURING_IMAGE_EXCEPTION_MESSAGE : "Problem capturing image from camera",
		ERROR_RETRIEVING_CURRENT_LOCATION_MESSAGE : "Unable to retrieve current location",
		ERROR_DELETE_DATA_PERSISTENCE_MESSAGE : "Problem deleting data from persistence store",
		ERROR_RETRIEVE_DATA_PERSISTENCE_MESSAGE : "Problem retrieving data from persistence store",
		ERROR_SAVE_DATA_PERSISTENCE_MESSAGE : "Problem saving data to persistence store",
		DB_OPERATION_ERROR_MESSAGE : "Problem performing database operation",
		FILE_UNZIP_ERROR_MESSAGE : "Unable to extract the archive file.",	
		INVALID_SERVICE_REQUEST_ERROR_MESSAGE: "Invalid Service Request. Make sure that you have provided all the required parameters in the request.",
		LOCATION_ERROR_GPS_NETWORK_DISABLED_MESSAGE : "Could not fetch the location.GPS radio or Network disabled",
		LOCATION_ERROR_PLAY_SERVICE_NOT_AVAILABLE_MESSAGE : "Google Play Service not available on the device or is out of date",
		NOTIFIER_REQUEST_INVALID_MESSAGE : "Notifier request invalid.",
		NOTIFIER_REQUEST_ERROR_MESSAGE : "Error processing notifier request",
		//----------------------------------------------
		
		//Request Object JSON properties
		MMI_MESSAGE_PROP_TRANSACTION_ID : "transactionId",
		MMI_MESSAGE_PROP_RESPONSE_EXPECTED : "isResponseExpected",
		MMI_MESSAGE_PROP_TRANSACTION_REQUEST : "transactionRequest",
		MMI_MESSAGE_PROP_REQUEST_OPERATION_ID : "serviceOperationId",
		MMI_MESSAGE_PROP_REQUEST_DATA : "serviceRequestData",
		MMI_MESSAGE_PROP_TRANSACTION_RESPONSE : "transactionResponse",
		MMI_MESSAGE_PROP_TRANSACTION_OP_COMPLETE : "isOperationComplete",
		MMI_MESSAGE_PROP_SERVICE_RESPONSE : "serviceResponse",
		MMI_MESSAGE_PROP_RESPONSE_EX_TYPE : "exceptionType",
		MMI_MESSAGE_PROP_RESPONSE_EX_MESSAGE : "exceptionMessage",
		
		//Service Request object properties
		MMI_REQUEST_PROP_SERVICE_SHUTDOWN : "serviceShutdown",
		//UI service request
		MMI_REQUEST_PROP_MESSAGE : "message",
		MMI_REQUEST_PROP_BUTTON_TEXT : "buttonText",
		MMI_REQUEST_PROP_POSITIVE_BTN_TEXT : "positiveBtnText",
		MMI_REQUEST_PROP_NEGATIVE_BTN_TEXT : "negativeBtnText",
		MMI_REQUEST_PROP_ITEM : "item",
		//HTTP service request
		MMI_REQUEST_PROP_REQ_METHOD : "requestMethod",
		MMI_REQUEST_PROP_REQ_URL : "requestUrl",
		MMI_REQUEST_PROP_REQ_HEADER_INFO : "requestHeaderInfo",
		MMI_REQUEST_PROP_REQ_POST_BODY : "requestPostBody",
		MMI_REQUEST_PROP_REQ_CONTENT_TYPE : "requestContentType",
		MMI_REQUEST_PROP_REQ_FILE_INFO : "requestFileInformation",
		MMI_REQUEST_PROP_REQ_FILE_TO_SAVE_NAME : "requestFileNameToSave",
		MMI_REQUEST_PROP_REQ_SERVER_PROXY : "serverProxyAddress",
		MMI_REQUEST_PROP_HTTP_HEADER_KEY : "headerKey",
		MMI_REQUEST_PROP_HTTP_HEADER_VALUE : "headerValue",
		//Persistence service request
		MMI_REQUEST_PROP_STORE_NAME : "storeName",
		MMI_REQUEST_PROP_PERSIST_REQ_DATA : "requestData",
		MMI_REQUEST_PROP_PERSIST_KEY : "key",
		MMI_REQUEST_PROP_PERSIST_VALUE : "value",
		//Database service request
		MMI_REQUEST_PROP_APP_DB : "appDB",
		MMI_REQUEST_PROP_QUERY_REQUEST : "queryRequest",
		MMI_REQUEST_PROP_SHOULD_ENCRYPT_DB : "shouldEncrypt",
		//Map service request
		MMI_REQUEST_PROP_LOCATIONS : "locations",
		MMI_REQUEST_PROP_LEGENDS : "legends",
		MMI_REQUEST_PROP_LOC_LATITUDE : "locLatitude",
		MMI_REQUEST_PROP_LOC_LONGITUDE : "locLongitude",
		MMI_REQUEST_PROP_LOC_MARKER : "locMarkerPin",
		MMI_REQUEST_PROP_LOC_TITLE : "locTitle",
		MMI_REQUEST_PROP_LOC_DESCRIPTION : "locDescription",
		MMI_REQUEST_PROP_ANIMATION_TYPE : "mapAnimationType",
		MMI_REQUEST_PROP_MAP_DIV : "mapDiv",
		MMI_REQUEST_PROP_DIRECTION_DIV : "directionsDiv",
		//File read service
		MMI_REQUEST_PROP_FILE_TO_READ_NAME : "fileName",
		//Camera service
		MMI_REQUEST_PROP_CAMERA_DIR : "cameraDirection",
		MMI_REQUEST_PROP_IMG_COMPRESSION : "imageCompressionLevel",
		MMI_REQUEST_PROP_IMG_ENCODING : "imageEncoding",
		MMI_REQUEST_PROP_IMG_RETURN_TYPE : "imageReturnType",
		MMI_REQUEST_PROP_IMG_FILTER : "imageFilter",
		MMI_REQUEST_PROP_IMG_SRC : "imageSource",
		//Location service
		MMI_REQUEST_PROP_LOC_ACCURACY : "locAccuracy",
		MMI_REQUEST_PROP_LOCATION_TIMEOUT : "locTimeout",
		MMI_REQUEST_PROP_LOCATION_LASTKNOWN : "locLastKnown",
		MMI_REQUEST_PROP_LOCATION_LOADING_MESSAGE : "loadingMessage",
		// Signature service
		MMI_REQUEST_PROP_SIGN_PENCOLOR : "signPenColor",
		MMI_REQUEST_PROP_SIGN_IMG_SAVEFORMAT : "signImageSaveFormat",
		//----------------------------------------
		
								//Service Response object properties
		
		//UI service response
		MMI_RESPONSE_PROP_USER_SELECTION : "userSelection",
		MMI_RESPONSE_PROP_USER_SELECTED_INDEX : "selectedIndex",
		//HTTP service response
		MMI_RESPONSE_PROP_HTTP_RESPONSE_HEADERS : "httpResponseHeaders",
		MMI_RESPONSE_PROP_HTTP_RESPONSE : "httpResponse",
		MMI_RESPONSE_PROP_HTTP_HEADER_NAME : "headerName",
		MMI_RESPONSE_PROP_HTTP_HEADER_VALUE : "headerValue",
		//Persistence service response
		MMI_RESPONSE_PROP_STORE_NAME : "storeName",
		MMI_RESPONSE_PROP_STORE_RETURN_DATA : "storeReturnData",
		MMI_RESPONSE_PROP_STORE_KEY : "key",
		MMI_RESPONSE_PROP_STORE_VALUE : "value",
		//Database service response
		MMI_RESPONSE_PROP_APP_DB : "appDB",
		MMI_RESPONSE_PROP_DB_RECORDS : "dbRecords",
		MMI_RESPONSE_PROP_DB_ATTRIBUTE : "dbAttribute",
		MMI_RESPONSE_PROP_DB_ATTR_VALUE : "dbAttrValue",
		//Map service response
		//File Read service response
		MMI_RESPONSE_PROP_FILE_CONTENTS : "fileContents",
		MMI_RESPONSE_PROP_FILE_NAME : "fileName",
		MMI_RESPONSE_PROP_FILE_CONTENT : "fileContent",
		MMI_RESPONSE_PROP_FILE_TYPE : "fileType",
		MMI_RESPONSE_PROP_FILE_SIZE : "fileSize",
		MMI_RESPONSE_PROP_FILE_UNARCHIVE_LOCATION : "fileUnarchiveLocation",
		//Camera service response
		MMI_RESPONSE_PROP_IMAGE_URL : "imageURL",
		MMI_RESPONSE_PROP_IMAGE_DATA : "imageData",
		MMI_RESPONSE_PROP_IMAGE_TYPE : "imageType",
		//Signature service response
		MMI_RESPONSE_PROP_SIGN_IMAGE_URL : "signImageUrl",
		MMI_RESPONSE_PROP_SIGN_IMAGE_DATA : "signImageData",
		MMI_RESPONSE_PROP_SIGN_IMAGE_TYPE : "signImageType",
		//----------------------------------------
			
		//Generic constants
		RESPONSE_JSON_PROP_DATA : "data",
		//UI service
		USER_SELECTION_YES : "0",
		USER_SELECTION_NO : "1",
		USER_SELECTION_OK : "2",
		//Camera service
		CAM_PROPERTY_CAPTURE_TYPE : 'source',
		CAM_PROPERTY_IMAGE_QUALITY : 'quality',
		CAM_PROPERTY_IMG_RETURN_METHOD : 'returnType',
		CAM_PROPERTY_IMAGE_TYPE : 'encoding',
		CAM_PROPERTY_IMAGE_FORMAT : 'filter',
		CAM_PROPERTY_CAMERA_DIR : 'direction',
		IMAGE_URL : 'IMAGE_URL',
		IMAGE_DATA : 'IMAGE_DATA',
		STANDARD : 'STANDARD',
		MONOCHROME : 'MONOCHROME',
		SEPIA : 'SEPIA',
		IMAGE_JPEG : 'jpg',
		IMAGE_PNG : 'png',
		CAMERA_FRONT :'CAMERA_FRONT',
		CAMERA_BACK : 'CAMERA_BACK',
		//Map service related constants
		MAP_ANIMATION_CURL :206 ,
		MAP_ANIMATION_FLIP :204,
		
		//Database service
		DEFAULT_APP_NAME : 'appez',
		//Map service
		IS_MAP_CONTROLLER_INIT : false,
		MAP_DIRECTION_API_URL : "http://maps.google.com/maps/api/directions/json?origin={ORIGIN_LATITUDE},{ORIGIN_LONGITUDE}&destination={DESTINATION_LATITUDE},{DESTINATION_LONGITUDE}&sensor=false",
		//Location service
		LOCATION_ACCURACY_COARSE : 'coarse',
		LOCATION_ACCURACY_FINE : 'fine',
		
		
		//Constants related to Notifier
		NOTIFIER_PROP_TRANSACTION_ID : "transactionId",
		NOTIFIER_PROP_TRANSACTION_REQUEST : "notifierTransactionRequest",
		NOTIFIER_REQUEST_PROP_CALLBACK_FUNC : "notifierCallback",
		NOTIFIER_TYPE : "notifierType",
		NOTIFIER_ACTION_TYPE : "notifierActionType",
		NOTIFIER_REQUEST_DATA : "notifierRequestData",
		NOTIFIER_PROP_TRANSACTION_RESPONSE : "notifierTransactionResponse",
		NOTIFIER_EVENT_RESPONSE : "notifierEventResponse",
		NOTIFIER_OPERATION_ERROR_TYPE : "notifierErrorType",
		NOTIFIER_OPERATION_ERROR : "notifierError",
		NOTIFIER_OPERATION_IS_SUCCESS : "isOperationSuccess",
		
		//Push notifier constants
		NOTIFIER_PUSH_PROP_GCM_SERVER_URL : "gcmServerUrl",
		NOTIFIER_PUSH_PROP_GCM_SENDER_ID : "gcmSenderId",
		NOTIFIER_PUSH_PROP_ANDROID_TARGET_ACTIVITY_FG : "androidNotificationTargetActivityFg",
		NOTIFIER_PUSH_PROP_ANDROID_TARGET_ACTIVITY_BG : "androidNotificationTargetActivityBg",
		NOTIFIER_PUSH_PROP_SERVER_URL : "pushServerUrl",
		NOTIFIER_PUSH_PROP_LOADING_MESSAGE : "loadingMessage",
			
		//Standard response properties	
		NOTIFIER_PUSH_PROP_MESSAGE : "notifierPushMessage",

		NOTIFIER_RESP_NWSTATE_WIFI_CONNECTED : "wifiConnected",
		NOTIFIER_RESP_NWSTATE_CELLULAR_CONNECTED : "cellularConnected",
		NOTIFIER_RESP_NWSTATE_CONNECTED : "networkConnected"
			
		//---------------------------------------
};/** 
 * 
 *	This class represents a generic class manager.
 *	Responsible for instantiating a class, access and its life cycle.
 * 
 **/

appez.mmi.util.ClassManager = {
	className : "appez.mmi.util.ClassManager",
	singleton : true,
	classes : {},
	init : function() {

	},                         	
	
	/*
	 * Name: createClass
	 * Description: create a basic class with member variables
	 * @Params  memberVariables: names of the member variables such as methods and object
	 * Returns: class object with member variables
	 * Details about if any exception is thrown
	 */
	
	createClass : function(memberVariables) {
		if (!(memberVariables.className != undefined && memberVariables.className != "")) {
			memberVariables.className = new Date().getTime();
		}
		this.classes[memberVariables.className] = function() {
			for ( var memberVar in memberVariables) {
				this[memberVar] = memberVariables[memberVar];
			}
		};
		if (memberVariables.extend != undefined && memberVariables.extend != "") {

			if (typeof (memberVariables.extend) == "function") {
				var parentClassObj = new memberVariables.extend();
				this.classes[memberVariables.className].prototype = parentClassObj;
				this.classes[memberVariables.className].constructor = this.classes[memberVariables.className];
				this.classes[memberVariables.className].prototype.parent = parentClassObj;
			} else if (typeof (memberVariables.extend) == "object") {
				var parentClassObj = new memberVariables.extend.constructor();
				this.classes[memberVariables.className].prototype = parentClassObj;
				this.classes[memberVariables.className].constructor = this.classes[memberVariables.className];
				this.classes[memberVariables.className].prototype.parent = parentClassObj;
			}
		}

		if (memberVariables.singleton != undefined
				&& memberVariables.singleton == true) {
			return new this.classes[memberVariables.className]();
		} else {
			return this.classes[memberVariables.className];
		}
	}

};/** 
 * 
 *	This class represents a Log manager.
 *	Responsible for logging messages to console uniformly across platforms.
 * 
 **/

appez.mmi.manager.LogManager = appez.mmi.createClass({
	className:"appez.mmi.manager.LogManager",    //Contains The Class Name.
	singleton: true,
    enabled:true,                           //By default it is true , it permits framework to print logs and vice versa
     
    /*
    * Name: isEnabled
    * Description: it returns whether log is enabled or not
    * <Parameter Name>: None
    * Returns: Boolean (True or False)
    * Details about if any exception is thrown.
    */
   isEnabled:function(){
     return enabled;
   },
                                           
   setEnabled:function(enabled){
     this.enabled=enabled;
   },
   /*
    * Name: init
    * Description: intialize the log , set threshold and App mode
    * <Parameter Name>: None
    * Returns: None
    * Details about if any exception is thrown.
    */
                                        
   init:function(){
	  
   },
   
   isLogEnabled: function() {
	   
   },
       
   /*
    * Name: log
    * Description: child classes override this method for multiple platforms.
    * msg: string message that print on console
    * logLeval : leval of log , print by framework Ex: eMob.LOG_LEVAL_DEBUG
    * Returns: None
    * Details about if any exception is thrown.
    */
   log:function(msg,logLeval){
   
   }                             
});;/** 
 * 
 *	This class represents a Mobilet manager.
 *	Responsible for communication between native layer and JS layer.
 * 
 **/

appez.mmi.manager.MobiletManager = appez.mmi.createClass({
	className:"appez.mmi.manager.MobiletManager",
	singleton:true,
	
	callingService : null,
	smartEvent : null,
	
	callingNotifier: null,
	notifierEvent: null,
	
	processNativeRequest: function(service, smEvent){
		appez.mmi.log('MobiletManager->generic->processNativeRequest:'+smEvent);
		this.callingService = service;
		this.smartEvent = smEvent;
		
		return appez.mmi.util.FrameworkUtil.prepareRequestObjForNative(smEvent);
	},                         	
	
	processNativeResponse : function(responseFromNative){
//		appez.mmi.log('MobiletManager->Response from Native:'+JSON.stringify(responseFromNative));
		var nativeResponse = responseFromNative;
		
		//Delegate this 'SmartEventResponse' to the current service
		var smEventResponse = new appez.mmi.model.SmartEventResponse();
		smEventResponse.setOperationComplete(nativeResponse[appez.mmi.constant.MMI_MESSAGE_PROP_TRANSACTION_RESPONSE][appez.mmi.constant.MMI_MESSAGE_PROP_TRANSACTION_OP_COMPLETE]);
		var serviceResponse = nativeResponse[appez.mmi.constant.MMI_MESSAGE_PROP_TRANSACTION_RESPONSE][appez.mmi.constant.MMI_MESSAGE_PROP_SERVICE_RESPONSE];
		serviceResponse = appez.mmi.base64Decode(serviceResponse);
		serviceResponse = JSON.parse(serviceResponse);
		smEventResponse.setServiceResponse(serviceResponse);
		smEventResponse.setExceptionType(nativeResponse[appez.mmi.constant.MMI_MESSAGE_PROP_TRANSACTION_RESPONSE][appez.mmi.constant.MMI_MESSAGE_PROP_RESPONSE_EX_TYPE]);
		smEventResponse.setExceptionMessage(nativeResponse[appez.mmi.constant.MMI_MESSAGE_PROP_TRANSACTION_RESPONSE][appez.mmi.constant.MMI_MESSAGE_PROP_RESPONSE_EX_MESSAGE]);
		this.smartEvent.setSmartEventResponse(smEventResponse);
		
		this.callingService.processResponse(smEventResponse);
	},
	
	processNotifierRequest : function(notifier, notEvent){
		appez.mmi.log('MobiletManager->generic->processNotifierRequest:'+notEvent);
		this.callingNotifier = notifier;
		this.notifierEvent = notEvent;
		
		return appez.mmi.util.FrameworkUtil.prepareNotifierObjForNative(notEvent);
	},
	
	processNotifierResponse : function(responseFromNative){
		var nativeResponse = responseFromNative;
		
		var notifierEventResponse = new appez.mmi.model.NotifierEventResponse();
		notifierEventResponse.setOperationComplete(responseFromNative[appez.mmi.constant.NOTIFIER_PROP_TRANSACTION_RESPONSE][appez.mmi.constant.NOTIFIER_OPERATION_IS_SUCCESS]);
		notifierEventResponse.setResponse(responseFromNative[appez.mmi.constant.NOTIFIER_PROP_TRANSACTION_RESPONSE][appez.mmi.constant.NOTIFIER_EVENT_RESPONSE]);
		notifierEventResponse.setErrorType(responseFromNative[appez.mmi.constant.NOTIFIER_PROP_TRANSACTION_RESPONSE][appez.mmi.constant.NOTIFIER_OPERATION_ERROR_TYPE]);
		notifierEventResponse.setErrorMessage(responseFromNative[appez.mmi.constant.NOTIFIER_PROP_TRANSACTION_RESPONSE][appez.mmi.constant.NOTIFIER_OPERATION_ERROR]);
		this.notifierEvent.setNotifierEventResponse(notifierEventResponse);
		
		this.callingNotifier.notifierResponse(notifierEventResponse);
	},
	
	notificationFromNative : function(notification) {
		appez.mmi.getNativeListenerFunction().call(appez.mmi.getNativeListenerScope(),notification);
	},
	
	getCurrentSmartEvent : function(){
		return this.smartEvent;
	},
	
	getCurrentNotifierEvent : function(){
		return this.notifierEvent;
	}
});
;

/** 
 * 
 *	This class represents a Log Manager in Android.
 *	Logs client and User messages to the Java Script console.
 * 
 **/

appez.mmi.manager.android.LogManager = appez.mmi.createClass({
	className:"appez.mmi.manager.android.LogManager",  //Contains The Class Name.                         
	extend:appez.mmi.manager.LogManager,             //Contains Base Class Name
	singleton:true,
   
  /*
   * Name: log
   * Description: overridden  method for Android platform.
   * msg: string message that print on console
   * logLeval : leval of log , print by framework Ex: eMob.LOG_LEVAL_DEBUG
   * Returns: None
   * Details about if any exception is thrown.
   */
    log:function(msg,logLevel){
    	//TODO need to add log level based implementation for log filtering
    	if(logLevel!=undefined){
        	appezAndroid.log("Javascript Console", msg,logLevel);
    	} else {
        	appezAndroid.log("Javascript Console", msg,appez.mmi.constant.LOG_LEVEL_DEBUG);
    	}

    }
});;/** 
 * 
 *	This class represents a Mobilet Manager in Android.
 *	Acts as a bridge between JS and Native layer, Responsible for communication between
 *  Java Script side and Client side.
 * 
 **/
appez.mmi.manager.android.MobiletManager = appez.mmi.createClass({
	className:"appez.mmi.manager.android.MobiletManager",
	singleton:true,
	extend:appez.mmi.manager.MobiletManager,
	
	processNativeRequest: function(serviceObj, smartEvent){
		var requestForNative = this.parent.processNativeRequest(serviceObj, smartEvent);
		this.doNativeCommunication(JSON.stringify(requestForNative));
	},                         	
	
	processNotifierRequest : function(notifierObj, notifierEvent){
		appez.mmi.log('MobiletManager->Android->processNotifierRequest');
		var requestForNative = this.parent.processNotifierRequest(notifierObj, notifierEvent);
		this.doNativeCommunication(JSON.stringify(requestForNative));
	},
	
	/*
	 * Name: processNativeResponse
	 * Description: Processes and decode the response that comes from native layer
	 * @Params responseFromNative: response from native
	 * Returns: None
	 * Details about if any exception is thrown
	 */
	
	processNativeResponse : function(responseFromNative){
		//Handle the native response here
		appez.mmi.log('MobiletManager->Android->Response from Native:'+responseFromNative);
		this.parent.processNativeResponse(responseFromNative);
	},
	
	processNotifierResponse : function(responseFromNative){
		appez.mmi.log('MobiletManager->Android->processNotifierResponse:'+responseFromNative);
		this.parent.processNotifierResponse(responseFromNative);
	},
	
	 /**
	 * Communicates user request to native layer
	 * 
	 * @param message: message which should be communicated to user.
	 * 
	 */
	
	doNativeCommunication : function(message) {
		appez.mmi.log('MobiletManager->Android->Request for native:'+message);
		appezAndroid.onReceiveEvent(message);
	}
	
	/*doNotifierCommunication : function(message){
		appez.mmi.log('MobiletManager->Android->doNotifierCommunication:'+message);
		appezAndroid.onRegisterNotifier(message);
	}*/
});;

/** 
 * 
 *	This class represents a Log Manager in iOS.
 *	Logs client and User messages to the Java Script console.
 * 
 **/

appez.mmi.manager.ios.LogManager = appez.mmi.createClass({
	className:"appez.mmi.manager.ios.LogManager", //Contains The Class Name.
    extend:appez.mmi.manager.LogManager,             //Contains Base Class Name
    singleton:true,   
    
      /*
       * Name: log
       * Description: overridden  method for IOSplatform.
       * msg: string message that print on console
       * logLeval : leval of log , print by framework Ex: eMob.LOG_LEVAL_DEBUG
       * Returns: None
       * Details about if any exception is thrown.
       */

      log:function(msg,logLeval){
    	  //TODO need to add log level based implementation for log filtering
    	  if(msg.length > (1024*25)){
    		  msg = msg.substring(0,(1024*25)-1);
    	  }
    	  var iframe = document.createElement("IFRAME");
    	  iframe.setAttribute("src", "imrlog://" + msg);
    	  document.documentElement.appendChild(iframe);
    	  iframe.parentNode.removeChild(iframe);
    	  iframe = null;
      }
                                       
});;
/** 
 * 
 *	This class represents a Mobilet Manager in iOS.
 *	Acts as a bridge between JS and Native layer, Responsible for communication between
 *  Java Script side and Client side.
 * 
 **/


appez.mmi.manager.ios.MobiletManager = appez.mmi.createClass({
	className:"appez.mmi.manager.ios.MobiletManager",
	singleton:true,
	extend:appez.mmi.manager.MobiletManager,
	
	processNativeRequest: function(serviceObj, smartEvent){
		var requestForNative = this.parent.processNativeRequest(serviceObj, smartEvent);
		this.doNativeCommunication(JSON.stringify(requestForNative));
	},

	processNotifierRequest : function(notifierObj, notifierEvent){
		appez.mmi.log('MobiletManager->iOS->processNotifierRequest');
		var requestForNative = this.parent.processNotifierRequest(notifierObj, notifierEvent);
		this.doNativeCommunication(JSON.stringify(requestForNative));
	},
	
	/*
	 * Name: processNativeResponse
	 * Description: Processes and decode the response that comes from native layer
	 * @Params responseFromNative: response from native
	 * Returns: None
	 * Details about if any exception is thrown
	 */
	
	processNativeResponse : function(responseFromNative){
		//Handle the native response here
		appez.mmi.log('MobiletManager->iOS->Response from Native:'+responseFromNative);
		this.parent.processNativeResponse(responseFromNative);
	},
	
	processNotifierResponse : function(responseFromNative){
		appez.mmi.log('MobiletManager->iOS->processNotifierResponse:'+responseFromNative);
		this.parent.processNotifierResponse(responseFromNative);
	},
	
	 /**
	 * Communicates user request to native layer
	 * 
	 * @param message: message which should be communicated to user.
	 *          
	 */
	
	doNativeCommunication: function(message) {
      	//  document.location.href = "imr://"+message;   //changed iMr -> imr
	     var iframe = document.createElement("IFRAME");
	     iframe.setAttribute("src", "imr://"+message);
	     document.documentElement.appendChild(iframe);
	     iframe.parentNode.removeChild(iframe);
	     iframe = null;
	}
});;

/** 
 * 
 *	This class represents a Log Manager in Windows Phone.
 *	Logs client and User messages to the Java Script console.
 * 
 **/

appez.mmi.manager.wp.LogManager = appez.mmi.createClass({
	className:"appez.mmi.manager.wp.LogManager", //Contains The Class Name.
    extend:appez.mmi.manager.LogManager,             //Contains Base Class Name
    singleton:true,   
    
      /*
       * Name: log
       * Description: overridden  method for IOSplatform.
       * msg: string message that print on console
       * logLeval : leval of log , print by framework Ex: eMob.LOG_LEVAL_DEBUG
       * Returns: None
       * Details about if any exception is thrown.
       */

      log:function(msg,logLeval){
    	  //TODO need to add log level based implementation for log filtering
    	  window.external.notify("imrlog://"+msg);
      }                                       
});;
/** 
 * 
 *	This class represents a Mobilet Manager in Window Phone.
 *	Acts as a bridge between JS and Native layer, Responsible for communication between
 *      Java Script side and Client side.
 * 
 **/

appez.mmi.manager.wp.MobiletManager = appez.mmi.createClass({

	className:"appez.mmi.manager.wp.MobiletManager",
	singleton:true,
	extend:appez.mmi.manager.MobiletManager,
	
	processNativeRequest: function(serviceObj, smartEvent){
		var requestForNative = this.parent.processNativeRequest(serviceObj, smartEvent);
		this.doNativeCommunication(JSON.stringify(requestForNative));
	}, 
	
	processNotifierRequest : function(notifierObj, notifierEvent){
		appez.mmi.log('MobiletManager->WP->processNotifierRequest');
		var requestForNative = this.parent.processNotifierRequest(notifierObj, notifierEvent);
		this.doNativeCommunication(JSON.stringify(requestForNative));
	},
	
	processNativeResponse : function(responseFromNative){
		//Handle the native response here
		appez.mmi.log('MobiletManager->WP->Response from Native:'+responseFromNative);
		this.parent.processNativeResponse(responseFromNative);
	},
	
	processNotifierResponse : function(responseFromNative){
		appez.mmi.log('MobiletManager->WP->processNotifierResponse:'+responseFromNative);
		this.parent.processNotifierResponse(responseFromNative);
	},
	
	 /**
	 * Communicates user request to native layer
	 * 
	 * @param message: message which should be communicated to user.
	 *          
	 */
	
	doNativeCommunication: function(message) {
        window.external.notify("imr://"+message);   
	}
	
});;

/** 
 * 
 *	This class represents a Log Manager in Web.
 *	Logs client and User messages to the Java Script console.
 * 
 **/

appez.mmi.manager.web.LogManager = appez.mmi.createClass({
	className:"appez.mmi.manager.web.LogManager",  //Contains The Class Name.                         
    extend:appez.mmi.manager.LogManager,                     //Contains Base Class Name
    singleton:true,
   
  /*
   * Name: log
   * Description: overridden  method for Android platform.
   * msg: string message that print on console
   * logLeval : leval of log , print by framework Ex: eMob.LOG_LEVAL_DEBUG
   * Returns: None
   * Details about if any exception is thrown.
   */
    log:function(msg,logLeval){
  	  	//TODO need to add log level based implementation for log filtering
    	console.log(msg);
    }
});;appez.mmi.model.SmartEvent = appez.mmi.createClass({
	className:"appez.mmi.model.SmartEvent",
	singleton:false,
	
	transactionId : null,
	isResponseExpected : false,
	smartEventRequest : null,
	smartEventResponse : null,
	
	setTransactionId : function(transId){
		this.transactionId = transId;
	},

	setResponseExpected : function(isResponseExp){
		this.isResponseExpected = isResponseExp;
	},
	
	setSmartEventRequest : function(smEventRequest){
		this.smartEventRequest = smEventRequest;
	},
	
	setSmartEventResponse : function(smEventResponse){
		this.smartEventResponse = smEventResponse;
	},
	
	getTransactionId : function(){
		return this.transactionId;
	},

	getResponseExpected : function(){
		return this.isResponseExpected;
	},
	
	getSmartEventRequest : function(){
		return this.smartEventRequest;
	},
	
	getSmartEventResponse : function(){
		return this.smartEventResponse;
	}
});	;
/** 
 * 
 *  This class represents an Smart Event Request model and holds event configuration detail.
 *  Use to request resources and process events.
 **/

appez.mmi.model.SmartEventRequest = appez.mmi.createClass({
	className:"appez.mmi.model.SmartEventRequest",
	singleton:false,
    
    //Class member variables
    serviceOperationId : null,
    serviceRequestData : null,
    
	//Setters for SmartEventRequest parameters
	setServiceOperationId : function(operationId){
		this.serviceOperationId = operationId;
	},
	
	setServiceRequestData : function(requestData){
		this.serviceRequestData = requestData;
	},
		
	getServiceOperationId : function(){
		return this.serviceOperationId;
	},
	
	getServiceRequestData : function(){
		return this.serviceRequestData;
	}
});;
/** 
 * 
 *   This class represents an Smart Response model and holds event configuration detail.
 *   Use to send the request resource or data through the events.
 **/

appez.mmi.model.SmartEventResponse = appez.mmi.createClass({
	className:"appez.mmi.model.SmartEventResponse",
    singleton:false,
    
    isOperationComplete : false,
    serviceResponse : null,
    exceptionType : null,
    exceptionMessage : null,
    
    setOperationComplete : function(isOpComplete){
    	this.isOperationComplete = isOpComplete;
    },
    
    setServiceResponse : function(response){
    	this.serviceResponse = response;
    },
    
    setExceptionType : function(excType){
    	this.exceptionType = excType;
    },
    
    setExceptionMessage : function(excMessage){
    	this.exceptionMessage = excMessage;
    },
    
    getOperationComplete : function(){
    	return this.isOperationComplete;
    },
    
    getServiceResponse : function(){
    	return this.serviceResponse;
    },
    
    getExceptionType : function(){
    	return this.exceptionType;
    },
    
    getExceptionMessage : function(){
    	return this.exceptionMessage;
    }
});;/**
 * NotifierEvent: Model for holding the information regarding the notifier events
 */
appez.mmi.model.NotifierEvent = appez.mmi.createClass({
	className:"appez.mmi.model.NotifierEvent",
	singleton:false,
	
	transactionId : null,
	notifierEventRequest : null,
	notifierEventResponse : null,
	
	setTransactionId : function(transId){
		this.transactionId = transId;
	},

	setNotifierEventRequest : function(smEventRequest){
		this.notifierEventRequest = smEventRequest;
	},
	
	setNotifierEventResponse : function(smEventResponse){
		this.notifierEventResponse = smEventResponse;
	},
	
	getTransactionId : function(){
		return this.transactionId;
	},
	
	getNotifierEventRequest : function(){
		return this.notifierEventRequest;
	},
	
	getNotifierEventResponse : function(){
		return this.notifierEventResponse;
	}
});	;/**
 * NotifierEventRequest : Request model for managing the notifier event
 */
appez.mmi.model.NotifierEventRequest = appez.mmi.createClass({
	className:"appez.mmi.model.NotifierEventRequest",
	singleton:false,
	
	type : 0,
	actionType : 0,
	data : null,
	
	//Setters for notifier request
	setType : function(notType){
		this.type = notType;
	},
	
	setActionType : function(notActionType){
		this.actionType = notActionType;
	},
	
	setData : function(notData){
		this.data = notData;
	},
	
	//Getters for notifier request
	getType : function(){
		return this.type;
	},
	
	getActionType : function(){
		return this.actionType;
	},
	
	getData : function(){
		return this.data;
	}
});	;/**
 * NotifierEventResponse : Response model for managing the notifier event
 */
appez.mmi.model.NotifierEventResponse = appez.mmi.createClass({
	className:"appez.mmi.model.NotifierEventResponse",
	singleton:false,
	
	isOpComplete : false,
	response : null,
	errorType : 0,
	errorMessage : null,
	
	//Setters for notifier request
	setOperationComplete : function(opComplete){
		if(opComplete!=undefined){
			this.isOpComplete = opComplete;
		}		
	},
	
	setResponse : function(notifierResp){
		this.response = notifierResp;
	},
	
	setErrorType : function(errorType){
		this.errorType = errorType;
	},
	
	setErrorMessage : function(notifierErr){
		this.errorMessage = notifierErr;
	},
	
	//Getters for notifier request
	isOperationComplete : function(){
		return this.isOpComplete;
	},
	
	getResponse : function(){
		return this.response;
	},
	
	getErrorType : function(){
		return this.errorType;
	},
	
	getErrorMessage : function(){
		return this.errorMessage;
	}
});;/**
 * SmartService.js: 
 * Base class of the services. All individual service classes are derived
 * from SmartService. It exposes interface called SmartServiceListner to share
 * processing results of service with intended client
 */

appez.mmi.service.SmartEventService = appez.mmi.createClass({
	className:"appez.mmi.service.SmartEventService",         //Contains Class Name
	singleton:true,                                     //specify whethet the class is singleton object or not ,Bydefault service classes are singleton
	smEventRequest:null,                                //SmartEventRequest Object
    
	init : function(){
		
	},
	
    setSmEventRequest:function(smartEventRequest) {
//        this.smEventRequest=smartEventRequest;
    },
    
    getSmEventRequest:function(smartEventRequest){
//        return this.smEventRequest;
    },
                                                  
    processRequest: function(smartEventRequest){
		
	},
	
	processResponse: function(smartEventResponse){
	
	}
});;/** 
 * 
 *	This class represents a App Event Service.
 *	Responsible for notification of various application events.
 * 
 **/

appez.mmi.service.nativePlatform.AppEventService = appez.mmi.createClass({          
	className:"appez.mmi.service.nativePlatform.AppEventService", 	//Contains Class Name
	singleton:true,                                            		//specify whether the class is singleton object or not 
	extend:appez.mmi.service.SmartEventService,                     //Contains Base Class Name
   
	/*
	 * Name: processRequest
	 * Description: Execute SmartEventRequest object for native communication
	 * smartEventRequest: SmartEventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		this.smartEvent = smEvent;
		appez.mmi.log('AppEventService->processRequest');
		
		appez.mmi.getMobiletManager().processNativeRequest(this,smEvent);
	},
	
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(eventResponse){
		
	}
});
;/** 
 * 
 *  This class represents a Camera Service. Provides access to the camera hardware of the device.
 *  Supports capturing image from the camera or getting image from the gallery.
 *  Also allows the user to perform basic filter operations on the image such as
 *  Monochrome and Sepia
 *  Responsible for communicating camera events and configuration to native layer.
 * 
 **/


appez.mmi.service.nativePlatform.CameraService = appez.mmi.createClass({          
	className:"appez.mmi.service.nativePlatform.CameraService", 	//Contains Class Name
	singleton:true,                                            		//specify whether the class is singleton object or not
	extend:appez.mmi.service.SmartEventService,                     //Contains Base Class Name

	callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
		
	/*
	 * Name: processRequest
	 * Description: Execute SmartEventRequest object for native communication
	 * eventRequest: EventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		this.smartEvent = smEvent;
		try {
			//Check whether or not the request provided by the user has all the required fields for this service
			var requestObj = appez.mmi.util.FrameworkUtil.getRequestObjFromSmartEvent(smEvent);
			
			var requiredFields = [];
			if(requestObj[appez.mmi.constant.MMI_REQUEST_PROP_IMG_SRC]==appez.mmi.constant.LAUNCH_CAMERA){
				requiredFields = [appez.mmi.constant.MMI_REQUEST_PROP_CAMERA_DIR,appez.mmi.constant.MMI_REQUEST_PROP_IMG_RETURN_TYPE];
			} else if(requestObj[appez.mmi.constant.MMI_REQUEST_PROP_IMG_SRC]==appez.mmi.constant.LAUNCH_GALLERY){
				requiredFields = [appez.mmi.constant.MMI_REQUEST_PROP_IMG_RETURN_TYPE];
			} 
			
			if(appez.mmi.util.FrameworkUtil.eventReqHasRequiredFields(requestObj,requiredFields)){
//				appez.mmi.setSmartEventUnderExecution(true);
				appez.mmi.getMobiletManager().processNativeRequest(this,smEvent);
			} else {
				//Means that the user provided request does not have all the required request parameters. 
				//In this case, an error should be generated and should be returned to the user callback function
				var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
				this.processResponse(smEventResponse);
			}
		} catch(error){
			var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_JSON_REQUEST,error.message);
			this.processResponse(smEventResponse);
		}
	},
                                                         
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(eventResponse){
		//If the processResponse is being called, that means the service operation has completed
		appez.mmi.setSmartEventUnderExecution(false);
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, eventResponse);
	}
});
;/** 
 * 
 *	This class represents a Co-Event Service.
 *	Responsible for communicating camera events and configuration to native layer.
 * 
 **/

appez.mmi.service.nativePlatform.CoEventService = appez.mmi.createClass({          
	className:"appez.mmi.service.nativePlatform.CoEventService", //Contains Class Name
	singleton:true,                                         	//specify whether the class is singleton object or not
	extend:appez.mmi.service.SmartEventService,                 //Contains Base Class Name
	
	callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
	
	/*	
	 * Name: processRequest
	 * Description: Execute SmartEventRequest object for native communication
	 * smartEventRequest: SmartEventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		appez.mmi.log('CoEventService->processRequest');
		this.smartEvent = smEvent;
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		
		appez.mmi.getMobiletManager().processNativeRequest(this,smEvent);
	},
	
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(smartEventResponse){
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, smartEventResponse);
	}
});
;/** 
 * 
 *  This class represents a Database service Service. Provides access to the device database which is a SQLite
 *  implementation. Enables the user to create database that resides in the
 *  application sand box. Also enables user to perform basic CRUD operations.
 *  Current implementation allows for execution of queries as they are provided
 *  by the user
 *  Responsible for communicating database queries and response to and from native layer.
 * 
 **/

appez.mmi.service.nativePlatform.DatabaseService = appez.mmi.createClass({          
	className:"appez.mmi.service.nativePlatform.DatabaseService", 			//Contains Class Name
	singleton:true,                                            				//Specify whether the class is singleton object or not
	extend:appez.mmi.service.SmartEventService,                            	//Contains Base Class Name
	
	callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
		
	/*
	 * Name: processRequest
	 * Description: Execute SmartEventRequest object for native communication
	 * eventRequest: EventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		this.smartEvent = smEvent;
		try {
			//Check whether or not the request provided by the user has all the required fields for this service
			var requestObj = appez.mmi.util.FrameworkUtil.getRequestObjFromSmartEvent(smEvent);
			
			var requiredFields = [];
			if((smEvent.getSmartEventRequest().getServiceOperationId()==appez.mmi.constant.WEB_OPEN_DATABASE) || (smEvent.getSmartEventRequest().getServiceOperationId()==appez.mmi.constant.WEB_CLOSE_DATABASE)){
				requiredFields  = [appez.mmi.constant.MMI_REQUEST_PROP_APP_DB];
			} else if((smEvent.getSmartEventRequest().getServiceOperationId()==appez.mmi.constant.WEB_EXECUTE_DB_QUERY)||(smEvent.getSmartEventRequest().getServiceOperationId()==appez.mmi.constant.WEB_EXECUTE_DB_READ_QUERY)){
				requiredFields  = [appez.mmi.constant.MMI_REQUEST_PROP_APP_DB,appez.mmi.constant.MMI_REQUEST_PROP_QUERY_REQUEST];
			}
				
			if(appez.mmi.util.FrameworkUtil.eventReqHasRequiredFields(requestObj,requiredFields)){
//				appez.mmi.setSmartEventUnderExecution(true);
				appez.mmi.getMobiletManager().processNativeRequest(this,smEvent);
			} else {
				//Means that the user provided request does not have all the required request parameters. 
				//In this case, an error should be generated and should be returned to the user callback function
				var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
				this.processResponse(smEventResponse);
			}
		} catch(error){
			var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_JSON_REQUEST,error.message);
			this.processResponse(smEventResponse);
		}
	},
                                                         
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(eventResponse){
		//If the processResponse is being called, that means the service operation has completed
		appez.mmi.setSmartEventUnderExecution(false);
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, eventResponse);
	}
});		
	;/** 
 * 
 *  This class represents a File Read Service. Enables the user to read file/folder at the specified
 *  location in the Android bundled assets.
 *  Responsible for reading files.
 * 
 **/

appez.mmi.service.nativePlatform.FileService = appez.mmi.createClass({          
	className:"appez.mmi.service.nativePlatform.FileService",    	//Contains Class Name
	singleton:true,                                             		//specify whether the class is singleton object or not
	extend:appez.mmi.service.SmartEventService,                         //Contains Base Class Name
		
	callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
		
	/*
	 * Name: processRequest
	 * Description: Execute SmartEventRequest object for native communication
	 * eventRequest: EventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		this.smartEvent = smEvent;
		try {
			//Check whether or not the request provided by the user has all the required fields for this service
			var requestObj = appez.mmi.util.FrameworkUtil.getRequestObjFromSmartEvent(smEvent);
			
			var requiredFields = [appez.mmi.constant.MMI_REQUEST_PROP_FILE_TO_READ_NAME];
			
			if(appez.mmi.util.FrameworkUtil.eventReqHasRequiredFields(requestObj,requiredFields)){
//				appez.mmi.setSmartEventUnderExecution(true);
				appez.mmi.getMobiletManager().processNativeRequest(this,smEvent);
			} else {
				//Means that the user provided request does not have all the required request parameters. 
				//In this case, an error should be generated and should be returned to the user callback function
				var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
				this.processResponse(smEventResponse);
			}
		} catch(error){
			var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_JSON_REQUEST,error.message);
			this.processResponse(smEventResponse);
		}
	},
                                                         
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(eventResponse){
		//If the processResponse is being called, that means the service operation has completed
		appez.mmi.setSmartEventUnderExecution(false);
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, eventResponse);
	}
});
;/** 
 * 
 *  This class represents a HTTP Service. Performs HTTP operations. Currently supports HTTP GET,POST, PUT and DELETE
 *  operations. Also supports feature to create a DAT file dump that holds the response of HTTP operation
 *  Responsible for communication over HTTP protocol.
 * 
 **/

appez.mmi.service.nativePlatform.HttpService = appez.mmi.createClass({          
	className:"appez.mmi.service.nativePlatform.HttpService",           //Contains Class Name
	singleton:true,                                                 	//specify whether the class is singleton object or not
	extend:appez.mmi.service.SmartEventService,                         //Contains Base Class Name
    
	callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
		
	/*
	 * Name: processRequest
	 * Description: Execute SmartEventRequest object for native communication
	 * eventRequest: EventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		this.smartEvent = smEvent;
		try {
			//Check whether or not the request provided by the user has all the required fields for this service
			var requestObj = appez.mmi.util.FrameworkUtil.getRequestObjFromSmartEvent(smEvent);
			
			var requiredFields = [];
			if(smEvent.getSmartEventRequest().getServiceOperationId()==appez.mmi.constant.WEB_HTTP_REQUEST){
				requiredFields = [appez.mmi.constant.MMI_REQUEST_PROP_REQ_METHOD,appez.mmi.constant.MMI_REQUEST_PROP_REQ_URL];
			} else if(smEvent.getSmartEventRequest().getServiceOperationId()==appez.mmi.constant.WEB_HTTP_REQUEST_SAVE_DATA){
				requiredFields = [appez.mmi.constant.MMI_REQUEST_PROP_REQ_METHOD,appez.mmi.constant.MMI_REQUEST_PROP_REQ_URL,appez.mmi.constant.MMI_REQUEST_PROP_REQ_FILE_TO_SAVE_NAME];
			}					
					
			if(appez.mmi.util.FrameworkUtil.eventReqHasRequiredFields(requestObj,requiredFields)){
//				appez.mmi.setSmartEventUnderExecution(true);
				appez.mmi.getMobiletManager().processNativeRequest(this,smEvent);
			} else {
				//Means that the user provided request does not have all the required request parameters. 
				//In this case, an error should be generated and should be returned to the user callback function
				var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
				this.processResponse(smEventResponse);
			}
		} catch(error){
			var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_JSON_REQUEST,error.message);
			this.processResponse(smEventResponse);
		}
	},
                                                         
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(eventResponse){
		//If the processResponse is being called, that means the service operation has completed
		appez.mmi.setSmartEventUnderExecution(false);
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, eventResponse);
	}
});	
;/** 
 * 
 *  This class represents Location Service. Enables the user to get its current location
 * 
 **/

appez.mmi.service.nativePlatform.LocationService = appez.mmi.createClass({          
	className:"appez.mmi.service.nativePlatform.LocationService",    	//Contains Class Name
	singleton:true,                                             		//specify whether the class is singleton object or not
	extend:appez.mmi.service.SmartEventService,                         //Contains Base Class Name
		
	callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
		
	/*
	 * Name: processRequest
	 * Description: Execute SmartEventRequest object for native communication
	 * eventRequest: EventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		this.smartEvent = smEvent;
		try {
			//Check whether or not the request provided by the user has all the required fields for this service
			var requestObj = appez.mmi.util.FrameworkUtil.getRequestObjFromSmartEvent(smEvent);
			//If the user has not provided a default timeout for network request, then specify a default request timeout
			if((requestObj[appez.mmi.constant.MMI_REQUEST_PROP_LOCATION_TIMEOUT]==undefined)||(requestObj[appez.mmi.constant.MMI_REQUEST_PROP_LOCATION_TIMEOUT]==null)){
				appez.mmi.log('Timeout not specified... adding default timeout');
				requestObj[appez.mmi.constant.MMI_REQUEST_PROP_LOCATION_TIMEOUT] = appez.mmi.constant.LOCATION_SERVICE_DEFAULT_TIMEOUT;
			}
			
			var requiredFields = [appez.mmi.constant.MMI_REQUEST_PROP_LOC_ACCURACY];
			
			if(appez.mmi.util.FrameworkUtil.eventReqHasRequiredFields(requestObj,requiredFields)){
				appez.mmi.getMobiletManager().processNativeRequest(this,smEvent);
			} else {
				//Means that the user provided request does not have all the required request parameters. 
				//In this case, an error should be generated and should be returned to the user callback function
				var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
				this.processResponse(smEventResponse);
			}
		} catch(error){
			var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_JSON_REQUEST,error.message);
			this.processResponse(smEventResponse);
		}
	},
                                                         
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(eventResponse){
		//If the processResponse is being called, that means the service operation has completed
		appez.mmi.setSmartEventUnderExecution(false);
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, eventResponse);
	}
});
;/** 
 * 
 *  This class represents a Map Service. Allows the web layer to show maps in the appez powered
 *  application. Based on Google Maps v2.0 for Android. Currently this operation
 *  is supported through the CO event which means it is not purely WEB or APP
 *  event
 * Responsible for displaying platform specific map through native layer.
 * 
 **/
appez.mmi.service.nativePlatform.MapService = appez.mmi.createClass({          
	className:"appez.mmi.service.nativePlatform.MapService",     //Contains Class Name
	singleton:true,                                         	//specify whether the class is singleton object or not
	extend:appez.mmi.service.SmartEventService,                 //Contains Base Class Name
    
	callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
		
	/*
	 * Name: processRequest
	 * Description: Execute SmartEventRequest object for native communication
	 * eventRequest: EventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		this.smartEvent = smEvent;
		try {
			//Check whether or not the request provided by the user has all the required fields for this service
			var requestObj = appez.mmi.util.FrameworkUtil.getRequestObjFromSmartEvent(smEvent);
			var requiredFields = [];
			if((smEvent.getSmartEventRequest().getServiceOperationId()==appez.mmi.constant.MAPVIEW_SHOW)||(smEvent.getSmartEventRequest().getServiceOperationId()==appez.mmi.constant.MAPVIEW_SHOW_WITH_DIRECTIONS)){
				requiredFields = [appez.mmi.constant.MMI_REQUEST_PROP_LOCATIONS];
			} else if(smEvent.getSmartEventRequest().getServiceOperationId()==appez.mmi.constant.MAPVIEW_SHOW_WITH_ANIMATION){
				requiredFields = [appez.mmi.constant.MMI_REQUEST_PROP_LOCATIONS,appez.mmi.constant.MMI_REQUEST_PROP_ANIMATION_TYPE];
			}
			
			if(appez.mmi.util.FrameworkUtil.eventReqHasRequiredFields(requestObj,requiredFields)){
				//If the location details have been provided correctly, check if the user has provided the pin color in valid hex format or not
				if(this.isValidMarkerPins(requestObj)){
//					appez.mmi.setSmartEventUnderExecution(true);
					appez.mmi.getMobiletManager().processNativeRequest(this,smEvent);
				} else {
					//It means that the marker pin color was invalid
					var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
					this.processResponse(smEventResponse);
				}
			} else {
				//Means that the user provided request does not have all the required request parameters. 
				//In this case, an error should be generated and should be returned to the user callback function
				var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
				this.processResponse(smEventResponse);
			}
		} catch(error){
			var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_JSON_REQUEST,error.message);
			this.processResponse(smEventResponse);
		}
	},
	
	isValidMarkerPins: function(requestObj){
		var allLocations = requestObj[appez.mmi.constant.MMI_REQUEST_PROP_LOCATIONS];
		var isValidHexColorCode = true;
		if(allLocations.length>0){
			var allLocationsCount = allLocations.length;
			for(var location=0;location<allLocationsCount;location++){
				var markerPinColor = allLocations[location][appez.mmi.constant.MMI_REQUEST_PROP_LOC_MARKER];
				if(markerPinColor!=undefined){
					isValidHexColorCode = appez.mmi.util.GenericUtil.isValidHexColor(allLocations[location][appez.mmi.constant.MMI_REQUEST_PROP_LOC_MARKER]);
				}				
			}
		}
		console.log('MapService->isValidMarkerPins->isValidHexColorCode:'+isValidHexColorCode);
		return isValidHexColorCode;
	},
                                                         
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(eventResponse){
		//If the processResponse is being called, that means the service operation has completed
		appez.mmi.setSmartEventUnderExecution(false);
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, eventResponse);
	}
});
;/** 
 * 
 *  This class represents a Persistence Service. Allows the user to hold data in Android
 *  SharedPreferences for holding data across application's session. This service
 *  allows saving data in key-value pair, retrieving data and deleting data on
 *  the basis of key.
 *  Responsible for saving data to user local storage through native calls.
 * 
 **/


appez.mmi.service.nativePlatform.PersistenceService = appez.mmi.createClass({          
	className:"appez.mmi.service.nativePlatform.PersistenceService",     //Contains Class Name
	singleton:true,                                                 	//specify whether the class is singleton object or not
	extend:appez.mmi.service.SmartEventService,                         //Contains Base Class Name
	
	callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
		
	/*
	 * Name: processRequest
	 * Description: Execute SmartEventRequest object for native communication
	 * eventRequest: EventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		this.smartEvent = smEvent;
		try {
			//Check whether or not the request provided by the user has all the required fields for this service
			var requestObj = appez.mmi.util.FrameworkUtil.getRequestObjFromSmartEvent(smEvent);
			
			var requiredFields = [appez.mmi.constant.MMI_REQUEST_PROP_STORE_NAME,appez.mmi.constant.MMI_REQUEST_PROP_PERSIST_REQ_DATA];
			
			if(appez.mmi.util.FrameworkUtil.eventReqHasRequiredFields(requestObj,requiredFields)){
//				appez.mmi.setSmartEventUnderExecution(true);
				appez.mmi.getMobiletManager().processNativeRequest(this,smEvent);
			} else {
				//Means that the user provided request does not have all the required request parameters. 
				//In this case, an error should be generated and should be returned to the user callback function
				var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
				this.processResponse(smEventResponse);
			}
		} catch(error){
			var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_JSON_REQUEST,error.message);
			this.processResponse(smEventResponse);
		}	
	},
                                                         
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(eventResponse){
		//If the processResponse is being called, that means the service operation has completed
		appez.mmi.setSmartEventUnderExecution(false);
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, eventResponse);
	}
                       
});
;/** 
 * 
 *	This class represents a Signature Service.
 *	Responsible for capturing the user signature and getting it in either Base64 string or saved to a location.
 * 
 **/

appez.mmi.service.nativePlatform.SignatureService = appez.mmi.createClass({          
	className:"appez.mmi.service.nativePlatform.SignatureService", 	//Contains Class Name
	singleton:true,                                            		//specify whether the class is singleton object or not 
	extend:appez.mmi.service.SmartEventService,                     //Contains Base Class Name
	
	callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
   
	/*
	 * Name: processRequest
	 * Description: Execute SmartEventRequest object for native communication
	 * smartEventRequest: SmartEventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		this.smartEvent = smEvent;
		try {
			//Check whether or not the request provided by the user has all the required fields for this service
			var requestObj = appez.mmi.util.FrameworkUtil.getRequestObjFromSmartEvent(smEvent);
			var requiredFields = [appez.mmi.constant.MMI_REQUEST_PROP_SIGN_PENCOLOR,appez.mmi.constant.MMI_REQUEST_PROP_SIGN_IMG_SAVEFORMAT];
			if(appez.mmi.util.FrameworkUtil.eventReqHasRequiredFields(requestObj,requiredFields)){
//				appez.mmi.setSmartEventUnderExecution(true);
				if(appez.mmi.util.GenericUtil.isValidHexColor(requestObj[appez.mmi.constant.MMI_REQUEST_PROP_SIGN_PENCOLOR])){
					//Check if the pen color provided by the user is valid or not
					appez.mmi.getMobiletManager().processNativeRequest(this,smEvent);
				} else{
					//Means that the user provided pen color is not a valid Hex color code. 
					//In this case, an error should be generated and should be returned to the user callback function
					var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
					this.processResponse(smEventResponse);
				}
			} else {
				//Means that the user provided request does not have all the required request parameters. 
				//In this case, an error should be generated and should be returned to the user callback function
				console.error('Incorrect/Insufficient params');
				var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
				this.processResponse(smEventResponse);
			}
		} catch(error){
			console.error('Exception in Signature module:'+error.message);
			var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_JSON_REQUEST,error.message);
			this.processResponse(smEventResponse);
		}
	},
	
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(eventResponse){
		//If the processResponse is being called, that means the service operation has completed
		appez.mmi.setSmartEventUnderExecution(false);
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, eventResponse);
	}
});
;/** 
 * 
 *	This class represents a UI Service.
 *	Responsible for displaying UI components on web layer.
 * 
 **/

appez.mmi.service.nativePlatform.UIService = appez.mmi.createClass({          
	className:"appez.mmi.service.nativePlatform.UIService",              //Contains Class Name
	singleton:true,                                                 //specify whether the class is singleton object or not , default service classes are singleton
	extend:appez.mmi.service.SmartEventService,                                    //Contains Base Class Name
	
	callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
		
	/*
	 * Name: processRequest
	 * Description: Execute SmartEventRequest object for native communication
	 * eventRequest: EventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		this.smartEvent = smEvent;
		try {
			appez.mmi.log('UIService->processRequest->isSmartEventUnderExecution:'+appez.mmi.isSmartEventUnderExecution());
			//Check whether or not the request provided by the user has all the required fields for this service
			var requestObj = appez.mmi.util.FrameworkUtil.getRequestObjFromSmartEvent(smEvent);
			
			var requiredFields = [];
			requiredFields = [appez.mmi.constant.MMI_REQUEST_PROP_MESSAGE];
			appez.mmi.log('UIService->processRequest->requestObj:'+requestObj+",eventReqHasRequiredFields:"+appez.mmi.util.FrameworkUtil.eventReqHasRequiredFields(requestObj,requiredFields));
				
			if(appez.mmi.util.FrameworkUtil.eventReqHasRequiredFields(requestObj,requiredFields)){
//				appez.mmi.setSmartEventUnderExecution(true);
				appez.mmi.getMobiletManager().processNativeRequest(this,smEvent);
			} else {
				//Means that the user provided request does not have all the required request parameters. 
				//In this case, an error should be generated and should be returned to the user callback function
				var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
				this.processResponse(smEventResponse);
			}
		} catch(error){
			var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_JSON_REQUEST,error.message);
			this.processResponse(smEventResponse);
		}	
	},
                                                         
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(eventResponse){
		//If the processResponse is being called, that means the service operation has completed
		appez.mmi.setSmartEventUnderExecution(false);
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, eventResponse);
	}
});                        ;/** Provides handling of App events in the web layer.
 * 
 */
appez.mmi.service.web.AppEventService = appez.mmi.createClass({          
	className:"appez.mmi.service.web.AppEventService", 	//Contains Class Name
	singleton:true,                                            //specify whether the class is singleton object or not. By default util classes are singleton
	extend:appez.mmi.service.SmartEventService,                     //Contains Base Class Name
   
	/*
	 * Name: processRequest
	 * Description: Excecute SmartEventRequest object for native communication
	 * smartEventRequest: SmartEventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smartEventRequest){

	},
	
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(smartEventResponse){
		//No callback for APP events
	}
});
;/** Provides handling of camera in the web layer. 
 * This service uses HTML5 support for camera in the device for accessing the hardware camera in the device, if present 
 * 
 */
appez.mmi.service.web.CameraService = appez.mmi.createClass({          
	className:"appez.mmi.service.web.CameraService", 	//Contains Class Name
	singleton:true,                                            //specify whether the class is singleton object or not ,By default are singleton
	extend:appez.mmi.service.SmartEventService,                     //Contains Base Class Name
   
	/*
	 * Name: processRequest
	 * Description: Execute SmartEventRequest object for native communication
	 * smartEventRequest: SmartEventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smartEventRequest){

	},
    
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(smartEventResponse){

	}
});
;/** Provides handling of CO-events at the web layer. 
 *
 */
appez.mmi.service.web.CoEventService = appez.mmi.createClass({          
	className:"appez.mmi.service.web.CoEventService", //Contains Class Name
	singleton:true,                                         //specify whether the class is singleton object or not. By default util classes are singleton 
	extend:appez.mmi.service.SmartEventService,                            //Contains Base Class Name
	
	
	/*
	 * Name: processRequest
	 * Description: Excecute SmartEventRequest object for native communication
	 * smartEventRequest: SmartEventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smartEventRequest){

	},
	
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(smartEventResponse){

	}
});
;//TODO refactor this class contents in accordance with new structure

/** Provides support for the database service at the web layer. 
 * At web layer, this service makes use of webDB as a SQLite client. By default, Chrome and Safari have support for it
 * 
 */
appez.mmi.service.web.DatabaseService = appez.mmi.createClass({          
	className:"appez.mmi.service.web.DatabaseService", //Contains Class Name
	singleton:true,                               //specify whether the class is singleton object or not ,By default service classes are singleton
	extend:appez.mmi.service.SmartEventService,        //Contains Base Class Name
	dbInstance : null,							  //Instance of the webDB with the user specified properties
                        
    webServiceDbSize : 5 * 1024 * 1024, 		  // represents the default size of the WebDB allotted to the application. Default value is 5MB       
    
    applicationVar : null,
    callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
    
    /*
	 * Name: processRequest
	 * Description: Execute SmartEventRequest object for native communication
	 * smartEventRequest: SmartEventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		this.smartEvent = smEvent;
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		var smartEventRequest = smEvent.getSmartEventRequest();
		this.parent.smEventRequest = smEvent.getSmartEventRequest();
		switch(smartEventRequest.getServiceOperationId()){
		case appez.mmi.constant.WEB_OPEN_DATABASE:
			this.openDb(smartEventRequest);
			break;
			
		case appez.mmi.constant.WEB_EXECUTE_DB_QUERY:
			this.fireQuery(smartEventRequest);
			break;	
			
		case appez.mmi.constant.WEB_EXECUTE_DB_READ_QUERY:
			this.fireReadQuery(smartEventRequest);
			break;	
		}
	},
	
	initDb : function(applicationObj){
		this.applicationVar = applicationObj;
	},
	
	openDb : function(smEventRequest){
		//Get the application variable for initialising the 'webdb' variable.
		//TODO find out the way for getting the application variable
//		this.applicationVar = appez.smartweb.getApplication();
		var requestData = smEventRequest.getServiceRequestData();
		requestData = appez.mmi.util.Base64.decode(requestData);
    	var requestObj = JSON.parse(requestData);
		try {
			if((this.applicationVar!=null)&&(this.applicationVar!=undefined)){
				this.applicationVar.webdb = {};
				//if the user has provided the size of the database, then create the database with that size, else take the default value as 5 MB
				if((this.applicationVar.config.webDbSize!=undefined)&&(this.applicationVar.config.webDbSize!=null)){
					this.webServiceDbSize = this.applicationVar.config.webDbSize; 
				}
				this.applicationVar.webdb.db = openDatabase(""+requestObj[appez.mmi.constant.MMI_REQUEST_PROP_APP_DB], "1.0", this.applicationVar.appName+"Database Description", this.webServiceDbSize);
				this.dbInstance = this.applicationVar.webdb.db;
				if((this.dbInstance!=null)&&(this.dbInstance!=undefined)){
					this.queryCallback(null,this.dbInstance);
				} else {
					this.prepareResponse(false, null, appez.mmi.constant.DB_OPERATION_ERROR, appez.mmi.constant.DB_OPERATION_ERROR_MESSAGE);
				}
			} else {
				//Means the user has not specified configuration specifications. In this case, go ahead with the default settings
				this.applicationVar = {};
				this.applicationVar.webdb = {};
				this.applicationVar.webdb.db = openDatabase(""+requestObj[appez.mmi.constant.MMI_REQUEST_PROP_APP_DB], "1.0", appez.mmi.constant.DEFAULT_APP_NAME+"Database Description", this.webServiceDbSize);
				this.dbInstance = this.applicationVar.webdb.db;
				if((this.dbInstance!=null)&&(this.dbInstance!=undefined)){
					this.queryCallback(null,this.dbInstance);
				} else {
					this.prepareResponse(false, null, appez.mmi.constant.DB_OPERATION_ERROR, appez.mmi.constant.DB_OPERATION_ERROR_MESSAGE);
				}
			}
		} catch(error) {
			this.prepareResponse(false, null, appez.mmi.constant.DB_OPERATION_ERROR, error.message);
		}
	},
	 
	closeDb : function(smEventRequest){
		//TODO find out how to close database in webdb
	},
	
	fireQuery : function(smEventRequest){
		var me = this;
		var sqlQuery = null;
		var reqData = this.parent.smEventRequest.getServiceRequestData();
		reqData = appez.mmi.util.Base64.decode(reqData);
		reqData = JSON.parse(reqData);
		sqlQuery = reqData[appez.mmi.constant.MMI_REQUEST_PROP_QUERY_REQUEST];
		this.dbInstance.transaction(function(tx) {
			appez.mmi.log("inside fire query");
			tx.executeSql(sqlQuery, [], 
							function (tx, results) {
								appez.mmi.log("Query successfully executed:");
								me.queryCallback(tx, results);
							}, 
							function (tx, results) {
								appez.mmi.log("Error executing query:");
								me.prepareResponse(false, null, appez.mmi.constant.DB_OPERATION_ERROR, results);
							});
			});
	},
	
	queryCallback : function(tx, r){
		appez.mmi.log("Database Service->queryCallback");
		var dbResponseSuccessObj = {};
		var smEventRequest = this.parent.smEventRequest;
		var requestData = smEventRequest.getServiceRequestData();
		requestData = appez.mmi.util.Base64.decode(requestData);
    	var requestObj = JSON.parse(requestData);
		dbResponseSuccessObj[appez.mmi.constant.MMI_RESPONSE_PROP_APP_DB] = requestObj[appez.mmi.constant.MMI_REQUEST_PROP_APP_DB];
		this.prepareResponse(true, dbResponseSuccessObj, 0, null);
	},
	
	fireReadQuery : function(smEventRequest) {
		var me = this;
		var sqlQuery = null;
		var smEventRequest = this.parent.smEventRequest;
		var reqData = smEventRequest.getServiceRequestData();
		reqData = appez.mmi.util.Base64.decode(reqData);
		reqData = JSON.parse(reqData);
		sqlQuery = reqData[appez.mmi.constant.MMI_REQUEST_PROP_QUERY_REQUEST];
		this.dbInstance.transaction(function(tx) {
			tx.executeSql(sqlQuery, [], 
					function (tx, results) {
						appez.mmi.log("READ Query successfully executed:"+JSON.stringify(results.rows));
						me.readQueryCallback(tx, results,me);
					}, 
					function (tx, results) {
						appez.mmi.log("Error executing READ query:"+JSON.stringify(results));
						me.prepareResponse(false, null, appez.mmi.constant.DB_OPERATION_ERROR, results);
					});
		});
		
		
	},
	
	readQueryCallback : function(tx, results, instance){
		var smEventRequest = this.parent.smEventRequest;
		var requestData = smEventRequest.getServiceRequestData();
		requestData = appez.mmi.util.Base64.decode(requestData);
    	var requestObj = JSON.parse(requestData);
    	var dbName = requestObj[appez.mmi.constant.MMI_REQUEST_PROP_APP_DB];
    	
		var me = this;
		var dbResponse = {};
		var allRowsElement = [];
		
		var len = results.rows.length, tableRows;
		if(len > 0){
			for (tableRows = 0; tableRows < len; tableRows++){
				 var currentRow = results.rows.item(tableRows);
				 var currentRowObj = {};
//				 dbResponse[appez.mmi.constant.DB_READ_QUERY_RESPONSE_RESULTSET][tableRows] = {};
				 for(var key in currentRow){
					 currentRowObj[key] = currentRow[key];
//					 dbResponse[appez.mmi.constant.DB_READ_QUERY_RESPONSE_RESULTSET][tableRows][key] = currentRow[key];
				 }
				 allRowsElement[tableRows] = currentRowObj;
			}
			dbResponse[appez.mmi.constant.MMI_RESPONSE_PROP_APP_DB] = dbName;
			dbResponse[appez.mmi.constant.MMI_RESPONSE_PROP_DB_RECORDS] = allRowsElement;
			
			appez.mmi.log("Database response:"+JSON.stringify(dbResponse));
			this.prepareResponse(true, dbResponse, 0, null);
		} else {
			dbResponse[appez.mmi.constant.MMI_RESPONSE_PROP_APP_DB] = dbName;
			dbResponse[appez.mmi.constant.MMI_RESPONSE_PROP_DB_RECORDS] = null;
			this.prepareResponse(true, dbResponse, 0, null);
		}	
	},
	
	/*
	 * Prepares the modified SmartEvent model by adding the response to it
	 *  
	 */
	prepareResponse : function(isOperationComplete, serviceResponse, exceptionType, exceptionMessage){
		//TODO to set the response of this action in the SmartEventResponse object and return the controller using the 'processResponse' method
		var smartEventResponse = new appez.mmi.model.SmartEventResponse();
		smartEventResponse.setOperationComplete(isOperationComplete);
		smartEventResponse.setServiceResponse(serviceResponse);
		smartEventResponse.setExceptionType(exceptionType);
		smartEventResponse.setExceptionMessage(exceptionMessage);
		this.processResponse(smartEventResponse);
	},
	
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(smartEventResponse){
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, smartEventResponse);
	}
});	
;/** Provides support for the file read at the web layer. 
 * At web layer, this service makes use of AJAX call to fetch the contents of the file
 * 
 */
appez.mmi.service.web.FileService = appez.mmi.createClass({          
	className:"appez.mmi.service.web.FileService",    //Contains Class Name
	singleton:true,                                  //specify whether the class is singleton object or not ,By default service classes are singleton
	extend:appez.mmi.service.SmartEventService,           //Contains Base Class Name
	
	callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
		
    /*
     * Name: processRequest
     * Description: Execute SmartEventRequest object for native communication
     * smartEventRequest: SmartEventRequest object
     * Returns: None , transfer control to callBack method.
     * Details about if any exception is thrown.
     */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		this.smartEvent = smEvent;
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		var smartEventRequest = smEvent.getSmartEventRequest();
		this.parent.smEventRequest = smEvent.getSmartEventRequest();
		switch(smartEventRequest.getServiceOperationId()){
		case appez.mmi.constant.WEB_READ_FILE_CONTENTS:
			this.readFileContents();
			break;
		}	
	},
	
	/*
	 * Prepares the modified SmartEvent model by adding the response to it
	 *  
	 */
	prepareResponse : function(isOperationComplete, serviceResponse, exceptionType, exceptionMessage){
		//TODO to set the response of this action in the SmartEventResponse object and return the controller using the 'processResponse' method
		var smartEventResponse = new appez.mmi.model.SmartEventResponse();
		smartEventResponse.setOperationComplete(isOperationComplete);
		smartEventResponse.setServiceResponse(serviceResponse);
		smartEventResponse.setExceptionType(exceptionType);
		smartEventResponse.setExceptionMessage(exceptionMessage);
		this.processResponse(smartEventResponse);
	},
   
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(smartEventResponse){
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, smartEventResponse);
	},
	
	/*
     * Name: readFileContents
     * Description: method that reads the contents of the file using AJAX
     * Returns: None
     * Details about if any exception is thrown.
     */
	readFileContents : function(){
		var smEventRequest = this.parent.smEventRequest;
		var requestData = smEventRequest.getServiceRequestData();
		requestData = appez.mmi.util.Base64.decode(requestData);
    	var requestObj = JSON.parse(requestData);
    	
    	var request = {};
    	request['requestMethod'] = 'GET';
    	var fileName = requestObj['fileName'];
    	fileName = fileName.replace(/\//g, "\\");
    	request['requestUrl'] = fileName;
		appez.mmi.util.Ajax.performAjaxOperation(this.fileOperationSuccess,this.fileOperationError,this,request);
	},
	
	/*
	 * Name: fileOperationSuccess
	 * Description: callback method that returns data to native.
	 * Returns: None
	 * Details about if any exception is thrown.
	 */
	fileOperationSuccess : function(response,textStatus,jqXHR){
    	var fileContentEncode = appez.mmi.util.Base64.encode(response);
    	var smEventRequest = this.parent.smEventRequest;
		var requestData = smEventRequest.getServiceRequestData();
		requestData = appez.mmi.util.Base64.decode(requestData);
    	var requestObj = JSON.parse(requestData);
    	var fileName = requestObj['fileName'];
    	
    	var fileContentsArray = [];
    	var fileContent = {};
    	fileContent[appez.mmi.constant.MMI_RESPONSE_PROP_FILE_NAME] = fileName;
		fileContent[appez.mmi.constant.MMI_RESPONSE_PROP_FILE_CONTENT] = fileContentEncode;
		fileContent[appez.mmi.constant.MMI_RESPONSE_PROP_FILE_TYPE] = "";
		fileContent[appez.mmi.constant.MMI_RESPONSE_PROP_FILE_SIZE] = 0;
		fileContentsArray[0] = fileContent;
    	
		this.prepareResponse(true, fileContentsArray, 0, null);    	
	},

	/*
	 * Name: fileOperationError
	 * Description: callback method that returns data to native.
	 * Returns: None
	 * Details about if any exception is thrown.
	 */
	fileOperationError : function(jqXHR,textStatus,error){
		this.prepareResponse(false, null, appez.mmi.FILE_READ_EXCEPTION, null);
	}
});
;/** Provides support for HTTP requests at the web layer. 
 * At web layer, this service makes use of AJAX utility for making HTTP calls.
 * 
 */
appez.mmi.service.web.HttpService = appez.mmi.createClass({          
	className:"appez.mmi.service.web.HttpService",          //Contains Class Name
	singleton:true,                                    //specify whether the class is singleton object or not.By default service classes are singleton
	extend:appez.mmi.service.SmartEventService,             //Contains Base Class Name
	
	callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
    
    /*
     * Name: processRequest
     * Description: Excecute SmartEventRequest object for native communication
     * smartEventRequest: SmartEventRequest object
     * Returns: None , transfer control to callBack method.
     * Details about if any exception is thrown.
     */

	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		this.smartEvent = smEvent;
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		var smartEventRequest = smEvent.getSmartEventRequest();
		this.parent.smEventRequest = smEvent.getSmartEventRequest();
		switch(smartEventRequest.getServiceOperationId()){
		case appez.mmi.constant.WEB_HTTP_REQUEST:
			var reqData = this.parent.smEventRequest.getServiceRequestData();
			reqData = appez.mmi.util.Base64.decode(reqData);
			reqData = JSON.parse(reqData);
			var requestUrl = reqData[appez.mmi.constant.MMI_REQUEST_PROP_REQ_URL];
			var currentPageOrigin = window.location.origin;
			if(appez.getDeviceOs()==appezDevice.DEVICE_OS.WEB){
				this.executeHttpProxyRequest();
			} else {
				this.executeHttpRequest();
			}	
			break;
			
		case appez.mmi.constant.WEB_HTTP_REQUEST_SAVE_DATA:
			//TODO throw a ServiceNotSupportedException to the user
			break;
		}
	},
	
	/*
	 * Prepares the modified SmartEvent model by adding the response to it
	 *  
	 */
	prepareResponse : function(isOperationComplete, serviceResponse, exceptionType, exceptionMessage){
		//TODO to set the response of this action in the SmartEventResponse object and return the controller using the 'processResponse' method
		var smartEventResponse = new appez.mmi.model.SmartEventResponse();
		smartEventResponse.setOperationComplete(isOperationComplete);
		smartEventResponse.setServiceResponse(serviceResponse);
		smartEventResponse.setExceptionType(exceptionType);
		smartEventResponse.setExceptionMessage(exceptionMessage);
		this.processResponse(smartEventResponse);
	},
	
   /*
    * Name: processResponse
    * Description: Here we get control after SmartEventRequest object processed.
    * smartEventResponse: SmartEventResponse object
    * Returns: None 
    * Details about if any exception is thrown.
    */
	processResponse: function(smartEventResponse){
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, smartEventResponse);
	},
	
   /*
    * Name: executeHttpRequest
    * Description: Executes the HTTP request using AJAX, based on the DataRequest parameters provided in the 'SmartEventRequest' 
    * Returns: None
    * Details about if any exception is thrown.
    */
	executeHttpRequest : function(){
		appez.mmi.util.Ajax.performAjaxOperation(this.httpOperationSuccess,this.httpOperationError,this,this.parent.smEventRequest.getDataRequest());
	},

	/*
    * Name: executeHttpProxyRequest
    * Description: Executes the HTTP proxy request using AJAX, based on the DataRequest parameters provided in the 'SmartEventRequest' 
    * Returns: None
    * Details about if any exception is thrown.
    */
	executeHttpProxyRequest : function(){
		var me =this;
		var reqData = this.parent.smEventRequest.getServiceRequestData();
		reqData = appez.mmi.util.Base64.decode(reqData);
		reqData = JSON.parse(reqData);
		var httpRequest = JSON.stringify(reqData);
		
		appez.mmi.log("Sending request:"+httpRequest);	
		var requestUrl = null;
		if(reqData[appez.mmi.constant.MMI_REQUEST_PROP_REQ_SERVER_PROXY]!=undefined){
			requestUrl = reqData[appez.mmi.constant.MMI_REQUEST_PROP_REQ_SERVER_PROXY];
		} else {
			requestUrl = null;
		}
		var jqxhr = $.ajax({
			type: 'POST',
			url: requestUrl,
			data: "",
			beforeSend: function (request)
            {
				if(httpRequest!=null){
					request.setRequestHeader('requestData', httpRequest);
				}
            },
			async:false
		}).done(function(response, textStatus, jqXHR) {
			appez.mmi.log("AJAX success->Response:"+response+",Text status:"+textStatus);
			me.httpOperationSuccess(response, textStatus, jqXHR);			
		}).fail(function(jqXHR, textStatus, error) {
			appez.mmi.log("AJAX error->Error thrown:"+error+",text status:"+textStatus);
			me.httpOperationError(jqXHR, textStatus, error);			
		}).always(function() {
			appez.mmi.log("AJAX COMPLETE");
		});
	},
	
	/*
	 * Name: httpOperationSuccess
	 * Description: callback method that returns data to native.
	 * Returns: None
	 * Details about if any exception is thrown.
	 */
	httpOperationSuccess : function(response,textStatus,jqXHR){
		appez.mmi.log('HttpService->httpOperationSuccess->response:'+response);
		this.prepareResponse(true, JSON.parse(response), 0, null);
	},

	/*
	 * Name: httpOperationError
	 * Description: callback method that returns data to native.
	 * Returns: None
	 * Details about if any exception is thrown.
	 */
	httpOperationError : function(jqXHR,textStatus,error){
		appez.mmi.log('HttpService->httpOperationError');
		this.prepareResponse(false, null, appez.mmi.constant.HTTP_PROCESSING_EXCEPTION, error);		
	}
});	
;/** Provides handling of App events in the web layer.
 * 
 */
appez.mmi.service.web.LocationService = appez.mmi.createClass({          
	className:"appez.mmi.service.web.LocationService", 	//Contains Class Name
	singleton:true,                                            //specify whether the class is singleton object or not. By default util classes are singleton
	extend:appez.mmi.service.SmartEventService,                     //Contains Base Class Name
   
	/*
	 * Name: processRequest
	 * Description: Excecute SmartEventRequest object for native communication
	 * smartEventRequest: SmartEventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smartEventRequest){

	},
	
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(smartEventResponse){
		//No callback for APP events
	}
});
;/** Provides support for the map service at the web layer. 
 * At web layer, this service makes use of Google maps API's for getting maps data.
 * 
 */
appez.mmi.service.web.MapService = appez.mmi.createClass({          
	className:"appez.mmi.service.web.MapService",     	// Contains Class Name
	singleton:true,                              		// specify whether the class is singleton object or not ,By default service classes are singleton
	extend:appez.mmi.service.SmartEventService,       	// Contains Base Class Name
	map : null,
	mapLocations : [],
	currentUserLocationMarker : null,
	currentUserLocation : null,
	shouldShowDirectionsScreen : false,
	
	callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
	
//	isMapControllerInit : false,
	mapScreenDiv : null,
		
    /*
	 * Name: processRequest Description: Execute SmartEventRequest object for
	 * native communication smartEventRequest: SmartEventRequest object Returns:
	 * None , transfer control to callBack method. Details about if any
	 * exception is thrown.
	 */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		appez.mmi.log('MapService(web)->processRequest->IS_MAP_CONTROLLER_INIT:'+appez.mmi.constant.IS_MAP_CONTROLLER_INIT);
		this.smartEvent = smEvent;
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		var smartEventRequest = smEvent.getSmartEventRequest();
		this.parent.smEventRequest = smEvent.getSmartEventRequest();
		
		this.initMapLocations();
		
		switch(smartEventRequest.getServiceOperationId()){
		case appez.mmi.constant.MAPVIEW_SHOW:
			this.showMap();
			break;
			
		case appez.mmi.constant.MAPVIEW_SHOW_WITH_DIRECTIONS:
			this.showMapWithDirections();
			break;
			
		case appez.mmi.constant.MAPVIEW_SHOW_WITH_ANIMATION:
			// Currently this sub-service is not supported at the web layer
			this.prepareResponse(false, null, appez.mmi.constant.SERVICE_TYPE_NOT_SUPPORTED_EXCEPTION, appez.mmi.constant.UNABLE_TO_PROCESS_MESSAGE);
			break;	
		}
	},
   
	/*
	 * Prepares the modified SmartEvent model by adding the response to it
	 *  
	 */
	prepareResponse : function(isOperationComplete, serviceResponse, exceptionType, exceptionMessage){
		//TODO to set the response of this action in the SmartEventResponse object and return the controller using the 'processResponse' method
		var smartEventResponse = new appez.mmi.model.SmartEventResponse();
		smartEventResponse.setOperationComplete(isOperationComplete);
		smartEventResponse.setServiceResponse(serviceResponse);
		smartEventResponse.setExceptionType(exceptionType);
		smartEventResponse.setExceptionMessage(exceptionMessage);
		this.processResponse(smartEventResponse);
	},
	
	/*
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(smartEventResponse){
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, smartEventResponse);
	},
	
	showMap : function(smartEventRequest){
		this.shouldShowDirectionsScreen = false;
		this.drawMap();
	},
	
	showMapWithDirections : function(smartEventRequest){
		this.shouldShowDirectionsScreen = true;
		this.drawMap();
	},
	
	initMapLocations : function(){
		var reqData = this.parent.smEventRequest.getServiceRequestData();
		reqData = appez.mmi.util.Base64.decode(reqData);
		reqData = JSON.parse(reqData);
//		var mapRequest = JSON.stringify(reqData);
		this.mapLocations = reqData[appez.mmi.constant.MMI_REQUEST_PROP_LOCATIONS];
	},
	
	checkCurrentUserLocation : function(bounds,map){
		var me = this;
		var marker = null;
		var infowindow = new google.maps.InfoWindow();
		// Check to see if this browser supports geolocation.
		if (navigator.geolocation) {
			// Get the location of the user's browser using the
			// native geolocation service. When we invoke this method
			// only the first callback is required. The second
			// callback - the error handler - and the third
			// argument - our configuration options - are optional.
			navigator.geolocation.getCurrentPosition(function( position ){
					// Check to see if there is already a location.
					// There is a bug in FireFox where this gets
					// invoked more than once with a cached result.
					appez.mmi.log("Initial Position Found->Latitude:" +position.coords.latitude+",Longitude:"+position.coords.longitude);
					 
					// Add a marker to the map using the position.
					me.currentUserLocation = position;
					me.markCurrentLocationOnMap(position, bounds, map);
					currentLocation = position;
				},
				function( error ){
					appez.mmi.log( "Something went wrong: ", error );
					//TODO throw an error here
					me.prepareResponse(false, null, appez.mmi.constant.UNKNOWN_CURRENT_LOCATION_EXCEPTION, appez.mmi.constant.UNKNOWN_CURRENT_LOCATION_EXCEPTION_MESSAGE);
				},				
				{
					timeout: (5 * 1000),
					maximumAge: (1000 * 60 * 15),
					enableHighAccuracy: true
				}
			);
		}
	},
	
	markCurrentLocationOnMap : function(position, bounds, map){
		var infowindow = new google.maps.InfoWindow({
		      maxWidth: 200
		  });
		/*-var image = {
				url: this.mapPins['currentLocation'],
				// This marker is 20 pixels wide by 32 pixels tall.
			    size: new google.maps.Size(20, 32),
			    // The origin for this image is 0,0.
			    origin: new google.maps.Point(0,0),
			    // The anchor for this image is the base of the flagpole at 0,32.
			    anchor: new google.maps.Point(0, 32)
		};*/
		
		// Shapes define the clickable region of the icon.
		// The type defines an HTML &lt;area&gt; element 'poly' which
		// traces out a polygon as a series of X,Y points. The final
		// coordinate closes the poly by connecting to the first
		// coordinate.
		var shape = {
				coord: [1, 1, 1, 20, 18, 20, 18 , 1],
				type: 'poly'
		};
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
			map: map,
			/*icon: image,*/
	        shape: shape
		});
		bounds.extend(marker.position);
		google.maps.event.addListener(marker, 'click', (function(marker) {
			return function() {
				infowindow.setContent("You are here");
				infowindow.open(map, marker);
			}
		})(marker));
		
		//now fit the map to the newly inclusive bounds
		map.fitBounds(bounds);
	},
	
	drawMap : function(){
		var me = this;	
		//create empty LatLngBounds object
		var bounds = new google.maps.LatLngBounds();
		
		var reqData = this.parent.smEventRequest.getServiceRequestData();
		reqData = appez.mmi.util.Base64.decode(reqData);
		reqData = JSON.parse(reqData);
//		var mapRequest = JSON.stringify(reqData);
		var currentMapDiv = reqData[appez.mmi.constant.MMI_REQUEST_PROP_MAP_DIV];
		var map = new google.maps.Map(document.getElementById(currentMapDiv), {
			zoom: 10,
			center: new google.maps.LatLng(22, 76),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});
		
		var marker, mapLocation;
		for (mapLocation = 0; mapLocation < me.mapLocations.length; mapLocation++) { 
			/*-var image = {
					url: me.mapPins[''+me.mapLocations[mapLocation][appez.mmi.constant.MMI_REQUEST_PROP_LOC_MARKER]],
					// This marker is 20 pixels wide by 32 pixels tall.
				    size: new google.maps.Size(20, 32),
				    // The origin for this image is 0,0.
				    origin: new google.maps.Point(0,0),
				    // The anchor for this image is the base of the flagpole at 0,32.
				    anchor: new google.maps.Point(0, 32)
			};*/
			
			// Shapes define the clickable region of the icon.
			// The type defines an HTML &lt;area&gt; element 'poly' which
			// traces out a polygon as a series of X,Y points. The final
			// coordinate closes the poly by connecting to the first
			// coordinate.
			var shape = {
					coord: [1, 1, 1, 20, 18, 20, 18 , 1],
					type: 'poly'
			};
			 
			appez.mmi.log('MapService(web):Latitude:'+me.mapLocations[mapLocation][appez.mmi.constant.MMI_REQUEST_PROP_LOC_LATITUDE]+',Longitude:'+me.mapLocations[mapLocation][appez.mmi.constant.MMI_REQUEST_PROP_LOC_LONGITUDE]);
			var markerPosition = new google.maps.LatLng(me.mapLocations[mapLocation][appez.mmi.constant.MMI_REQUEST_PROP_LOC_LONGITUDE], me.mapLocations[mapLocation][appez.mmi.constant.MMI_REQUEST_PROP_LOC_LONGITUDE]);

			marker = new google.maps.Marker({
				position: markerPosition,
				map: map
				/*-icon: image,
		        shape: shape*/
			});
			
			appez.mmi.log('MapService(web):Title:'+me.mapLocations[mapLocation][appez.mmi.constant.MMI_REQUEST_PROP_LOC_TITLE]+',Description:'+me.mapLocations[mapLocation][appez.mmi.constant.MMI_REQUEST_PROP_LOC_DESCRIPTION]);
			var infowindow = new google.maps.InfoWindow({
				maxWidth: 200,
				content :'<h1>'+me.mapLocations[mapLocation][appez.mmi.constant.MMI_REQUEST_PROP_LOC_TITLE]+'</h1><p>'+me.mapLocations[mapLocation][appez.mmi.constant.MMI_REQUEST_PROP_LOC_DESCRIPTION]+'</p><button type="button" id="myBtn" onclick="appez.mmi.service.web.MapService.showDirectionsScreen('+markerPosition.lat()+","+markerPosition.lng()+');">Get directions to here</button>'
			});
			
			//extend the bounds to include each marker's position
			bounds.extend(marker.position);

			google.maps.event.addListener(marker, 'click', (function(marker, mapLocation) {
				return function() {
					infowindow.open(map, marker);
				}
			})(marker, mapLocation));
			
			google.maps.event.addListener(infowindow, 'domready', function() {
			      appez.mmi.log('InfoWindow DOM ready');
			});
		}
		
		this.checkCurrentUserLocation(bounds,map);
		this.prepareResponse(true, {}, 0, null);
	},
	
	//LOGIC FOR CREATING THE DIRECTIONS SCREEN 
	//TODO add the logic for calling this function when the info window is clicked and also provide the position of the point
	showDirectionsScreen : function(destLatitude,destLongitude){
		appez.mmi.log('show direction screen');
		if((this.currentUserLocation!=null)&&(this.currentUserLocation!=undefined)){
			//TODO Un-comment this code in actual implementation
//			this.getDirectionsData(this.currentUserLocation.coords.latitude, this.currentUserLocation..coords.longitude, destLatitude, destLongitude);
		}	
		this.getDirectionsData(22.06,78.1,22.66, 78.11);
	},
	
	getDirectionsData : function(sourceLat,sourceLong,destLat,destLong){
		appez.mmi.log('MapService->getDirectionsData');
		
		var urlString = appez.mmi.constant.MAP_DIRECTION_API_URL;
		urlString = urlString.replace("{ORIGIN_LATITUDE}",sourceLat);
		urlString = urlString.replace("{ORIGIN_LONGITUDE}",sourceLong);
		urlString = urlString.replace("{DESTINATION_LATITUDE}",destLat);
		urlString = urlString.replace("{DESTINATION_LONGITUDE}",destLong);
		appez.mmi.log('getDirectionsData->urlString:'+urlString);
		
		var reqData = this.parent.smEventRequest.getServiceRequestData();
		reqData = appez.mmi.util.Base64.decode(reqData);
		reqData = JSON.parse(reqData);
		var serverProxyAddress = reqData[appez.mmi.constant.MMI_REQUEST_PROP_REQ_SERVER_PROXY];
		
		var mapDirectionRequest = {
				'requestMethod':'GET',
				'requestUrl':urlString,
				'serverProxyAddress':serverProxyAddress
		};
		appez.mmi.executeHttpRequest(mapDirectionRequest, this.getDirectionsCallback, this);
	},
	
	getDirectionsCallback : function(smartEventResponse){
		var directionsData = smartEventResponse.getServiceResponse()[appez.mmi.constant.MMI_RESPONSE_PROP_HTTP_RESPONSE];
		appez.mmi.log('getDirectionsCallback->direction data:'+directionsData);
		directionsData = JSON.parse(directionsData);
		if(smartEventResponse.getOperationComplete()==true){
			var routesArray = directionsData['routes'];
			if (routesArray.length >= 0) {
				var htmlString = '<div class="list"> {DIRECTION-ROWS} </div>';
				var legsArray = routesArray[0]['legs'];
				var stepsArray = legsArray[0]['steps'];
				var directionRows = '';
				for (var i = 0; i < stepsArray.length; i++) {
					var json = stepsArray[i];
					var directionRow = '<div id="1001" class="listrow"> <span> <p>{DIRECTION}</p> </span> </div>';
					directionRow = directionRow.replace('{DIRECTION}',json['html_instructions']);
//					htmlString += "<li style='border-bottom:#999 thin solid; padding:10px 0px 10px 10px;'>";
//					htmlString += json['html_instructions'];
//					htmlString += "</li>";
					directionRows+=directionRow;
				}
//				htmlString += "</ul></div>";
				htmlString = htmlString.replace('{DIRECTION-ROWS}',directionRows);
				var reqData = this.parent.smEventRequest.getServiceRequestData();
				reqData = appez.mmi.util.Base64.decode(reqData);
				reqData = JSON.parse(reqData);
				var directionDiv = reqData[appez.mmi.constant.MMI_REQUEST_PROP_DIRECTION_DIV];
				$('#'+directionDiv).html(htmlString);
			}
			this.prepareResponse(true, {}, 0, null);
		} else {
			this.prepareResponse(false, null, appez.mmi.constant.UNKNOWN_EXCEPTION, appez.mmi.constant.UNABLE_TO_PROCESS_MESSAGE);
		}
	}
});
;/** Provides support for the persistence storage at the web layer. 
 * At web layer, this service makes use of 'localStorage' for storing persistent data. 
 * 
 */
appez.mmi.service.web.PersistenceService = appez.mmi.createClass({          
	className:"appez.mmi.service.web.PersistenceService",     //Contains Class Name
	singleton:true,                                    	 //specify whether the class is singleton object or not ,By default service classes are singleton
	extend:appez.mmi.service.SmartEventService,               //Contains Base Class Name
	
	callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
	
  /*
   * Name: processRequest
   * Description: Execute SmartEventRequest object for native communication
   * smartEventRequest: SmartEventRequest object
   * Returns: None , transfer control to callBack method.
   * Details about if any exception is thrown.
   */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		this.smartEvent = smEvent;
		
		var smartEventRequest = smEvent.getSmartEventRequest();
		this.parent.smEventRequest = smartEventRequest;
		switch(smartEventRequest.getServiceOperationId()){
		//Add cases for handling saving, retrieving and deleting data from persistence
		case appez.mmi.constant.WEB_SAVE_DATA_PERSISTENCE:
			this.saveDataToPersistence();
			break;
			
		case appez.mmi.constant.WEB_RETRIEVE_DATA_PERSISTENCE:
			this.retrieveDataFromPersistence();
			break;
			
		case appez.mmi.constant.WEB_DELETE_DATA_PERSISTENCE:
			this.deleteDataFromPersistence();
			break;	
		}
	},
	
	saveDataToPersistence : function(){
        var dataStr = this.parent.smEventRequest.getServiceRequestData();
        if(dataStr!=null && dataStr.length>0){
        	dataStr = appez.mmi.util.Base64.decode(dataStr);
        	var dataToSave = JSON.parse(dataStr);
        	var storeName = dataToSave[appez.mmi.constant.MMI_REQUEST_PROP_STORE_NAME];
        	var serviceResponse = null;
        	var persistentStorageData = {};
        	if(storeName in localStorage){
            	persistentStorageData = JSON.parse(localStorage.getItem(storeName));
            } 
        	var dataToSave = dataToSave[appez.mmi.constant.MMI_REQUEST_PROP_PERSIST_REQ_DATA];
        	if(dataToSave!=undefined && dataToSave!=null && (dataToSave instanceof Array)){
        		var elementsInArray = dataToSave.length;
        		for(var fieldToSave=0;fieldToSave<elementsInArray;fieldToSave++){
        			var currentElement = dataToSave[fieldToSave];
        			persistentStorageData[currentElement[appez.mmi.constant.MMI_REQUEST_PROP_PERSIST_KEY]] = currentElement[appez.mmi.constant.MMI_REQUEST_PROP_PERSIST_VALUE];
        		}
        		localStorage.setItem(storeName, JSON.stringify(persistentStorageData));
        		//appez.mmi.log("Data to save:Store name:"+storeName+",data to store:"+JSON.stringify(dataToSave));
        		var storeResponseObj = {};
				storeResponseObj[appez.mmi.constant.MMI_RESPONSE_PROP_STORE_NAME] = storeName;
				storeResponseObj[appez.mmi.constant.MMI_RESPONSE_PROP_STORE_RETURN_DATA] = null;
				serviceResponse = storeResponseObj;
        	} else {
        		//TODO handle this by sending the error in response
        	}
            
            this.prepareResponse(true, serviceResponse, 0, null);
        }
	},

	retrieveDataFromPersistence : function(){
		var retrieveFilter = this.parent.smEventRequest.getServiceRequestData();
		if(retrieveFilter!=null && retrieveFilter.length>0){
			retrieveFilter = appez.mmi.util.Base64.decode(retrieveFilter);
			retrieveFilter = JSON.parse(retrieveFilter);
			var storeName = retrieveFilter[appez.mmi.constant.MMI_REQUEST_PROP_STORE_NAME];
			var serviceResponse = null;
			var retrieveDataString = "";
			var retrieveParameters = retrieveFilter[appez.mmi.constant.MMI_REQUEST_PROP_PERSIST_REQ_DATA];
			var retrievedElementsArray = [];
			
			var responseElement = {};
			//If all the records needs to be retrieved for a particular SharedPreference
			if(retrieveParameters[0][appez.mmi.constant.MMI_REQUEST_PROP_PERSIST_KEY]==appez.mmi.constant.RETRIEVE_ALL_FROM_PERSISTENCE){
				var localStorageData = JSON.parse(localStorage.getItem(storeName));
				var elementArrayIndex = 0;
				for(var key in localStorageData){
					appez.mmi.log("Retrieved key:"+key+",with value:"+localStorageData[key]);
					responseElement = {};
					responseElement[appez.mmi.constant.MMI_RESPONSE_PROP_STORE_KEY] = key;
					responseElement[appez.mmi.constant.MMI_RESPONSE_PROP_STORE_VALUE] = localStorageData[key];
					retrievedElementsArray[elementArrayIndex] = responseElement;
					elementArrayIndex = elementArrayIndex+1;
//					retrieveDataString = retrieveDataString + key + appez.mmi.constant.PERSISTENT_DATA_KEY_VALUE_SEPARATOR + localStorageData[key] + appez.mmi.constant.PERSISTENT_RESPONSE_KEY_VALUE_PAIR_SEPARATOR; 
				}
			} 
			//If record needs to be retrieved based on the key
			else {
				var localStorageData = JSON.parse(localStorage.getItem(storeName));	
				if(localStorageData!=null && localStorageData!=undefined){
					var keysToRetrieveCount = retrieveParameters.length;
					var elementArrayIndex = 0;
					for(var currentKey=0;currentKey<keysToRetrieveCount;currentKey++){
						responseElement[appez.mmi.constant.MMI_RESPONSE_PROP_STORE_KEY] = retrieveParameters[currentKey][appez.mmi.constant.MMI_REQUEST_PROP_PERSIST_KEY];
						responseElement[appez.mmi.constant.MMI_RESPONSE_PROP_STORE_VALUE] = localStorageData[retrieveParameters[currentKey][appez.mmi.constant.MMI_REQUEST_PROP_PERSIST_KEY]];
						retrievedElementsArray[elementArrayIndex] = responseElement;
						elementArrayIndex = elementArrayIndex+1;
					}
				} else {
					retrieveDataString = null;
				}
			}
			var storeResponseObj = {};
			storeResponseObj[appez.mmi.constant.MMI_RESPONSE_PROP_STORE_NAME] = storeName;
			storeResponseObj[appez.mmi.constant.MMI_RESPONSE_PROP_STORE_RETURN_DATA] = JSON.stringify(retrievedElementsArray);
			serviceResponse = storeResponseObj;
			this.prepareResponse(true, serviceResponse, 0, null);
		} else {
			//TODO handle this error scenario
		}
	},
	
	deleteDataFromPersistence : function(){
		var dataStr = this.parent.smEventRequest.getServiceRequestData();
		if(dataStr!=null && dataStr.length>0){
        	dataStr = appez.mmi.util.Base64.decode(dataStr);
        	var dataToDelete = JSON.parse(dataStr);
        	var storeName = dataToDelete[appez.mmi.constant.MMI_REQUEST_PROP_STORE_NAME];
        	var serviceResponse = null;
        	var persistentStorageData = {};
        	dataToDelete = dataToDelete[appez.mmi.constant.MMI_REQUEST_PROP_PERSIST_REQ_DATA];
        	var itemsToDelete = dataToDelete.length;
    		if(itemsToDelete>=1){
    			var elementsInStorage = JSON.parse(localStorage.getItem(storeName));
    			if(elementsInStorage!=null && elementsInStorage!=undefined){
    				//need to check the number of elements for more than one to ensure that at least one key has been specified by the user for deletion
    				for(var nodeToDelete=0;nodeToDelete<itemsToDelete;nodeToDelete++){
    					//appez.mmi.log("Data to delete:Store name:"+storeName+",data to remove:"+dataToDelete[nodeToDelete][appez.mmi.constant.MMI_REQUEST_PROP_PERSIST_KEY]);
    					//check if the persistence store exists or not
    					if(storeName in localStorage){
    						delete elementsInStorage[dataToDelete[nodeToDelete][appez.mmi.constant.MMI_REQUEST_PROP_PERSIST_KEY]];
    					}
    				}
    				//once the loop has been traversed, that means all the required keys have been removed from the storage variable
    				//now we need to save the elements back into the 'localStorage'
    				//appez.mmi.log("DELETE DATA FROM PERSISTENCE->new data to save:"+JSON.stringify(elementsInStorage));
    				localStorage.setItem(storeName,JSON.stringify(elementsInStorage));
    			}    			
    		}
    		
    		var storeResponseObj = {};
    		storeResponseObj[appez.mmi.constant.MMI_RESPONSE_PROP_STORE_NAME] = storeName;
    		storeResponseObj[appez.mmi.constant.MMI_RESPONSE_PROP_STORE_RETURN_DATA] = null;
    		serviceResponse = storeResponseObj;
    		this.prepareResponse(true, serviceResponse, 0, null);
		}	
	},
	
	/*
	 * Prepares the modified SmartEvent model by adding the response to it
	 *  
	 */
	prepareResponse : function(isOperationComplete, serviceResponse, exceptionType, exceptionMessage){
		//TODO to set the response of this action in the SmartEventResponse object and return the controller using the 'processResponse' method
		var smartEventResponse = new appez.mmi.model.SmartEventResponse();
		smartEventResponse.setOperationComplete(isOperationComplete);
		smartEventResponse.setServiceResponse(serviceResponse);
		smartEventResponse.setExceptionType(exceptionType);
		smartEventResponse.setExceptionMessage(exceptionMessage);
		this.processResponse(smartEventResponse);
	},
	
    /*
    * Name: processResponse
    * Description: Here we get control after SmartEventRequest object processed.
    * smartEventResponse: SmartEventResponse object
    * Returns: None 
    * Details about if any exception is thrown.
    */
	processResponse: function(smartEventResponse){
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, smartEventResponse);
	}
                       
});
;/** Provides support for the UI components such as dialogs, indicators etc.
 * 
 */
appez.mmi.service.web.UIService = appez.mmi.createClass({          
	className:"appez.mmi.service.web.UIService",              //Contains Class Name
	singleton:true,                                      //specify whether the class is singleton object or not ,By default service classes are singleton
	extend:appez.mmi.service.SmartEventService,               //Contains Base Class Name
	
	callbackFunction : null,
	callbackFunctionScope : null,
	smartEvent : null,
	
	componentElementName : 'appezUiComponentElement',
	
	/*
	 * Name: processRequest
	 * Description: Excecute SmartEventRequest object for native communication
	 * smartEventRequest: SmartEventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	processRequest: function(smEvent, callbackFunc, callbackFuncScope){
		this.smartEvent = smEvent;
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		var smartEventRequest = smEvent.getSmartEventRequest();
		this.parent.smEventRequest = smEvent.getSmartEventRequest();
		
		var requestData = JSON.stringify(smartEventRequest.getServiceRequestData());
		requestData = appez.mmi.util.Base64.decode(requestData);
		requestData = JSON.parse(requestData);
		
		switch(smartEventRequest.getServiceOperationId()){
		case appez.mmi.constant.WEB_SHOW_ACTIVITY_INDICATOR:
		case appez.mmi.constant.WEB_UPDATE_LOADING_MESSAGE:
			this.showLoadingIndicatorDialog(requestData);
			break;
			
		case appez.mmi.constant.WEB_HIDE_ACTIVITY_INDICATOR:
			this.hideLoadingIndicatorDialog(requestData);
			break;
			
		case appez.mmi.constant.WEB_SHOW_MESSAGE:
			this.showInformationDialog(requestData);
			break;
			
		case appez.mmi.constant.WEB_SHOW_MESSAGE_YESNO:
			this.showDecisionDialog(requestData);
			break;
			
		case appez.mmi.constant.WEB_SHOW_DIALOG_SINGLE_CHOICE_LIST:
			this.showSingleSelectionDialog(requestData);
			break;
			
		case appez.mmi.constant.WEB_SHOW_DIALOG_SINGLE_CHOICE_LIST_RADIO_BTN:
			this.showSingleRadioSelectionDialog(requestData);
			break;
			
		case appez.mmi.constant.WEB_SHOW_DIALOG_MULTIPLE_CHOICE_LIST_CHECKBOXES:
			this.showMultipleSelectionDialog(requestData);
			break;
		
		case appez.mmi.constant.WEB_SHOW_DATE_PICKER:
			this.showDatePicker(requestData);
			break;
		}	
	},
	
	/**
	 * Shows the loading indicator
	 * 
	 * @param serviceReqData : Request data corresponding to the current request
	 * 
	 * */
	showLoadingIndicatorDialog : function(serviceReqData){
		var dataToFill = '<div id="activityIndicatorModal" class="modal fade" role="dialog" data-backdrop="static"> <div class="modal-header">  <h3>[LOADING-MSG]</h3> </div> <div class="modal-body"> <div class="progress progress-striped active"> <div class="bar" style="width: 40%;"></div> </div> </div> </div>';
		if(serviceReqData[appez.mmi.constant.MMI_REQUEST_PROP_MESSAGE]!=undefined){
			dataToFill = dataToFill.replace('[LOADING-MSG]',serviceReqData[appez.mmi.constant.MMI_REQUEST_PROP_MESSAGE]);
			this.fillComponentDataInHtml(dataToFill);
			$('#activityIndicatorModal').modal('show');
		} else {
			var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
			this.processResponse(smEventResponse);
		}		
	},	
	
	/**
	 * Hides the loading indicator
	 * 
	 * @param serviceReqData : Request data corresponding to the current request
	 * 
	 * */
	hideLoadingIndicatorDialog : function(){
		appez.mmi.service.web.UIService.removeComponentFromHtml();
	},
	
	/**
	 * Shows the information dialog
	 * 
	 * @param serviceReqData : Request data corresponding to the current request
	 * 
	 * */
	showInformationDialog : function(serviceReqData){
		var dataToFill = '<div id="dialogModal" class="modal fade" role="dialog" data-backdrop="static"> <div class="modal-header">  <h3>Information</h3> </div> <div class="modal-body"> <p>[DIALOG-MESSAGE]</p> </div> <div class="modal-footer"> <button class="btn btn-primary">[POSITIVE-BTN-TXT]</button> </div> </div>';
		var infoDialogMsg = serviceReqData[appez.mmi.constant.MMI_REQUEST_PROP_MESSAGE];
		
		if(infoDialogMsg==undefined){
			var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
			this.processResponse(smEventResponse);
		} else {
			dataToFill = dataToFill.replace('[DIALOG-MESSAGE]',infoDialogMsg);
			var infoDialogBtnTxt = serviceReqData[appez.mmi.constant.MMI_REQUEST_PROP_BUTTON_TEXT];
			if(infoDialogBtnTxt==undefined){
				infoDialogBtnTxt = "OK";
			}
			dataToFill = dataToFill.replace('[POSITIVE-BTN-TXT]',infoDialogBtnTxt);
			this.fillComponentDataInHtml(dataToFill);
			$('#dialogModal').modal('show');
			
			$('#dialogModal .close').bind('tap',appez.mmi.service.web.UIService.onSelectInfoDialogOk);
			$('#dialogModal .modal-footer .btn-primary').bind('tap',appez.mmi.service.web.UIService.onSelectInfoDialogOk);
		}		
	},	
	
	/**
	 * Shows the decision dialog
	 * 
	 * @param serviceReqData : Request data corresponding to the current request
	 * 
	 * */
	showDecisionDialog : function(serviceReqData){
		var dataToFill = '<div id="decisionModal" class="modal fade" role="dialog" data-backdrop="static"> <div class="modal-header">  <h3>Information</h3> </div> <div class="modal-body"> <p>[DIALOG-MESSAGE]</p> </div> <div class="modal-footer"> <button class="btn btn-primary positiveBtn">[POSITIVE-BTN-TXT]</button> <button class="btn btn-primary negativeBtn">[NEGATIVE-BTN-TXT]</button> </div> </div>';
		try {
			var decisionDialogMsg = serviceReqData[appez.mmi.constant.MMI_REQUEST_PROP_MESSAGE];
			var requiredFields = [];
			requiredFields = [appez.mmi.constant.MMI_REQUEST_PROP_MESSAGE];
			if(appez.mmi.util.FrameworkUtil.eventReqHasRequiredFields(serviceReqData,requiredFields)){
				dataToFill = dataToFill.replace('[DIALOG-MESSAGE]',decisionDialogMsg);
				var positiveBtnText = serviceReqData[appez.mmi.constant.MMI_REQUEST_PROP_POSITIVE_BTN_TEXT];
				if(positiveBtnText==undefined){
					positiveBtnText = "OK";
				}
				var negativeBtnText = serviceReqData[appez.mmi.constant.MMI_REQUEST_PROP_NEGATIVE_BTN_TEXT];
				if(negativeBtnText==undefined){
					negativeBtnText = "Cancel";
				}
				dataToFill = dataToFill.replace('[POSITIVE-BTN-TXT]',positiveBtnText);
				dataToFill = dataToFill.replace('[NEGATIVE-BTN-TXT]',negativeBtnText);
				this.fillComponentDataInHtml(dataToFill);
				$('#decisionModal').modal('show');
				
				$('#decisionModal .close').bind('tap',appez.mmi.service.web.UIService.onSelectDecisionDialogCancel);
				$('#decisionModal .modal-footer .positiveBtn').bind('tap',appez.mmi.service.web.UIService.onSelectDecisionDialogOk);
				$('#decisionModal .modal-footer .negativeBtn').bind('tap',appez.mmi.service.web.UIService.onSelectDecisionDialogCancel);
			} else {
				//Means that the user provided request does not have all the required request parameters. 
				//In this case, an error should be generated and should be returned to the user callback function
				var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
				this.processResponse(smEventResponse);
			}
		} catch(error){
			var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_JSON_REQUEST,error.message);
			this.processResponse(smEventResponse);
		}	
	},
	
	/**
	 * Shows single selection dialog. In this control, the element is selected when the user taps in any one of the list option elements
	 * 
	 * @param serviceReqData : Request data corresponding to the current request
	 * 
	 * */
	showSingleSelectionDialog : function(serviceReqData){
		//$(':checked')[0].id {For reference only} 
		var dataToFill = '<div id="singleSelectModal" class="modal fade" role="dialog" data-backdrop="static"> <div class="modal-header">  <h3>Select Item</h3> </div> <div class="modal-body"> [OPTIONS-LIST] </div> <div class="modal-footer"> <button class="btn btn-primary">Cancel</button> </div> </div>';
		try {
			var allListRows = '';
			var requiredFields = [];
			requiredFields = [appez.mmi.constant.MMI_REQUEST_PROP_MESSAGE];
			if(appez.mmi.util.FrameworkUtil.eventReqHasRequiredFields(serviceReqData,requiredFields)){
				var allListElements = serviceReqData[appez.mmi.constant.MMI_REQUEST_PROP_MESSAGE];
				var allListElementsCount = allListElements.length;
				for(var currentElement = 0; currentElement<allListElementsCount;currentElement++){
					var singleRowTemplate = '<p class="select-option" id="[OPTION-ID]">[OPTION-TXT]</p>';
					singleRowTemplate = singleRowTemplate.replace('[OPTION-ID]',currentElement);
					singleRowTemplate = singleRowTemplate.replace('[OPTION-TXT]',allListElements[currentElement][appez.mmi.constant.MMI_REQUEST_PROP_ITEM]);
					allListRows += singleRowTemplate;
				}
				
				dataToFill = dataToFill.replace('[OPTIONS-LIST]',allListRows);
				this.fillComponentDataInHtml(dataToFill);
				$('#singleSelectModal').modal('show');
				
				$('#singleSelectModal .close').bind('tap',appez.mmi.service.web.UIService.onSingleSelectCancel);
				$('#singleSelectModal .modal-footer .btn-primary').bind('tap',appez.mmi.service.web.UIService.onSingleSelectCancel);
				$('#singleSelectModal p').bind('tap',appez.mmi.service.web.UIService.onSingleSelectElement);
			} else {
				//Means that the user provided request does not have all the required request parameters. 
				//In this case, an error should be generated and should be returned to the user callback function
				var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
				this.processResponse(smEventResponse);
			}
		} catch(error){
			var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_JSON_REQUEST,error.message);
			this.processResponse(smEventResponse);
		}	
	}, 
	
	/**
	 * Shows single selection dialog with radio buttons. In this control, the element is selected when user selects radio button corresponding to the list row element
	 * 
	 * @param serviceReqData : Request data corresponding to the current request
	 * 
	 * */
	showSingleRadioSelectionDialog : function(serviceReqData){
		var dataToFill = '<div id="radioSelectModal" class="modal fade" role="dialog" data-backdrop="static"> <div class="modal-header">  <h3>Select Item</h3> </div> <div class="modal-body"> [OPTIONS-LIST] </div> <div class="modal-footer"> <button class="btn btn-primary positiveBtn">OK</button> <button class="btn btn-primary negativeBtn">Cancel</button> </div> </div>';
		try {
			var allListRows = '';
			var requiredFields = [];
			requiredFields = [appez.mmi.constant.MMI_REQUEST_PROP_MESSAGE];
			if(appez.mmi.util.FrameworkUtil.eventReqHasRequiredFields(serviceReqData,requiredFields)){
				var allListElements = serviceReqData[appez.mmi.constant.MMI_REQUEST_PROP_MESSAGE];
				var allListElementsCount = allListElements.length;
				for(var currentElement = 0; currentElement<allListElementsCount;currentElement++){
					var singleRowTemplate = '<label class="radio select-option"> <input type="radio" name="optionsRadios" id="[OPTION-ID]" value="option1"> [OPTION-TXT] </label>';
					singleRowTemplate = singleRowTemplate.replace('[OPTION-ID]',currentElement);
					singleRowTemplate = singleRowTemplate.replace('[OPTION-TXT]',allListElements[currentElement][appez.mmi.constant.MMI_REQUEST_PROP_ITEM]);
					allListRows += singleRowTemplate;
				}
				
				dataToFill = dataToFill.replace('[OPTIONS-LIST]',allListRows);
				this.fillComponentDataInHtml(dataToFill);
				$('#radioSelectModal').modal('show');
				
				$('#radioSelectModal .close').bind('tap',appez.mmi.service.web.UIService.onSingleSelectRadioCancel);
				$('#radioSelectModal .modal-footer .positiveBtn').bind('tap',appez.mmi.service.web.UIService.onSingleSelectRadioOk);
				$('#radioSelectModal .modal-footer .negativeBtn').bind('tap',appez.mmi.service.web.UIService.onSingleSelectRadioCancel);
			} else {
				//Means that the user provided request does not have all the required request parameters. 
				//In this case, an error should be generated and should be returned to the user callback function
				var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
				this.processResponse(smEventResponse);
			}
		} catch(error){
			var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_JSON_REQUEST,error.message);
			this.processResponse(smEventResponse);
		}	
	},
	
	/**
	 * Shows multiple selection dialog. Using this control, user can select more than one of the provided options
	 * 
	 * @param serviceReqData : Request data corresponding to the current request
	 * 
	 * */
	showMultipleSelectionDialog : function(serviceReqData){
		var dataToFill = '<div id="multiSelectModal" class="modal fade" role="dialog" data-backdrop="static"> <div class="modal-header">  <h3>Select Item(s)</h3> </div> <div class="modal-body"> [OPTIONS-LIST] </div> <div class="modal-footer"> <button class="btn btn-primary positiveBtn">OK</button> <button class="btn btn-primary negativeBtn">Cancel</button> </div> </div>';
		try {
			var allListRows = '';
			var requiredFields = [];
			requiredFields = [appez.mmi.constant.MMI_REQUEST_PROP_MESSAGE];
			if(appez.mmi.util.FrameworkUtil.eventReqHasRequiredFields(serviceReqData,requiredFields)){
				var allListElements = serviceReqData[appez.mmi.constant.MMI_REQUEST_PROP_MESSAGE];
				var allListElementsCount = allListElements.length;
				for(var currentElement = 0; currentElement<allListElementsCount;currentElement++){
					var singleRowTemplate = '<label class="checkbox select-option"> <input type="checkbox" name="optionsRadios" id="[OPTION-ID]" value="option2"> [OPTION-TXT] </label>';
					singleRowTemplate = singleRowTemplate.replace('[OPTION-ID]',currentElement);
					singleRowTemplate = singleRowTemplate.replace('[OPTION-TXT]',allListElements[currentElement][appez.mmi.constant.MMI_REQUEST_PROP_ITEM]);
					allListRows += singleRowTemplate;
				}
				
				dataToFill = dataToFill.replace('[OPTIONS-LIST]',allListRows);
				this.fillComponentDataInHtml(dataToFill);
				$('#multiSelectModal').modal('show');
				
				$('#multiSelectModal .close').bind('tap',appez.mmi.service.web.UIService.onMultiSelectCancel);
				$('#multiSelectModal .modal-footer .positiveBtn').bind('tap',appez.mmi.service.web.UIService.onMultiSelectOk);
				$('#multiSelectModal .modal-footer .negativeBtn').bind('tap',appez.mmi.service.web.UIService.onMultiSelectCancel);
			} else {
				//Means that the user provided request does not have all the required request parameters. 
				//In this case, an error should be generated and should be returned to the user callback function
				var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR,appez.mmi.constant.INVALID_SERVICE_REQUEST_ERROR_MESSAGE);
				this.processResponse(smEventResponse);
			}
		} catch(error){
			var smEventResponse = appez.mmi.util.FrameworkUtil.getSmartEventResponseForServiceError(appez.mmi.constant.INVALID_JSON_REQUEST,error.message);
			this.processResponse(smEventResponse);
		}	
	},	
	
	/**
	 * Shows date picker control
	 * 
	 * @param serviceReqData : Request data corresponding to the current request
	 * 
	 * */
	showDatePicker : function(serviceReqData){
		var dataToFill = '<div id="datePickerModal" class="modal fade" role="dialog" data-backdrop="static"> <div class="modal-header">  <h3>Select Date</h3> </div> <div class="modal-body"> <div class="input-append date" id="datepicker-el" data-date="[CURRENT-DATE-DATA]" data-date-format="dd-mm-yyyy"> <input class="span2" size="16" type="text" value="[CURRENT-DATE]"> <span class="add-on"><i class="icon-th"></i></span> </div> </div> <div class="modal-footer"> <button class="btn btn-primary">OK</button> </div></div>';
		var currentDate = this.getCurrentDateString();
		dataToFill = dataToFill.replace('[CURRENT-DATE-DATA]',currentDate);
		dataToFill = dataToFill.replace('[CURRENT-DATE]',currentDate);
		this.fillComponentDataInHtml(dataToFill);
		$('#datePickerModal').modal('show');
		$('#datepicker-el').datepicker(); // initializes data picker component
		//Set the 'z-index' of the picker control
		$('.datepicker').css('z-index','10001');
		
		$('#datePickerModal .close').bind('tap',appez.mmi.service.web.UIService.onDatePickerCancel);
		$('#datePickerModal .modal-footer .btn-primary').bind('tap',appez.mmi.service.web.UIService.onDatePickerSelectOk);
	},
	
	/**
	 * Prepares the modified SmartEvent model by adding the response to it
	 *  
	 */
	prepareResponse : function(isOperationComplete, serviceResponse, exceptionType, exceptionMessage){
		//TODO to set the response of this action in the SmartEventResponse object and return the controller using the 'processResponse' method
		var smartEventResponse = new appez.mmi.model.SmartEventResponse();
		smartEventResponse.setOperationComplete(isOperationComplete);
		smartEventResponse.setServiceResponse(serviceResponse);
		smartEventResponse.setExceptionType(exceptionType);
		smartEventResponse.setExceptionMessage(exceptionMessage);
		this.processResponse(smartEventResponse);
	},
                                                         
	/**
	 * Name: processResponse
	 * Description: Here we get control after SmartEventRequest object processed.
	 * smartEventResponse: SmartEventResponse object
	 * Returns: None 
	 * Details about if any exception is thrown.
	 */
	processResponse: function(smartEventResponse){
		//Send the response directly to the calling scope and the specified callback function
		this.callbackFunction.call(this.callbackFunctionScope, smartEventResponse);
	},
	
	/**
	 * Fills the data of the UI service component in the specified div of the page
	 * 
	 * @param componentHtml
	 * 
	 * */
	fillComponentDataInHtml : function(componentHtml){
		//Delete the 'div' element if already created
		//It will be created when any UI service component will be shown
		if (document.getElementById(this.componentElementName)) {
			var elem = document.getElementById(this.componentElementName);
		    elem.parentNode.removeChild(elem);
		}
		
	    //Now create a new element by the same name and add the UI component HTML in that element
		$('body').append('<div id="'+this.componentElementName+'">'+componentHtml+'</div>');		
	},
	
	/**
	 * Removes the DOM element and its contents from the page
	 * 
	 * */
	removeComponentFromHtml : function(){
		//Delete the 'div' element if already created
		//It will be created when any UI service component will be shown
		if(document.getElementById(this.componentElementName)) {
			var elem = document.getElementById(this.componentElementName);
		    elem.parentNode.removeChild(elem);
		}
	},
	
	/**
	 * Returns the current date string in the desired formate of DD-MM-YYYY
	 * 
	 * */
	getCurrentDateString : function(){
		var d = new Date();
		var month = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
		var dateString = d.getDate() +'-'+ month[d.getUTCMonth()]+"-"+d.getFullYear();
		return dateString;
	},
	
	/**
	 * Initiates the service completion notification when OK button is pressed on information dialog 
	 * 
	 * @param e : Current event object
	 * 
	 * */
	onSelectInfoDialogOk : function(e){
		e.preventDefault();
		var response = {};
		response[appez.mmi.constant.MMI_RESPONSE_PROP_USER_SELECTION] = appez.mmi.constant.USER_SELECTION_OK;
		$('#dialogModal').modal('hide');
		appez.mmi.service.web.UIService.prepareResponse(true, response, 0, null);
	},
	
	/**
	 * Initiates the service completion notification when OK button is pressed on decision dialog 
	 * 
	 * @param e : Current event object
	 * 
	 * */
	onSelectDecisionDialogOk : function(e){
		e.preventDefault();
		var response = {};
		response[appez.mmi.constant.MMI_RESPONSE_PROP_USER_SELECTION] = appez.mmi.constant.USER_SELECTION_YES;
		$('#decisionModal').modal('hide');
		appez.mmi.service.web.UIService.prepareResponse(true, response, 0, null);
	},
	
	/**
	 * Initiates the service completion notification when Cancel button is pressed on decision dialog 
	 * 
	 * @param e : Current event object
	 * 
	 * */
	onSelectDecisionDialogCancel : function(e){
		e.preventDefault();
		var response = {};
		response[appez.mmi.constant.MMI_RESPONSE_PROP_USER_SELECTION] = appez.mmi.constant.USER_SELECTION_NO;
		$('#decisionModal').modal('hide');
		appez.mmi.service.web.UIService.prepareResponse(true, response, 0, null);
	},
	
	/**
	 * Initiates the service completion notification when Cancel button is pressed on Single select dialog
	 * 
	 * @param e : Current event object
	 * 
	 * */
	onSingleSelectCancel : function(e){
		e.preventDefault();
		var response = {};
		response[appez.mmi.constant.MMI_RESPONSE_PROP_USER_SELECTION] = "-1";
		$('#singleSelectModal').modal('hide');
		appez.mmi.service.web.UIService.prepareResponse(true, response, 0, null);
	},
	
	/**
	 * Initiates the service completion notification when an element from the single select dialog is selected
	 * 
	 * @param e : Current event object
	 * 
	 * */
	onSingleSelectElement : function(e){
		e.preventDefault();
		var response = {};
		response[appez.mmi.constant.MMI_RESPONSE_PROP_USER_SELECTION] = e.currentTarget.id;
		$('#singleSelectModal').modal('hide');
		appez.mmi.service.web.UIService.prepareResponse(true, response, 0, null);
	},
	
	/**
	 * Initiates the service completion notification when OK button is pressed on single select radio dialog 
	 * 
	 * @param e : Current event object
	 * 
	 * */
	onSingleSelectRadioOk : function(e){
		e.preventDefault();
		var response = {};
		if($('#radioSelectModal :checked')[0]!=undefined){
			//Means an element is selected
			response[appez.mmi.constant.MMI_RESPONSE_PROP_USER_SELECTION] = $('#radioSelectModal :checked')[0].id;
		} else {
			//Means no element is selected
			response[appez.mmi.constant.MMI_RESPONSE_PROP_USER_SELECTION] = "";
		}
		$('#radioSelectModal').modal('hide');
		appez.mmi.service.web.UIService.prepareResponse(true, response, 0, null);
	},
	
	/**
	 * Initiates the service completion notification when Cancel button is pressed on single select radio dialog 
	 * 
	 * @param e : Current event object
	 * 
	 * */
	onSingleSelectRadioCancel : function(e){
		e.preventDefault();
		var response = {};
		response[appez.mmi.constant.MMI_RESPONSE_PROP_USER_SELECTION] = "-1";
		$('#radioSelectModal').modal('hide');
		appez.mmi.service.web.UIService.prepareResponse(true, response, 0, null);
	},
	
	/**
	 * Initiates the service completion notification when OK button is pressed on multiple select dialog 
	 * 
	 * @param e : Current event object
	 * 
	 * */
	onMultiSelectOk : function(e){
		e.preventDefault();
		var response = {};
		var allSelectedElements = $('#multiSelectModal :checked');
		if(allSelectedElements!=null && allSelectedElements!=undefined){
			var selectedElementsCount = allSelectedElements.length;
			if(selectedElementsCount>0){
				var allElementsArray = [];
				for(var currentElement=0;currentElement<selectedElementsCount;currentElement++){
					var selectedIndexObj = {};
					selectedIndexObj[appez.mmi.constant.MMI_RESPONSE_PROP_USER_SELECTED_INDEX] = allSelectedElements[currentElement].id;
					allElementsArray[currentElement] = selectedIndexObj;
				}
				response[appez.mmi.constant.MMI_RESPONSE_PROP_USER_SELECTION] = allElementsArray;
			} else {
				response[appez.mmi.constant.MMI_RESPONSE_PROP_USER_SELECTION] = "";
			} 
		}
		
		$('#multiSelectModal').modal('hide');
		appez.mmi.service.web.UIService.prepareResponse(true, response, 0, null);
	},
	
	/**
	 * Initiates the service completion notification when Cancel button is pressed on multi select dialog 
	 * 
	 * @param e : Current event object
	 * 
	 * */
	onMultiSelectCancel : function(e){
		e.preventDefault();
		var response = {};
		response[appez.mmi.constant.MMI_RESPONSE_PROP_USER_SELECTION] = "-1";
		$('#multiSelectModal').modal('hide');
		appez.mmi.service.web.UIService.prepareResponse(true, response, 0, null);
	},
	
	/**
	 * Initiates the service completion notification when Cancel button is pressed on date picker dialog 
	 * 
	 * @param e : Current event object
	 * 
	 * */
	onDatePickerCancel : function(e){
		e.preventDefault();
		var response = {};
		response[appez.mmi.constant.RESPONSE_JSON_PROP_DATA] = "";
		$('#datePickerModal').modal('hide');
		appez.mmi.service.web.UIService.prepareResponse(true, response, 0, null);
	},
	
	/**
	 * Initiates the service completion notification when OK button is pressed on date picker dialog 
	 * 
	 * @param e : Current event object
	 * 
	 * */
	onDatePickerSelectOk : function(e){
		e.preventDefault();
		var response = {};
		response[appez.mmi.constant.RESPONSE_JSON_PROP_DATA] = $('#datePickerModal input')[0].value;
		$('#datePickerModal').modal('hide');
		appez.mmi.service.web.UIService.prepareResponse(true, response, 0, null);
	}
});                        ;/**
 * SmartNotifier.js: 
 * Base class of the notifiers. All individual notifier classes are derived
 * from SmartNotifier.
 * 
 */
appez.mmi.notifier.SmartNotifier = appez.mmi.createClass({
	className:"appez.mmi.notifier.SmartNotifier",         //Contains Class Name
	singleton:true,                                     //specify whethet the class is singleton object or not 
	regParameters : null,								//JSON object containing the registration parameters
    
	register : function(registerParams){
		
	},
	
	unregister : function(registerParams){
		
	}
});;/**
 * 
 */
appez.mmi.notifier.NetworkStateNotifier = appez.mmi.createClass({          
	className:"appez.mmi.notifier.NetworkStateNotifier", 	//Contains Class Name
	singleton:true,                                            		//specify whether the class is singleton object or not 
	extend:appez.mmi.notifier.SmartNotifier,                     //Contains Base Class Name
   
	callbackFunction : null,
	callbackFunctionScope : null,
	
	/*
	 * Name: processRequest
	 * Description: Execute SmartEventRequest object for native communication
	 * smartEventRequest: SmartEventRequest object
	 * Returns: None , transfer control to callBack method.
	 * Details about if any exception is thrown.
	 */
	register: function(notifierEvent, callbackFunc, callbackFuncScope){
		appez.mmi.log('NetworkStateNotifier->register');
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		try {
			appez.mmi.getMobiletManager().processNotifierRequest(this, notifierEvent);
		} catch(error){
			appez.mmi.log('NetworkStateNotifier->register->error message:'+error.message);
			this.notifyRegisterError(notifierEvent);
		}
	},
	
	unregister : function(notifierEvent, callbackFunc, callbackFuncScope){
		appez.mmi.log('NetworkStateNotifier->unregister');
		this.callbackFunction = callbackFunc;
		this.callbackFunctionScope = callbackFuncScope;
		try {
			appez.mmi.getMobiletManager().processNotifierRequest(this, notifierEvent);
		} catch(error){
			appez.mmi.log('NetworkStateNotifier->register->error message:'+error.message);
			this.notifyRegisterError(notifierEvent);
		}
	},
	
	notifierResponse : function(notifierResponse){
		this.callbackFunction.call(this.callbackFunctionScope, notifierResponse);
	},
	
	notifyRegisterError : function(notifierEvent){
		var notifierEventResponse = new appez.mmi.model.NotifierEventResponse();
		notifierEventResponse.setOperationComplete(false);
		notifierEventResponse.setResponse(null);
		notifierEventResponse.setErrorType(appez.mmi.constant.NOTIFIER_REQUEST_INVALID);
		notifierEventResponse.setErrorMessage(appez.mmi.constant.NOTIFIER_REQUEST_INVALID_MESSAGE);
		this.callbackFunction.call(this.callbackFunctionScope, notifierEventResponse);
	}	
});	;appez.mmi.util.FrameworkUtil = appez.mmi.createClass({
	className:"appez.mmi.util.FrameworkUtil", //Contains The Class Name.
    singleton:true,   
    
    /**
     * Prepares a request in a JSON structure that is acceptable to the native layer
     * 
     * */
    prepareRequestObjForNative : function(smEvent){
    	var requestObj = {};
    	
    	requestObj[appez.mmi.constant.MMI_MESSAGE_PROP_TRANSACTION_ID] = smEvent.getTransactionId();
    	requestObj[appez.mmi.constant.MMI_MESSAGE_PROP_RESPONSE_EXPECTED] = smEvent.getResponseExpected();
    	requestObj[appez.mmi.constant.MMI_MESSAGE_PROP_TRANSACTION_REQUEST] = {};
    	requestObj[appez.mmi.constant.MMI_MESSAGE_PROP_TRANSACTION_REQUEST][appez.mmi.constant.MMI_MESSAGE_PROP_REQUEST_OPERATION_ID] = smEvent.getSmartEventRequest().getServiceOperationId();
    	requestObj[appez.mmi.constant.MMI_MESSAGE_PROP_TRANSACTION_REQUEST][appez.mmi.constant.MMI_MESSAGE_PROP_REQUEST_DATA] = smEvent.getSmartEventRequest().getServiceRequestData();
    	requestObj[appez.mmi.constant.MMI_MESSAGE_PROP_TRANSACTION_RESPONSE] = {};
    	
    	return requestObj;
    },
    
    prepareSmartEvent : function(requestData, isResponseExpected, serviceOperationId){
    	var smartEvent = new appez.mmi.model.SmartEvent();
    	smartEvent.setTransactionId(new Date().getTime());
    	smartEvent.setResponseExpected(isResponseExpected);
    	
    	var smEventRequest = new appez.mmi.model.SmartEventRequest();
    	smEventRequest.setServiceOperationId(serviceOperationId);
    	requestData = JSON.stringify(requestData);
    	var encodedRequestData = appez.mmi.base64Encode(requestData);
    	smEventRequest.setServiceRequestData(encodedRequestData);
    	
    	smartEvent.setSmartEventRequest(smEventRequest);
    	
    	return smartEvent;
    },
    
    getSmartEventResponseForServiceError : function(exceptionType,exceptionMessage){
    	var smEventResponse = new appez.mmi.model.SmartEventResponse();
    	smEventResponse.setOperationComplete(false);
    	smEventResponse.setServiceResponse(null);
    	smEventResponse.setExceptionType(exceptionType);
    	smEventResponse.setExceptionMessage(exceptionMessage);
    	return smEventResponse;
    },
    
    eventReqHasRequiredFields : function(requestObj, requiredFields){
    	var hasAllRequiredFields = false;
    	if(requestObj!=null && requestObj!=undefined){
    		if((requiredFields instanceof Array)&&(requiredFields.length>0)){
    			var requiredFieldsCount = requiredFields.length;
    			for(var currentField=0;currentField<requiredFieldsCount;currentField++){
    				if(requestObj[requiredFields[currentField]]!=undefined){
    					hasAllRequiredFields = true;
    				} else {
    					hasAllRequiredFields = false;
    					break;
    				}
    			}
    		}
    	}
    	return hasAllRequiredFields;
    },
    
    getRequestObjFromSmartEvent : function(smartEvent){
    	var smEventRequest = smartEvent.getSmartEventRequest(); 
    	var requestObj = smEventRequest.getServiceRequestData();
    	
    	if(requestObj!=null && requestObj.length>0){
    		requestObj = appez.mmi.base64Decode(requestObj);
    		requestObj = JSON.parse(requestObj);
    	} else {
    		requestObj = {};
    	}
    	return requestObj;
    },
    
    prepareRequestHeaderString : function(headerKeys, headerValues){
    	var allHeadersArray = [];
    	if((headerKeys!=undefined && headerKeys!=null)&&(headerValues!=undefined && headerValues!=null)){
    		if(headerKeys.length>0 && headerValues.length>0){
    			var allHeadersCount = headerKeys.length;
    			for(var currentHeaderIndex=0;currentHeaderIndex<allHeadersCount;currentHeaderIndex++){
    				var currentHeader = {};
    				currentHeader[appez.mmi.constant.MMI_REQUEST_PROP_HTTP_HEADER_KEY] = headerKeys[currentHeaderIndex];
    				currentHeader[appez.mmi.constant.MMI_REQUEST_PROP_HTTP_HEADER_VALUE] = headerValues[currentHeaderIndex];
    				allHeadersArray.push(currentHeader);
    			}
    		}
    	}
    	return JSON.stringify(allHeadersArray);
    },
    
    handleNotifierRequestError : function(errorType, errorMessage){
    	appez.mmi.log(errorMessage, appez.mmi.constant.LOG_LEVEL_ERROR);
    },
    
    prepareNotifierObjForNative : function(notifierEvent){
    	var requestObj = {};
    	
    	requestObj[appez.mmi.constant.NOTIFIER_PROP_TRANSACTION_ID] = notifierEvent.getTransactionId();
    	requestObj[appez.mmi.constant.NOTIFIER_PROP_TRANSACTION_REQUEST] = {};
    	requestObj[appez.mmi.constant.NOTIFIER_PROP_TRANSACTION_REQUEST][appez.mmi.constant.NOTIFIER_TYPE] = notifierEvent.getNotifierEventRequest().getType();
    	requestObj[appez.mmi.constant.NOTIFIER_PROP_TRANSACTION_REQUEST][appez.mmi.constant.NOTIFIER_ACTION_TYPE] = notifierEvent.getNotifierEventRequest().getActionType();
    	requestObj[appez.mmi.constant.NOTIFIER_PROP_TRANSACTION_REQUEST][appez.mmi.constant.NOTIFIER_REQUEST_DATA] = notifierEvent.getNotifierEventRequest().getData();
    	requestObj[appez.mmi.constant.NOTIFIER_PROP_TRANSACTION_RESPONSE] = {};
    	
    	return requestObj;
    },
    
    prepareNotifierEvent : function(eventData, notifierType, notifierActionType){
    	var notifierEvent = new appez.mmi.model.NotifierEvent();
    	notifierEvent.setTransactionId(new Date().getTime());
    	
    	var notifierEventRequest = new appez.mmi.model.NotifierEventRequest();
    	notifierEventRequest.setType(notifierType);
    	notifierEventRequest.setActionType(notifierActionType);
    	eventData = JSON.stringify(eventData);
    	var encodedRequestData = appez.mmi.base64Encode(eventData);
    	notifierEventRequest.setData(encodedRequestData);
    	
    	notifierEvent.setNotifierEventRequest(notifierEventRequest);
    	
    	return notifierEvent;
    },
    
    getRequestObjFromNotifierEvent : function(notifierEvent){ 
    	var requestObj = null;
    	try {
        	var notifierEventRequest = notifierEvent.getNotifierEventRequest();
        	requestObj = notifierEventRequest.getData();
        	if(requestObj!=null && requestObj.length>0){
        		requestObj = appez.mmi.base64Decode(requestObj);
        		requestObj = JSON.parse(requestObj);
        	} else {
        		requestObj = {};
        	}
    	} catch(err) {
    		requestObj = {};
    	}
    	
    	return requestObj;
    }
});;appez.mmi.util.GenericUtil = appez.mmi.createClass({
	className:"appez.mmi.util.GenericUtil", //Contains The Class Name.
    singleton:true,
    
    isValidHexColor : function(hexCodeToCheck){
    	var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hexCodeToCheck);
    	return isOk;
    }

});;/** 
 * 
 *	Utility class for performing Ajax class.
 * 
 **/

appez.mmi.util.Ajax= appez.mmi.createClass({
	className : "appez.mmi.util.Ajax",
	singleton : true,

	callbackFunction : null,
	callbackErrorFunction : null,
	callbackFunctionScope : null,
	callingService : null,
	
	/**
	  *  Name: performAjaxOperation
	  *  Description: Performs the ajax request on behalf of client and calls appropriate call back function
	  *  Returns: None , transfer control to callBack method.	  * 
	  *  @param: 
	  *        callbackFunc: function to call when ajax call completed successfully 
	  *        callbackErrorFunc: function to call when ajax call fails 
	  *        callbackFuncScope: scope in which the function should be executed 
	  *        requestObj: type of the request of call
	  *          
	  */
	performAjaxOperation : function(callbackFunc,callbackErrorFunc, callbackFuncScope, requestObj){
		this.callbackFunction = callbackFunc;
		this.callbackErrorFunction = callbackErrorFunc;
		this.callbackFunctionScope = callbackFuncScope;
		var me=this;
		
		//Set the default value of request type
		var requestType = 'GET';
		if(requestObj['requestMethod']!=undefined && requestObj['requestMethod']!=null){
			requestType = requestObj['requestMethod'];
		}
		
		//Initialize the URL based on the user input
		var requestUrl = "";
		if(requestObj['requestUrl']!=undefined && requestObj['requestUrl']!=null){
			requestUrl = requestObj['requestUrl'];
		}
		
		//Initialize the post body based on the user input
		var requestBody = "";
		if(requestObj['requestPostBody']!=undefined && requestObj['requestPostBody']!=null){
			requestBody = requestObj['requestPostBody'];
		}
		
		var headerKeyValue = null;
		if(requestObj['requestHeaderInfo']!=undefined && requestObj['requestHeaderInfo']!=null){
			headerKeyValue = this.initHeaderKeyValuePair(requestObj['requestHeaderInfo']);
		}
		
		var reqContentType = "application/x-www-form-urlencoded; charset=UTF-8";
		if(requestObj['requestContentType']!=undefined && requestObj['requestContentType']!=null){
			reqContentType=requestObj['requestContentType'];
		}
		var jqxhr = $.ajax({
			type: requestType,
			url: requestUrl,
			data: requestBody,
			contentType : reqContentType,
			beforeSend: function (request)
            {
				if(headerKeyValue!=null){
					for(var key in headerKeyValue){
						eMob.log('AJAX.js->performAjaxOperation-> header key:'+key+",header value:"+headerKeyValue[key]);
		                request.setRequestHeader(key, headerKeyValue[key]);
					}
				}
            },
			async:false
		}).done(function(response, textStatus, jqXHR) {
			console.log("AJAX success->Response:"+response+",Text status:"+textStatus);
			// means operation has completed successfully
			me.callbackFunction.call(callbackFuncScope,response,textStatus,jqXHR);
		}).fail(function(jqXHR, textStatus, error) {
			console.log("AJAX error->Error thrown:"+error+",text status:"+textStatus);
			
			me.callbackErrorFunction.call(callbackFuncScope,jqXHR,textStatus,error);
		}).always(function() {
			console.log("AJAX COMPLETE");
		});
	
	},
	
	 /**
	  *  Name: initHeaderKeyValuePair
      *  Description: Extracts the key value pair from header details  
      *  Returns: Collection of key value pair present in header detail	   
	  *  @param: 
	  *         headerKeyValueInfo: header information detail 	
	  *          
	  */
	
	initHeaderKeyValuePair : function(headerKeyValueInfo){
		var headerKeyValueCollection = {};
		var headers = [headerKeyValueInfo];
		if(headerKeyValueInfo.indexOf(eMob.constant.HTTP_HEADER_SEPARATOR)>-1){
			headers = headerKeyValueInfo.split(eMob.constant.HTTP_HEADER_SEPARATOR);
		}
		var totalHeaders = headers.length;
		for(var currentHeader=0;currentHeader<totalHeaders;currentHeader++){
			var headerKeyValue = headers[currentHeader].split(eMob.constant.HTTP_HEADER_VALUE_SEPARATOR);
			headerKeyValueCollection[headerKeyValue[0]] = headerKeyValue[1];
		}
		
		return headerKeyValueCollection;
	}

});;/** 
 * 
 *	Utility class for encoding and decoding request data.
 * 
 **/


appez.mmi.util.Base64 = appez.mmi.createClass({
	className:"appez.mmi.util.Base64",  //Contains Class Name
    singleton:true,                 //specify whether the class is singleton object or not.By default util classes are singleton
	
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",  //encoding key : private variable keystring which is used as a encoding key
 
 	
    /*
     * Name: encode
     * Description: encode string in Base64 string
     * input: specify input string 
     * Returns: converted Base64 string
     * Details about if any exception is thrown.
     */
	encode : function(input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = this.utf8Encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
    /*
     * Name: decode
     * Description: decode Base64 string in normal string
     * input: specify input string in Base64
     * Returns: converted Base64 string into normal string
     * Details about if any exception is thrown.
     */
	decode : function(input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
 
		output = this.utf8Decode(output);
 
		return output;
 
	},
 
    /*
     * Name: utf8Encode
     * Description: encode string in utf8 string
     * input: specify input string in Base64
     * Returns: converted Base64 string into normal string
     * Details about if any exception is thrown.
     */
	// private method for UTF-8 encoding
	utf8Encode : function(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
    /*
     * Name: utf8Decode
     * Description: decode Base64 string in utf8 string
     * input: specify input string in Base64
     * Returns: converted utf8 string
     * Details about if any exception is thrown.
     */
	// private method for UTF-8 decoding
	utf8Decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
});