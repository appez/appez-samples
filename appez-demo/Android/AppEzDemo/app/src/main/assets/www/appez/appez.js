/**
 * Defines the global object named 'appez'
 */
var appez = {
	deviceManager : null,
	
	appData : {},

	init : function() {
		this.deviceManager = appezDevice;
		this.deviceManager.init();
	},
	
	/**
	 * For storing objects in Session storage
	 */
	persist : function(key, value) {t
		this.appData[key] = value;
	},

	/**
	 * For retrieving objects from Session storage
	 */
	retrieve : function(key) {
		return this.appData[key];
	},

	/**
	 * Helper functions for determining whether or not the device is of
	 * particular OS or not
	 * 
	 */
	getDevice : function(){
		return this.deviceManager;
	},
	
	getDeviceOs : function() {
		return this.getDevice().deviceOS;
	},
	
	getDeviceOsVersion : function() {
		return this.getDevice().version;
	},

	isAndroid : function() {
		return this.getDevice().isAndroid;
	},

	isIPad : function() {
		return this.getDevice().isiPad;
	},

	isIPhone : function() {
		return this.getDevice().isiPhone;
	},

	isWindowsPhone : function() {
		return this.getDevice().isWindowsPhone;
	},
	
	configureConsoleLog : function(){
		if(appez['mmi']!=undefined && appez.getDevice().deviceOS!=appez.getDevice().DEVICE_OS.WEB){
			console.log = function(message){
				appez.mmi.log(message);
			};
			
			console.error = function(message){
				appez.mmi.log(message, appez.mmi.constant.LOG_LEVEL_ERROR);
			};
		}		
	}
}

$(document).ready(function() {
	// The framework needs to initialise the individual layers as included by
	// the user
	if(appez!=undefined){
		console.log('Initialising the appez core component');
		appez.init();
	}
	
	if(appez['mmi']!=undefined){
		console.log('Initialising the appez MMI component');
		appez.mmi.init();
	}
	appez.configureConsoleLog();
	
	if(appez['smartweb']!=undefined){
		console.log('Initialising the appez SmartWeb component');
		appez.smartweb.init();
	}
	
	if(appez['uic']!=undefined){
		console.log('Initialising the appez UIC component');
		appez.uic.init();
	}
});
