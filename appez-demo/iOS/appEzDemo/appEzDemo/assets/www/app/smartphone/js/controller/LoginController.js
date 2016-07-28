/**
* appezdemo.controller.LoginController
*/
appezdemo.controller.LoginController = appez.smartweb.createClass({
	className:"appezdemo.controller.LoginController",//Class name for this controller
	singleton:false,
    errorMessage : '',
	extend:appez.smartweb.swcore.BaseController,//Super class is BaseController
	uniqueId : null,
	pushToken : null,
	menuId :'{}',//List of menu ID's applicable for this controller

	/**
	* Controller gets initialised here.
	* */
	init : function() {
		this.process();
	},

	/**
	* Binding of view with controller takes place here.
	* Business logic can also be placed here.
	*/
	process : function(){
		var pageTemplate =  appezdemo.view.LoginControllerTemplate;
		$("#LoginDiv").html(pageTemplate);
		appez.uic.navigate.to('LoginDiv',this);
		this.bindEvents();
	},

	bindEvents: function () {
	    $('#LoginDiv .back-page').bind('tap',appez.smartweb.getCurrentController().onClickBack);
		$('#LoginDiv .goToHome').bind('tap',appez.smartweb.getCurrentController().goToHome);
	},

	/**
	* Handles user action when back is pressed(ActionBar back button for Android 4.0+ & navigation bar button in case of iOS)
	*/
	onClickBack:function() {
		appez.uic.navigate.back();
        return false;
	},

	/**
	* Handles action button selection. Used for invoking UI ActionSheet in case of iOS
	*/
	onClickAction : function(){

	},

	/**
	* Specify the action to be taken when the menu option is selected
	* @param optionID: Menu option selected by the user
	*/
	handleMenuOptionEvent : function(optionID){
		switch (optionID)
        {
			default:
                break;
		}
	},

	goToHome : function(){
		console.log('login pressed');
	},

	goToShareApp: function(){
        var share = {
            'newsDesc' : 'Hello Message!'
        };
        var configInfo = {
            "eventType":appezdemo.constant.APP_EVENT_SHARE_APP,
            "eventData":JSON.stringify(share)
        };
        appez.mmi.sendAppEvent(JSON.stringify(configInfo), appez.mmi.constant.APP_CONTROL_TRANSFER);
        return false;
	}
});
