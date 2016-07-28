
/**
* UIC: Initialize UIC library and global variables.
*
**/

 var globalScope = this;

 appez.uic = {};

appez.uic.vars = {
    
    pageIdStack: [],
    activePageClass: "active-page",
    history: $.mobile.navigate.history,
	isSkipInHistory : false
};


appez.uic.init = function(){
    
      console.log('uic intializing'); 
      
    var uv = appez.uic.vars,
        firstPageId = $('.uic-page').first().attr('id');
    
  
    uv.history.stack[0] = { url: firstPageId };  // overrides default behavior of history manager
    uv.pageIdStack.push(firstPageId); // for managing stack
      
      applyStyleWrapper();
      
      if(platform.os.family === 'Android' && parseInt(platform.os.version) < 4){
      	
        	initializeGb(); 
      }

      if (!appez['smartweb']) {
          console.log('Binding native events from UIC'); // bind native events if Smart Web is not defined 
          bindNativeEvents();
      }
      
       
    
    
    if(platform.os.family === 'iOS'){
        
        //prateek 	initializeiOSTransition();
        
        transformiOSBackButton();        
        
      	
        if(parseInt(platform.os.version) < 7){
        
            fixFixedPosition();            

        }
            }
            
            if(platform.name === 'Chrome'){
            	
            	//initializeiOSTransition(); // remember to uncomment it
            } 
    
	 	
  };


function fixFixedPosition(){
    
    
    // Only on touch devices
    if (Modernizr.touch) {
        $(".uic-page").mobileFix({ // Pass parent to apply to
                                 inputElements: "input,textarea,select", // Pass activation child elements
                                 addClass: "fixfixed" // Pass class name
                                 });
    }
}


function applyStyleWrapper(){
	
	var wrapperClass = '';
  	
  	 if(platform.os.family === 'Android'){   
  	 	
  	 	  if(parseInt(platform.os.version) < 4){
  	 	  	
  	 	  	 wrapperClass = 'android-gb';
  	 	  }
  	 	  else{
  	 	  	
  	 	  	 wrapperClass = 'android-ics';
  	 	  }    
         	
         	$('body').addClass(wrapperClass);
         }
         else if( /* true  */ platform.os.family === 'iOS' ){
             
             if(parseInt(platform.os.version) < 7){
             
                  $('body').addClass('ios-six');
             }
             else{
              
                 $('body').addClass('ios-seven');
             }         	
         }
         else if(platform.name === 'IE Mobile' || platform.name === 'IE'){         	
         	$('body').addClass('wp-eight');	
         }
         else if(platform.name === 'Chrome'){         	
         	$('body').addClass(appezDebug.webTheme);
         }
      }

        function initializeiOSTransition(){
            
            console.log('initialize ios transtion animation ');            
           
            $('.uic-page').each(function(index,el){
              
              var ele = $(el),
                  isBottom = ele.hasClass('bottom');
                  
                  if(isBottom){
                    
                  }
                  else{
                      if(index > 0){
            	  	
            	  	ele.addClass('right');
            	  }
            	  
            	
                  }
                  
                   ele.addClass('transition show');
            	
            }) 
        }
    
      function initializeGb(){
      	
      	console.log('initiating GB start up');      	
      
      	bindGbEvents();      	
      }
      
     

      function transformiOSBackButton(){
      	
      	var iosBack = $('.icon-holder .back-icon');
      	
      	 if(parseInt(platform.os.version) < 7){
      	 	
      	 	 iosBack.html('Back');
      	 }
      	 else{
      	 	
      	 	iosBack.html('');
      	 }         
      }
    
      function bindNativeEvents() {         
      	
      	appez.mmi.registerNativeEventListener(globalScope, globalScope.nativeListenerRegistrar);
      }
      
      function nativeListenerRegistrar(nativeEvent) {
         
      	
      	if(nativeEvent === 0){
      		
      	    nativeBackKeyHandler('native');
      	}
  	
  	     
     }
     
     function nativeBackKeyHandler(arg){  
     	    
         appez.uic.navigate.back(arg); // has to be in this function as caller is function
     }
     
     

      
      function bindGbEvents(){      	
      	
      	console.log('binding gb events');
      	
      	var stateComps = ['.btn','.list-group-item','.media'];
      	
 			$(stateComps).each(function(index, el){
 				
 				el = $(el);
 				
 				el.bind( "vmousedown", mouseDownHandler); 				
 				el.bind( "vmouseup", mouseUpHandler); 	
 				el.bind( "vmousemove", mouseUpHandler);			
 				el.bind( "scrollstop", mouseUpHandler);
 			}); 
      }
      
     
      
      function mouseDownHandler(e){   
      	
      	//console.log('mouse over triggered');
      	
      	$(this).addClass('active');
      	
      }
      
      function mouseUpHandler(){
      	
      	//console.log('mouse out triggered');
      	
      	$(this).removeClass('active');
      }
      
      
      
      // Create and return the constructor function for the Timer.
        // We'll wrap this in its own execution space.
        var Timer = (function( $ ){
 
 
            // Define the constructor for the timer.
            function timer( timeout ){
 
                // Create a new Deferred object - this will be
                // resolved when the timer is finished.
                var deferred = $.Deferred();
 
                // Lock the deferred object. We are doing this so we
                // can alter the resultant object.
                var promise = deferred.promise();
 
                // Define our internal timer - this is what will be
                // powering the delay.
                var internalTimer = null;
 
                // Store the context in which this timer was executed.
                // This way, we can resolve the timer in the same
                // context.
                var resolveContext = this;
 
                // Get any additional resolution arguments that may
                // have been passed into the timer.
                var resolveArguments = Array.prototype.slice.call(
                    arguments,
                    1
                );
 
 
                // Add a CLEAR method to the timer. This will stop
                // the underlying timer and reject the deferred.
                promise.clear = function(){
 
                    // Clear the timer.
                    clearTimeout( internalTimer );
 
                    // Reject the deferred. When rejecting, let's use
                    // the given context and arguments.
                    deferred.rejectWith(
                        resolveContext,
                        resolveArguments
                    );
 
                };
 
                // Set the internal timer.
                internalTimer = setTimeout(
                    function(){
 
                        // Once the timer has executed, we'll resolve
                        // the deferred object. When doing so, let's
                        // use the given context and arguments.
                        deferred.resolveWith(
                            resolveContext,
                            resolveArguments
                        );
 
                        // Clear the timer (probably not necessary).
                        clearTimeout( internalTimer );
 
                    },
                    timeout
                );
 
                // Return the immutable promise object.
                return( promise );
 
            };
 
 
            // ---------------------------------------------- //
            // ---------------------------------------------- //
 
 
            // Return the timer function.
            return( timer );
 
 
        })( jQuery );


$.fn.mobileFix = function (options) {
    var $parent = $(this),
    $fixedElements = $(options.fixedElements);
    
    $(document)
    .on('focus', options.inputElements, function(e) {
        $parent.addClass(options.addClass);
        })
    .on('blur', options.inputElements, function(e) {
        $parent.removeClass(options.addClass);
        
        // Fix for some scenarios where you need to start scrolling
        setTimeout(function() {
                   $(document).scrollTop($(document).scrollTop())
                   }, 1);
        });
    
    return this; // Allowing chaining
};

function addRemoveClass(elId,addCls,remCls, inverse){
    
    if(inverse){
      $('#' + elId).removeClass(remCls).addClass(addCls);
    }
    else{
    
         $('#' + elId).addClass(addCls).removeClass(remCls);
    }

    

}







;
 /**
  *
  *  Import Manager: detects the platform at runtime and loads the platform specific styles
 **/

    // to do: need to add version specific check for platform detection
    
    appez.env = 'dev';
    appez.weinre = false;    
    appez.smartwebPrefix = ''; // used to accommodate changes in smart web structure
    
    if (!appez['smartweb']) {
    	
    	appez.smartwebPrefix = '';
     }
    var appezDebug = {    	
    	
        webTheme: 'ios-seven'
    },        
	
     lessUrl =  '<script src="' + appez.smartwebPrefix + 'appez/uic/uic-dependency/less-1.7.0.min.js"></script>',
     styleUrl = '<link rel="{rel}" type="text/css" href="' + appez.smartwebPrefix + 'appez/uic/resources/styles/{fileName}{fileExtention}">',
     weinreUrl = '<script src="http://172.26.39.60:8081/target/target-script-min.js#revamp"></script>',
     styleFile = ''; 
     
     if(appez.weinre){
    	
    	document.write(weinreUrl);
     }
     
     
    
	 
	 if(platform.os.family === 'Android'){	
	 	
	 	if(parseInt(platform.os.version) < 4){
	 		
	 		styleUrl = getStyleUrl(styleUrl,'android-gb');
	 	}
	 	else{
	 		
	 		styleUrl = getStyleUrl(styleUrl,'android-ics');
	 	}		
		  
	 }
	 else if(platform.os.family === 'iOS'){
	 	
	 	if(parseInt(platform.os.version) < 7){
	 		
	 		styleUrl = getStyleUrl(styleUrl,'ios-six');
	 	}
	 	else{
	 		
	 		styleUrl = getStyleUrl(styleUrl,'ios-seven');
	 	}
		
		
	 }
	 else if(platform.name === 'IE Mobile' || platform.name === 'IE'){
		
		    styleUrl = getStyleUrl(styleUrl,'wp-eight'); 	
	 }
	 else if(platform.name === 'Chrome'){
	 
	 // styles that gets loaded when platform is web
	 
	    styleUrl = getStyleUrl(styleUrl,appezDebug.webTheme);
	 }
	 
	 console.log(' Loading ' + styleUrl);	
	 
    document.write(styleUrl);
    
    if(appez.env === 'dev'){    	
    	
	  less = {
	    env: "development"
	  };
    	
      document.write(lessUrl);
    }
    
    function getStyleUrl(styleUrl,fileName){  
	 		
	 	styleUrl = styleUrl.replace('{fileName}',fileName);	 	
	 
		if(appez.env === 'dev'){
						
			styleUrl = styleUrl.replace('{rel}','stylesheet/less').replace('{fileExtention}', '.less');
		}
		else{
			
			styleUrl = styleUrl.replace('{rel}','stylesheet').replace('{fileExtention}', '.css');
		}		
		return styleUrl;
    }
    
    
    
    
    
    
    
    
    
    
    
;
/**
*
*  Animation Manager: Responsible for screen navigation animations   
**/


appez.uic.animation = (function () {

    var uv = appez.uic.vars,
        history = uv.history,
        activePageClass = appez.uic.vars.activePageClass,
        animationName = 'webkitTransitionEnd',
        isWp = false,
        isAnimating = false;


    if (platform.name === 'IE Mobile' || platform.name === 'IE') {

        isWp = true;
        animationName = 'animationend';
    }


    function animater(pageId, tranConfig, initiateAnimation) {
        // Create a new Deferred.
        var dfd = new $.Deferred(),
            el = $('#' + pageId),
            activeEl = $('#' + tranConfig.activePageId),
            targetEl = $('#' + tranConfig.targetPageId);
            
            tranConfig.activeEl = activeEl;
            tranConfig.targetEl = targetEl;
    
                       
             appez.isAnimating = true;

        el.bind(animationName, function () {
            // When we're done animating
            // we'll resolve our Deferred.
            // This will call any done() callbacks
            // attached to either our Deferred or
            // one of its promises.
            dfd.resolve(el, tranConfig);
        });

        if (initiateAnimation) {
        
            if (tranConfig.dir === 'forward') {

                if (isWp) {
                    console.log('WP forward direction');

                    el.addClass('forward-out');
                }
                else {
                    // console.log(' iOS forward animation --> activeEl --> '+ tranConfig.activePageId + 'targetEl --> '+ tranConfig.targetPageId);

                    if(targetEl.hasClass('bottom')){
                      
                      targetEl.removeClass('bottom');
                      
                      appez.isAnimating = false;
                      
                    }
                    else{
                      targetEl.removeClass('right').addClass('center');
                      activeEl.removeClass('center').addClass('left');
                    }
                    
                    
                }
            }
            else if (tranConfig.dir === 'backward') {

                // animation direction is backward

                if (isWp) {
                    console.log('WP backward direction');
                    el.addClass('backward-out');
                }
                else {
                    //console.log(' iOS backward animation --> activeEl --> 'tranConfig.activePageId + 'targetEl --> '+ tranConfig.targetPageId);
                    
                    if(activeEl.hasClass('modal-animation')){
                      
                      activeEl.addClass('bottom');
                      appez.isAnimating = false;
                    }
                    else{
                      targetEl.removeClass('left').addClass('center');
                      activeEl.removeClass('center').addClass('right');
                    }
                    
                }
            }
        }
        else {
            console.log('animation was not initiated');
        }

        // Return an immutable promise object.
        // Clients can listen for its done or fail
        // callbacks but they can't resolve it themselves
        return dfd.promise();
    }

    function screenTransition(tranConfig) {
       
        var activePromise = animater(tranConfig.activePageId, tranConfig, true);

            $.when(activePromise).then(function (el, tranConfig) {            

            var targetPromise = animater(tranConfig.targetPageId, tranConfig, false);

            targetPromise.done(targetAnimationDoneHandler);
            targetPromise.fail(targetAnimationFailHandler);

            });

        activePromise.done(activeAnimationDoneHandler);
        activePromise.fail(activeAnimationFailHandler);

    }

    function activeAnimationDoneHandler(el, tranConfig) {
    	
    	var activeEl = tranConfig.activeEl,
    	    targetEl = tranConfig.targetEl;                      
              
        console.log('active animation done handler called');
        
        if(isWp){
          
          if (tranConfig.dir === 'forward') {
            
             activeEl.removeClass('active-page forward-out');
            targetEl.addClass('active-page forward-in');
          }
          else{
             // animation direction is backward
             activeEl.removeClass('active-page backward-out');
             targetEl.addClass('active-page backward-in');
          }
        }
        else{
          	// iOS animation active page animation done handler
            	 appez.isAnimating = false;
        }

        el.unbind(animationName);
        

    }

    function activeAnimationFailHandler() {

        alert('active animation fail handled');

    }


    function targetAnimationDoneHandler(el, tranConfig) {
    	
    	var activeEl = tranConfig.activeEl,
    	    targetEl = tranConfig.targetEl;

        console.log('target animation done handler called');
        appez.isAnimating = false;

        if (isWp) {
 
           if (tranConfig.dir === 'forward') {
             
             targetEl.removeClass('forward-in');
           }
           else{
             // animation direction is backward
              targetEl.removeClass('backward-in');
           }
        }

        el.unbind(animationName);

    }

    function targetAnimationFailHandler() {

        alert('target fail handled');

    }

    // Reveal public pointers to
    // private functions and properties

    return {
        screenTransition: screenTransition
    };

})();





;
/**
*
*  Navigation Manager: Responsible for stack management for screen and facilitates 
                       in-app navigation   
**/

appez.isAnimating = false;


appez.uic.navigate = (function () { 
    
    var uv = appez.uic.vars,
        history = uv.history,
        activePageClass = appez.uic.vars.activePageClass;
       
 
        function navigateTo(pageId, controllerObj, animate)	 {
                      
                      if(appez.isAnimating){
                      
                          console.log('animation in progress');
                      
                         return false;
                      }                      
             if(uv.isSkipInHistory===true){
							uv.isSkipInHistory = false;
							// If flag is true then remove page from history before navigating forward.
							removePageHistory();
					  }          
                      
            console.log( "Navigating to page with id:" + pageId );
            if(controllerObj!=undefined && appez['smartweb']!=undefined){
            	//We are expecting this argument in case of SmartWeb only
            	appez.smartweb.navigateTo(pageId, controllerObj);              	
               
                // we need to handle back button for iOS after dom render
                if(platform.os.family === 'iOS'){
                	 console.log(' transforming iOs back button from navigator ');
                    transformiOSBackButton();
                }              
            }             
            
            
            if(uv.pageIdStack.indexOf(pageId) === -1){  
                console.log('pushing into pageIdStack ' + pageId);
               uv.pageIdStack.push(pageId);             
            } 
            
                          
            transitionTo(pageId, animate); 
            
             //if(!history.find(pageId)){                  
               history.add(pageId);             
            //} 
            
            history.direct({'url':pageId}); 
            
        }
        
        function transitionTo(pageId, animate){
        	
        	var activeIndex = uv.pageIdStack.indexOf(getUicPageId('active')), // history.activeIndex,
                pageIndex = uv.pageIdStack.indexOf(pageId);
        

        	if(animate === false) {        	  

        	    console.log('transitioning page without animation ');

                transitionWithoutAnimation(pageId, activePageClass);

        	    return false;
        	}
        	
        	if(platform.os.family === 'Android'){
        		
        		console.log('android animation trnasition');
        		
        		transitionWithoutAnimation(pageId, activePageClass);
        	}
        	else if(/*true*/  platform.os.family === 'iOS' ){
        		
        		console.log('ios animation transition pageIndex: '+ pageIndex +' activeIndex: '+ activeIndex);
				// Stopped animation for iOS
                 transitionWithoutAnimation(pageId, activePageClass);
				/*
        		if(pageIndex > activeIndex){
        			
                    transitionForward(pageId);
        			
        		}
        		else if(pageIndex < activeIndex){
        			transitionBackward(pageId);
        		}    */
        	}
        	else if(platform.name === 'IE Mobile' || platform.name === 'IE'){
        		
        	    console.log('wp animation transition');

        	   transitionWithoutAnimation(pageId, activePageClass);
        		/*
        		 if(pageIndex > activeIndex){         			
        		    
        		     transitionForward(pageId);
        		}
        		else{            			
        		    transitionBackward(pageId);  
        		} */
        	}
        	else if(platform.name === 'Chrome'){
        		
        	    console.log('web animation trnasition');

        	    transitionWithoutAnimation(pageId, activePageClass);
        	
        	}
        }


        function transitionWithoutAnimation(pageId, activePageClass) {

            $('.' + activePageClass).removeClass(activePageClass);
            $('#' + pageId).addClass(activePageClass);
                      
            appez.isAnimating = false;

        }
        
        function transitionForward(pageId){
        	
            console.log('screen transition forward  active page id --> ' + getUicPageId('active'));
        	        	
                      var aniConfig = {
  	
			  	'activePageId': getUicPageId('active'),			  	
			  	'targetPageId': pageId,
			  	'dir': 'forward' 
			  };			  
			 
        	
        	appez.uic.animation.screenTransition(aniConfig);
        	
        }
    
        

        function transitionBackward(pageId){
        	
            console.log('screen transition backward active page id --> ' + getUicPageId('active'));
        	
        	var aniConfig = {
  	
			  	'activePageId': getUicPageId('active'),			  	
			  	'targetPageId': pageId,
			  	'dir': 'backward' 
			  };			  
			 
        	
        	appez.uic.animation.screenTransition(aniConfig);  
        	
        }
 
        function navigateToFirstScreen( ) {
            console.log( "Navigating to first page:");
            navigateTo(uv.pageIdStack[0]);
        }
 
        function navigateToBackScreen() {

        	
            console.log("Navigating back ");
          
            if((platform.name === 'IE Mobile' || platform.name === 'IE')){

                var callArgs = navigateToBackScreen.caller.arguments;               

                if (callArgs[0] !== 'native') {

                    console.log("preventing nav back from WP8 UI");

                    return false;  // don't entertain back nav request from WP8 soft back button
                }
            }
        	
        	 var nav = appez.uic.navigate;
     	 
     	     if(nav.getPageId('back') === 'NA'){       	     	
     	     	
     	     	
     	     	appez.mmi.showDecisionDialog({'message':'Exit app?'}, appExitCallBackHandler, this);
     	     	
     	     	return false;
     	     }
     	     else  if(history.getPrev()){
            
                var pageId = history.getPrev().url;
                
                console.log("Navigating to back page:" + pageId);
                 
                 if(pageId!=undefined && appez['smartweb']!=undefined){
                 	//We are expecting this argument in case of SmartWeb only
                 	appez.smartweb.navigateBack(pageId);
                 }

                if(navigateTo(pageId) !== false)
				{
					//Removed the page from the stack once the user has navigated back
					uv.pageIdStack.pop(getUicPageId('active'));
				}
            }
            else{
     	         console.log('history.getPrev() ' + history.getPrev() + ' is undefined history.getLast() ' + history.getLast().url);
            }           
            
           
        }
		
		function removePageHistory(){
				if(history.getPrev()){
				
					var pageId = history.getPrev().url;
					
					console.log("Navigating to back page:" + pageId);
					 
					 if(pageId!=undefined && appez['smartweb']!=undefined){
						//We are expecting this argument in case of smartweb only
						appez.smartweb.removePageHistory();
					 }

					//Removed the page from the stack once the user has navigated back
					uv.pageIdStack.pop(getUicPageId('active'));
					
					 history.direct({'url':pageId});
				}
				else{
					 console.log('history.getPrev() ' + history.getPrev() + ' is undefined history.getLast() ' + history.getLast().url);
				}

		}
	
		function skipInHistory(){
			appez.uic.vars.isSkipInHistory = true;
			
		}
        
        function getUicPageId(param){
        	
        	var activeIndex = history.activeIndex;
        	
        	if(param === 'active'){
        		
        		return history.stack[activeIndex].url;
        	}
        	else if(param === 'back'){
        	    console.log('Back pressed at screen:');

        	    if (history.stack[activeIndex - 1]) {

        	        return history.stack[activeIndex - 1].url || 'NA';
        	    }
        	    else {
        	        return 'NA';
        	    }
        		
        	}
        	else if(param === 'next'){
        		// doesn't support asynchronous UI flow
        		return uv.pageIdStack[activeIndex + 1] || 'NA';
        	}
        	
        } 
        
        function clearStack(){
          
          var firstPage = uv.pageIdStack[0];
         
          uv.pageIdStack.length = 1; // only first element remians in array 
          uv.history.stack.length = 1;
          uv.history.activeIndex = 0;
          
          navigateTo(firstPage);
          
        }
 
        // Reveal public pointers to
        // private functions and properties
 
        return {
            to: navigateTo,
            firstScreen: navigateToFirstScreen,
            back: navigateToBackScreen,
            getPageId: getUicPageId,
            transitionTo: transitionTo,
            clearStack: clearStack,
			skipInHistory : skipInHistory
        };
 
    })();
    
    function appExitCallBackHandler(smartEventResponse){
     	
     	console.log('app exit desicion call back -> '+JSON.stringify(smartEventResponse.getServiceResponse()));  
   
	   if (smartEventResponse.getServiceResponse().userSelection == 0) {	   
		   
	//	   var messageToSend = '{"transactionId":1395217652571,"isResponseExpected":true,"transactionRequest":{"serviceOperationId":30001,"serviceRequestData":"eyJtZXNzYWdlIjoiQW4gaW1wb3J0YW50IG1lc3NhZ2UifQ=="},"transactionResponse":{}}';
			   
			   appez.mmi.sendAppEvent("My event data", appez.mmi.constant.APP_NOTIFY_EXIT);
			   
	      }
     	
     	
     }
    


   
   
