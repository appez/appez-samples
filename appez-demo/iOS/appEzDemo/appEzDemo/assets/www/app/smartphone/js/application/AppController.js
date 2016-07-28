appezdemo.application.AppController = appez.smartweb.createClass({
	className:"appezdemo.application.AppController",
	singleton:true,
	extend:appez.smartweb.swcore.BaseAppController,
	
	/**
	* Initialises the first controller of the screen. In most cases, this controller is the first screen of the application.
	*/
	init : function(){
		this.parent.init();
		appez.mmi.registerNativeEventListener(this, this.onReceiveNativeEvent);
		appez.mmi.showWebView();
		this.initLoginController();
	},
	
	onGetNotifierEvents : function(notifierEvent){
        console.log('In onGetNotifierEvents ...........'+JSON.stringify(notifierEvent));
	},
	
	onReceiveNativeEvent:function(nativeNotification){
		appez.mmi.log('onReceiveNativeEvent->nativeNotification:'+nativeNotification);
		switch(nativeNotification){
		case appez.mmi.constant.NATIVE_EVENT_BACK_PRESSED:case appez.mmi.constant.NATIVE_EVENT_ACTIONBAR_UP_PRESSED:
			appez.smartweb.getCurrentController().onClickBack('native');
			break;

		default:
            var notification = parseInt(nativeNotification);
            if(notification>=10000){
                //Means it is a menu selection because all the native notifications are single/double digits
                appez.smartweb.getCurrentController().handleMenuOptionEvent(nativeNotification);
            }
		    break;
		}
	},
	
	/**
	 * Callback method if user selects YES to exit the application.
	 */
	onReceiveAppExitNotification : function(){
		
	},	

	initLoginController : function() {
		var loginController = new appezdemo.controller.LoginController();
		loginController.init();
		
	}

});

$(document).ready(function() {
	appezdemo.application.AppController.init();
});