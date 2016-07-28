
/** 
 * 
 *   This class represents a Device model and holds device configuration detail.
 *   Use to detect the current platform, version and form factor.
 **/

var appezDevice = {
	//singleton:true,
	deviceOS : null,
	formFactor : null,
	userAgent : null,
	version : null,
	versionString: null,
	deviceName : null,
	isOnline : false,
	osString : null,
	
	//Flags for easy checking of platforms
	isiPad : false,
	isiPhone : false,
	isiOS: false,
	isAndroidOs : false,
	isWindowsPhone:false,
	isweb : false,
	
	//constants for simulator properties
	isSimulator : false,
	simulatorPlatform : '',
	simulatorPlatformVersion : '',
	
	//Device constant
	DEVICE_OS : {
		"UNKNOWN" : "UNKNOWN",
		"ANDROID" : "ANDROID",
		"IOS" : "IOS",
		"WINDOWSPHONE":"WINDOWSPHONE",
		"BROWSER_ANDROID" : "BROWSER_ANDROID",
		"BROWSER_IOS" : "BROWSER_IOS",
		"WEB" : "WEB"
	},
	//Device Form Factor
	FORM_FACTOR : {
		"SMART_PHONES" : "SMART_PHONES",
		"TABLETS" : "TABLETS",
		"KIOSK" : "KIOSK",
		"UNKNOWN" : "UNKNOWN"
	},
	
	DEVICE_OS_STRING : {
		OS_STRING_ANDROID : 'android',
		OS_STRING_IOS : 'ios',
		OS_STRING_WP : 'wp',
		OS_STRING_WEB : 'web'
	},

	init : function(deviceType) {
		this.userAgent = navigator.userAgent.toLowerCase();
		var url = document.location.href;
		this.isOnline = navigator.onLine;
		this.deviceName = navigator.platform;
		
		if((url.indexOf("http://")>-1)||(url.indexOf("https://")>-1)){
			this.deviceOS = this.DEVICE_OS.WEB;
			this.osString =  this.DEVICE_OS_STRING.OS_STRING_WEB;
			this.isweb= true;
			//TODO to determine the browser version and OS name
			this.checkForSimulator();
			return;
		}
		
		//Process the platform OS string provided by the platform.js library
		this.processPlatformOsString();
		
		if(this.deviceOS == this.DEVICE_OS.IOS){
			var productString = ''+platform.product;
			//Check if the device is iPad or iPhone/iPod Touch
			if(productString.indexOf('iPad')>-1){
				this.isiPad = true;				
				this.formFactor = this.FORM_FACTOR.TABLETS;
			} else if((productString.indexOf('iPhone')>-1) || (productString.indexOf('iPod')>-1)) {
				this.isiPhone = true;
				this.formFactor = this.FORM_FACTOR.SMART_PHONES;
			}
		}
		
//		alert('PLATFORM JS->NAME: '+platform.name +',VERSION: '+ platform.version +',PRODUCT: '+ platform.product +',OS: '+ platform.os + ',DESCRIPTION: '+ platform.description);
//		alert('Device->init->Device OS:'+this.getDeviceOs()+',device OS string;'+this.getOsString()+',device OS version:'+this.getOsVersion()+',form factor:'+this.getDeviceFormFactor());
//		alert('Device->init->Device details:isAndroid:'+this.isAndroid()+',isIphone:'+this.isIPhone()+',isIpad:'+this.isIPad()+',is iOS:'+this.isIos()+',isWP:'+this.isWP()+',isWeb:'+this.isWeb());
	},
	
	processPlatformOsString : function(){
		var platformOsString = ''+platform.os;
		var platformVersionString = '';
		
		if(platformOsString.indexOf('iOS')>-1){
			this.deviceOS = this.DEVICE_OS.IOS;
			this.osString =  this.DEVICE_OS_STRING.OS_STRING_IOS;
			this.isiOS = true;
			platformVersionString = platformOsString.replace('iOS ','');
		}
		
		else if(platformOsString.indexOf('Android')>-1){
			this.deviceOS = this.DEVICE_OS.ANDROID;
			this.osString =  this.DEVICE_OS_STRING.OS_STRING_ANDROID;
			this.isAndroidOs = true;
			this.formFactor = this.FORM_FACTOR.SMART_PHONES;
			platformVersionString = platformOsString.replace('Android ','');
		}
		
		else if(platformOsString.indexOf('Windows Phone')>-1){
			this.deviceOS = this.DEVICE_OS.WINDOWSPHONE;
			this.osString =  this.DEVICE_OS_STRING.OS_STRING_WP;
			this.isWindowsPhone = true;
			this.formFactor = this.FORM_FACTOR.SMART_PHONES;
			platformVersionString = platformOsString.replace('Windows Phone ','');
		} else {
			platformVersionString = platform.version;
		}
		
		this.version = parseFloat(platformVersionString);
	},
	
	getDeviceOs : function(){
		return this.deviceOS.trim();
	},
	
	isAndroid : function(){
		return this.isAndroidOs;
	},
	
	isIos : function(){
		return this.isiOS;
	},
	
	isIPad : function(){
		return this.isiPad;
	},
	
	isIPhone : function(){
		return this.isiPhone;
	},
	
	isWP : function(){
		return this.isWindowsPhone;
	},
	
	isWeb : function(){
		return this.isweb;
	},
	
	getDeviceFormFactor : function(){
		return this.formFactor.trim();
	},
	
	/*
     * Name: isDeviceOnline
     * Description: Determines whether device is connected to the network or not
     * @Params: None  
     * Returns: true if device is online false otherwise
     * 
     */
	isDeviceOnline : function(){
		this.isOnline = navigator.onLine;
		return this.isOnline;
	},
	
	/**
	 * returns the OS string as required by the framework. For ex- It returns 'android', 'ios', 'wp', 'web'
	 * */
	getOsString : function() {
		return this.osString.trim();
	},
	
	/**
	 * Returns the version of the device OS
	 * 
	 * */
	getOsVersion : function(){
		return this.version;
	},
	
	/**
	 * Returns the name of the product
	 * 
	 * */
	getProductName : function(){
		return ''+platform.product.trim();
	},
	
    /*
    * Name: checkForSimulator
    * Description: Determines whether current platform is simulator or real device
    * @Params: None  
    * Returns: None
    * 
    */	
	checkForSimulator : function(){
		var pageUrl = document.location.href;
		var urlVars = this.getURLVars();
		if(urlVars["forSimulator"] == "Y") {
			var simulatorPlatform = urlVars["simulatorPlatform"];
			if(simulatorPlatform == "iOS") {
				this.simulatorPlatform = "iOS";
				this.isSimulator = true;
			}
			else if(simulatorPlatform == "Android") {
				this.simulatorPlatform = "Android";
				this.isSimulator = true;
			} else if(simulatorPlatform == "WP"){
				this.simulatorPlatform = "WP";
				this.isSimulator = true;
			}
			if(this.isSimulator == true) {
				this.simulatorPlatformVersion = urlVars["platformVersion"];
				this.version = this.simulatorPlatformVersion;
				this.versionString = this.simulatorPlatformVersion;
			}
		}

		this.formFactor = this.FORM_FACTOR.SMART_PHONES;
		if(urlVars["formFactor"] == "tab"){
			this.formFactor = this.FORM_FACTOR.TABLETS;
		} else if(urlVars["formFactor"] == "sp"){
			this.formFactor = this.FORM_FACTOR.SMART_PHONES;
		} 
		
	},
	
	/**
	 * This function will provide the querystring parameters in the key value pair.
	 * @Returns Returns the JSON containing key value pair for querystring parameters. 
	 */
	getURLVars: function() {
		var vars = {}, hash;
	    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	    for(var i = 0; i < hashes.length; i++)
	    {
	      hash = hashes[i].split('=');
	      //vars.push(hash[0]);
	      vars[hash[0]] = hash[1];
	    }
	    return vars;
	}
	
	/*init : function(deviceType) {
		//Set UserAgent , network , platform
		this.userAgent = navigator.userAgent.toLowerCase();
		var url = document.location.href;
		this.isOnline = navigator.onLine;
		this.deviceName = navigator.platform;
		
		if((url.indexOf("http://")>-1)||(url.indexOf("https://")>-1)){
			this.deviceOS = this.DEVICE_OS.WEB;
			this.osString =  this.DEVICE_OS_STRING.OS_STRING_WEB;
			this.isWeb= true;
			//TODO to determine the browser version and OS name
			this.checkForSimulator();
			return;
		}
		
		else if (this.userAgent.indexOf("android") > -1) {
			this.isAndroid = true;
			this.deviceOS = this.DEVICE_OS.ANDROID;
			this.osString =  this.DEVICE_OS_STRING.OS_STRING_ANDROID;
			//this.version = this.searchVersion('Android', 8);
			var androidVersionPattern = /android (\d+(?:\.\d+)+);/i;
			var searchedString = androidVersionPattern.exec(this.userAgent);
			if(searchedString != undefined && searchedString != null && searchedString.length > 1) {
				this.versionString = searchedString[1];
				this.version = parseFloat(searchedString[1]);
			}
			this.isAndroid = true;
			if (this.userAgent.match(/Mobile/i)) {
				this.formFactor = this.FORM_FACTOR.SMART_PHONES;
			} else {
				this.formFactor = this.FORM_FACTOR.TABLETS;
			}
		} else if (this.userAgent.match(/iPhone/i)|| this.userAgent.match(/iPod/i)) {
			var platform = "";
			if(this.userAgent.match(/iPhone/i)) {
				platform = "iphone";
			}
			else {
				platform = "ipod";
			}
			this.isiPhone = true;
			this.deviceOS = this.DEVICE_OS.IOS;
			this.osString =  this.DEVICE_OS_STRING.OS_STRING_IOS;
			var regexPattern = platform+" OS (\\d+)_(\\d+)";
			var regexObj = new RegExp(regexPattern, "i");
			var result = this.userAgent.match(regexObj);
			if(result != undefined && result != null && result.length >= 2) {
				this.versionString = result[1];
				if(result[2] != undefined && result[2] != null) {
					this.versionString += "."+result[2];
				}
				this.version = parseFloat(this.versionString);
			}
			this.formFactor = this.FORM_FACTOR.SMART_PHONES;
		} else if (this.userAgent.match(/iPad/i)) {
			this.isiPad = true;
			this.deviceOS = this.DEVICE_OS.IOS;
			this.osString =  this.DEVICE_OS_STRING.OS_STRING_IOS;
			this.version = this.searchVersion('OS', 3);
			this.formFactor = this.FORM_FACTOR.TABLETS;
			this.isiPad = true;
		}else if(this.userAgent.match(/windows phone/i)){
	
			this.isWindowsPhone = true;
			this.deviceOS = this.DEVICE_OS.WINDOWSPHONE;
			this.osString =  this.DEVICE_OS_STRING.OS_STRING_WP;
			var platform="windows phone"
			var regexPattern = platform+" (\\d+)";
			var regexObj = new RegExp(regexPattern, "i");
			var result = this.userAgent.match(regexObj);
			if(result != undefined && result != null && result.length >= 2) {
				this.versionString = result[1];
				if(result[2] != undefined && result[2] != null) {
					this.versionString += "."+result[2];
				}
				this.version = parseFloat(this.versionString);
			}
	
			this.formFactor = this.FORM_FACTOR.SMART_PHONES;
			
		} 
		else {
	
			this.deviceOS = this.DEVICE_OS.UNKNOWN;
		}
	},
	
	initDeviceiOS: function(){
	
	},
	
	initDeviceAndroid: function(){
	
	},
	
	initDeviceWP: function(){
	
	},
	
	searchVersion : function(dataString, searchIndex) {
		var userAgent = window.navigator.userAgent;
		var i_index = Number(userAgent.indexOf(dataString)) + searchIndex;
		if (i_index == -1)
			return;
		return parseFloat(+userAgent.substring(i_index, i_index + 1));
	},

*/

};
