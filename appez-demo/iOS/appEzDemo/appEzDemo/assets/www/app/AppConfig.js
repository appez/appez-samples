var appezdemo = appez.smartweb.initApplication({
	appName:"AppEz demo",//Application name
	appVersion:"1.0",//Application Version
	config: {
		//Defines the Log threshold value. 
		//For None: 0
		//For Error: 1
		//For Warning: 2
		//For Debug: 3
		//For Info: 4
		LOG_THRESHOLD: 0,
		APP_MODE:"DEV",//Configures the application mode(DEVELOPER,PRODUCTION etc.)
		appStartupInfo:'{"topbarstyle":{}}',//Application startup info
		appExitMessage : 'Are you sure you want to exit the application?',
   	   	shouldDisplayAppExitDialog : true
     }
});