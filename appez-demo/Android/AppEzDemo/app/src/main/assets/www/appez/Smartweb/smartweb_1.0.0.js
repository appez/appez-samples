/**
 * Provides a wrapper by which the user can use the services of the appez SmartWeb layer
 * 
 * Implementation specifications-
 * 1. User now needs to register the controller for it to get the click/tap event callbacks as defined in the ScreenTemplates.xml. For that the 'setCurrentController()' needs to be used
 * 
 * */
appez.smartweb = {
		util : {
			"graph":{}
		},
		manager : {},
		model : {},
		swcore : {},
		
		currentController : {},
		
		init : function(){
			appez.smartweb.manager.StackManager.init();
			//Read the contents of the 'ScreenTemplates.xml' file
			appez.smartweb.manager.ApplicationManager.initScreenTemplates();
		},
		
		createClass : function(memberVariables) {
			return appez.smartweb.util.ClassManager.createClass(memberVariables);
		},
		
		initApplication : function(appConfig){
			var app = appez.smartweb.manager.ApplicationManager.initApplication(appConfig);
			return app;
		},
		
		getApplication : function(){
			return appez.smartweb.manager.ApplicationManager.application;
		},
		
		setCurrentController : function(curController){
			this.currentController = curController;
		},
		
		getCurrentController : function(){
			//TODO Need to see how user current controller can be derived
			return this.currentController;
		},
				
		navigateTo : function(pageId, controllerObj){
			appez.smartweb.manager.StackManager.navigateTo(pageId, controllerObj);
		},
		
		navigateBack : function(previousPage){
			appez.smartweb.manager.StackManager.navigateBack(previousPage);
		},
		removePageHistory : function(){
			agentcore.mvc.manager.StackManager.removePageHistory();
		},
		
		drawBarChart : function(chartReqdata){
			if(chartReqdata){
				if((chartReqdata[appez.smartweb.constant.CHART_REQ_PARAM_TARGET_DIV]!=undefined)&&(chartReqdata[appez.smartweb.constant.CHART_REQ_PARAM_DATA]!=undefined)){
					chartReqdata[appez.smartweb.constant.CHART_REQ_PARAM_GRAPH_TYPE] = appez.smartweb.constant.CHART_TYPE_BAR;
					appez.smartweb.util.graph.GraphAdapter.drawGraph(chartReqdata);
				} else {
					//Show an error since the required parameters are not present
					console.error(appez.smartweb.constant.ERROR_MSG_MISSING_REQUIRED_FIELD);
				}
			} else {
				//Show an error since the required parameters are not present
				console.error(appez.smartweb.constant.ERROR_MSG_UNDEFINED_GRAPH_REQUEST);
			}
		},
		
		drawPieChart : function(chartReqdata){
			if(chartReqdata){
				if((chartReqdata[appez.smartweb.constant.CHART_REQ_PARAM_TARGET_DIV]!=undefined)&&(chartReqdata[appez.smartweb.constant.CHART_REQ_PARAM_DATA]!=undefined)){
					chartReqdata[appez.smartweb.constant.CHART_REQ_PARAM_GRAPH_TYPE] = appez.smartweb.constant.CHART_TYPE_PIE;
					appez.smartweb.util.graph.GraphAdapter.drawGraph(chartReqdata);
				} else {
					//Show an error since the required parameters are not present
					console.error(appez.smartweb.constant.ERROR_MSG_MISSING_REQUIRED_FIELD);
				}
			} else {
				//Show an error since the required parameters are not present
				console.error(appez.smartweb.constant.ERROR_MSG_UNDEFINED_GRAPH_REQUEST);
			}
		},
		
		drawLineChart : function(chartReqdata){
			if(chartReqdata){
				if((chartReqdata[appez.smartweb.constant.CHART_REQ_PARAM_TARGET_DIV]!=undefined)&&(chartReqdata[appez.smartweb.constant.CHART_REQ_PARAM_DATA]!=undefined)){
					chartReqdata[appez.smartweb.constant.CHART_REQ_PARAM_GRAPH_TYPE] = appez.smartweb.constant.CHART_TYPE_LINE;
					appez.smartweb.util.graph.GraphAdapter.drawGraph(chartReqdata);
				} else {
					//Show an error since the required parameters are not present
					console.error(appez.smartweb.constant.ERROR_MSG_MISSING_REQUIRED_FIELD);
				}
			} else {
				//Show an error since the required parameters are not present
				console.error(appez.smartweb.constant.ERROR_MSG_UNDEFINED_GRAPH_REQUEST);
			}
		},
		
		drawDoughnutChart : function(chartReqdata){
			if(chartReqdata){
				if((chartReqdata[appez.smartweb.constant.CHART_REQ_PARAM_TARGET_DIV]!=undefined)&&(chartReqdata[appez.smartweb.constant.CHART_REQ_PARAM_DATA]!=undefined)){
					chartReqdata[appez.smartweb.constant.CHART_REQ_PARAM_GRAPH_TYPE] = appez.smartweb.constant.CHART_TYPE_DOUGHNUT;
					appez.smartweb.util.graph.GraphAdapter.drawGraph(chartReqdata);
				} else {
					//Show an error since the required parameters are not present
					console.error(appez.smartweb.constant.ERROR_MSG_MISSING_REQUIRED_FIELD);
				}
			} else {
				//Show an error since the required parameters are not present
				console.error(appez.smartweb.constant.ERROR_MSG_UNDEFINED_GRAPH_REQUEST);
			}
		}
};appez.smartweb.constant = {
		
		//Chart related constants
		CHART_REQ_PARAM_GRAPH_TYPE:'graphType',
		CHART_REQ_PARAM_TARGET_DIV:'targetDiv',
		CHART_REQ_PARAM_DATA:'chartData',
		
		CHART_TYPE_BAR : 'bar',
		CHART_TYPE_PIE : 'pie',
		CHART_TYPE_LINE : 'line',
		CHART_TYPE_DOUGHNUT : 'doughnut',
		
		ERROR_MSG_MISSING_REQUIRED_FIELD : 'Missing required field in graph request',
		ERROR_MSG_UNDEFINED_GRAPH_REQUEST : 'Invalid graph request'
};/** 
 * 
 *	This class represents a generic class manager.
 *	Responsible for instantiating a class, access and its life cycle.
 * 
 **/

appez.smartweb.util.ClassManager = {
	className : "appez.smartweb.util.ClassManager",
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

};

/** 
 * 
 *	This class represents a Base class for all application controller.
 *	Use to serve the basic skeleton for extending further based on specific implementation.
 * 
 **/

appez.smartweb.swcore.BaseAppController = appez.smartweb.createClass({
	className:"appez.smartweb.swcore.BaseAppController",
	singleton:true,
	isAppInitController:false,
	
	init : function(){
		// do nothing here
	}
});;

/** 
 * 
 *	This class represents a Base class for all Controllers.
 *	Use to serve the basic skeleton for extending further based on specific implementation.
 * 
 **/

appez.smartweb.swcore.BaseController = appez.smartweb.createClass({
	className:"appez.smartweb.swcore.BaseController", //Contains Class Name
	menuId:undefined,                      //specify menu item for each screen , Bydefault it is undefined
	
	init : function(){
//		eMob.getViewManager().setCurrentController(this);
	},
	
	//Native event methods
	onPageInit : function(){
		
	},
	
	onBackKeyPressed : function(){
		
	},
	
	onMenuItemSelection : function(menuIdSelected){
		
	},
	
	getClassName : function(){
		return this.className;
	}
	//--------------------------------
});;

/** 
 * 
 *	This class represents a Base class for all the Manager components.
 *	Use to serve the basic skeleton for extending further based on specific implementation.
 * 
 **/

appez.smartweb.swcore.BaseManager = appez.smartweb.createClass({
	className:"appez.smartweb.swcore.BaseManager",  //Contains Class Name
//	extend:eMob.service.BaseClass,       //Contains Base Class Name
	singleton:true
});;

/** 
 * 
 *	This class represents a Base class for all Controllers.
 *	Use to serve the basic skeleton for extending further based on specific implementation.
 * 
 **/

appez.smartweb.swcore.BaseModel = appez.smartweb.createClass({
	className:"appez.smartweb.swcore.BaseModel", //Contains Class Name
	
	init : function(){

	}
});;var Chart=function(s){function v(a,c,b){a=A((a-c.graphMin)/(c.steps*c.stepValue),1,0);return b*c.steps*a}function x(a,c,b,e){function h(){g+=f;var k=a.animation?A(d(g),null,0):1;e.clearRect(0,0,q,u);a.scaleOverlay?(b(k),c()):(c(),b(k));if(1>=g)D(h);else if("function"==typeof a.onAnimationComplete)a.onAnimationComplete()}var f=a.animation?1/A(a.animationSteps,Number.MAX_VALUE,1):1,d=B[a.animationEasing],g=a.animation?0:1;"function"!==typeof c&&(c=function(){});D(h)}function C(a,c,b,e,h,f){var d;a=
Math.floor(Math.log(e-h)/Math.LN10);h=Math.floor(h/(1*Math.pow(10,a)))*Math.pow(10,a);e=Math.ceil(e/(1*Math.pow(10,a)))*Math.pow(10,a)-h;a=Math.pow(10,a);for(d=Math.round(e/a);d<b||d>c;)a=d<b?a/2:2*a,d=Math.round(e/a);c=[];z(f,c,d,h,a);return{steps:d,stepValue:a,graphMin:h,labels:c}}function z(a,c,b,e,h){if(a)for(var f=1;f<b+1;f++)c.push(E(a,{value:(e+h*f).toFixed(0!=h%1?h.toString().split(".")[1].length:0)}))}function A(a,c,b){return!isNaN(parseFloat(c))&&isFinite(c)&&a>c?c:!isNaN(parseFloat(b))&&
isFinite(b)&&a<b?b:a}function y(a,c){var b={},e;for(e in a)b[e]=a[e];for(e in c)b[e]=c[e];return b}function E(a,c){var b=!/\W/.test(a)?F[a]=F[a]||E(document.getElementById(a).innerHTML):new Function("obj","var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('"+a.replace(/[\r\t\n]/g," ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g,"$1\r").replace(/\t=(.*?)%>/g,"',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'")+"');}return p.join('');");return c?
b(c):b}var r=this,B={linear:function(a){return a},easeInQuad:function(a){return a*a},easeOutQuad:function(a){return-1*a*(a-2)},easeInOutQuad:function(a){return 1>(a/=0.5)?0.5*a*a:-0.5*(--a*(a-2)-1)},easeInCubic:function(a){return a*a*a},easeOutCubic:function(a){return 1*((a=a/1-1)*a*a+1)},easeInOutCubic:function(a){return 1>(a/=0.5)?0.5*a*a*a:0.5*((a-=2)*a*a+2)},easeInQuart:function(a){return a*a*a*a},easeOutQuart:function(a){return-1*((a=a/1-1)*a*a*a-1)},easeInOutQuart:function(a){return 1>(a/=0.5)?
0.5*a*a*a*a:-0.5*((a-=2)*a*a*a-2)},easeInQuint:function(a){return 1*(a/=1)*a*a*a*a},easeOutQuint:function(a){return 1*((a=a/1-1)*a*a*a*a+1)},easeInOutQuint:function(a){return 1>(a/=0.5)?0.5*a*a*a*a*a:0.5*((a-=2)*a*a*a*a+2)},easeInSine:function(a){return-1*Math.cos(a/1*(Math.PI/2))+1},easeOutSine:function(a){return 1*Math.sin(a/1*(Math.PI/2))},easeInOutSine:function(a){return-0.5*(Math.cos(Math.PI*a/1)-1)},easeInExpo:function(a){return 0==a?1:1*Math.pow(2,10*(a/1-1))},easeOutExpo:function(a){return 1==
a?1:1*(-Math.pow(2,-10*a/1)+1)},easeInOutExpo:function(a){return 0==a?0:1==a?1:1>(a/=0.5)?0.5*Math.pow(2,10*(a-1)):0.5*(-Math.pow(2,-10*--a)+2)},easeInCirc:function(a){return 1<=a?a:-1*(Math.sqrt(1-(a/=1)*a)-1)},easeOutCirc:function(a){return 1*Math.sqrt(1-(a=a/1-1)*a)},easeInOutCirc:function(a){return 1>(a/=0.5)?-0.5*(Math.sqrt(1-a*a)-1):0.5*(Math.sqrt(1-(a-=2)*a)+1)},easeInElastic:function(a){var c=1.70158,b=0,e=1;if(0==a)return 0;if(1==(a/=1))return 1;b||(b=0.3);e<Math.abs(1)?(e=1,c=b/4):c=b/(2*
Math.PI)*Math.asin(1/e);return-(e*Math.pow(2,10*(a-=1))*Math.sin((1*a-c)*2*Math.PI/b))},easeOutElastic:function(a){var c=1.70158,b=0,e=1;if(0==a)return 0;if(1==(a/=1))return 1;b||(b=0.3);e<Math.abs(1)?(e=1,c=b/4):c=b/(2*Math.PI)*Math.asin(1/e);return e*Math.pow(2,-10*a)*Math.sin((1*a-c)*2*Math.PI/b)+1},easeInOutElastic:function(a){var c=1.70158,b=0,e=1;if(0==a)return 0;if(2==(a/=0.5))return 1;b||(b=1*0.3*1.5);e<Math.abs(1)?(e=1,c=b/4):c=b/(2*Math.PI)*Math.asin(1/e);return 1>a?-0.5*e*Math.pow(2,10*
(a-=1))*Math.sin((1*a-c)*2*Math.PI/b):0.5*e*Math.pow(2,-10*(a-=1))*Math.sin((1*a-c)*2*Math.PI/b)+1},easeInBack:function(a){return 1*(a/=1)*a*(2.70158*a-1.70158)},easeOutBack:function(a){return 1*((a=a/1-1)*a*(2.70158*a+1.70158)+1)},easeInOutBack:function(a){var c=1.70158;return 1>(a/=0.5)?0.5*a*a*(((c*=1.525)+1)*a-c):0.5*((a-=2)*a*(((c*=1.525)+1)*a+c)+2)},easeInBounce:function(a){return 1-B.easeOutBounce(1-a)},easeOutBounce:function(a){return(a/=1)<1/2.75?1*7.5625*a*a:a<2/2.75?1*(7.5625*(a-=1.5/2.75)*
a+0.75):a<2.5/2.75?1*(7.5625*(a-=2.25/2.75)*a+0.9375):1*(7.5625*(a-=2.625/2.75)*a+0.984375)},easeInOutBounce:function(a){return 0.5>a?0.5*B.easeInBounce(2*a):0.5*B.easeOutBounce(2*a-1)+0.5}},q=s.canvas.width,u=s.canvas.height;window.devicePixelRatio&&(s.canvas.style.width=q+"px",s.canvas.style.height=u+"px",s.canvas.height=u*window.devicePixelRatio,s.canvas.width=q*window.devicePixelRatio,s.scale(window.devicePixelRatio,window.devicePixelRatio));this.PolarArea=function(a,c){r.PolarArea.defaults={scaleOverlay:!0,
scaleOverride:!1,scaleSteps:null,scaleStepWidth:null,scaleStartValue:null,scaleShowLine:!0,scaleLineColor:"rgba(0,0,0,.1)",scaleLineWidth:1,scaleShowLabels:!0,scaleLabel:"<%=value%>",scaleFontFamily:"'Arial'",scaleFontSize:12,scaleFontStyle:"normal",scaleFontColor:"#666",scaleShowLabelBackdrop:!0,scaleBackdropColor:"rgba(255,255,255,0.75)",scaleBackdropPaddingY:2,scaleBackdropPaddingX:2,segmentShowStroke:!0,segmentStrokeColor:"#fff",segmentStrokeWidth:2,animation:!0,animationSteps:100,animationEasing:"easeOutBounce",
animateRotate:!0,animateScale:!1,onAnimationComplete:null};var b=c?y(r.PolarArea.defaults,c):r.PolarArea.defaults;return new G(a,b,s)};this.Radar=function(a,c){r.Radar.defaults={scaleOverlay:!1,scaleOverride:!1,scaleSteps:null,scaleStepWidth:null,scaleStartValue:null,scaleShowLine:!0,scaleLineColor:"rgba(0,0,0,.1)",scaleLineWidth:1,scaleShowLabels:!1,scaleLabel:"<%=value%>",scaleFontFamily:"'Arial'",scaleFontSize:12,scaleFontStyle:"normal",scaleFontColor:"#666",scaleShowLabelBackdrop:!0,scaleBackdropColor:"rgba(255,255,255,0.75)",
scaleBackdropPaddingY:2,scaleBackdropPaddingX:2,angleShowLineOut:!0,angleLineColor:"rgba(0,0,0,.1)",angleLineWidth:1,pointLabelFontFamily:"'Arial'",pointLabelFontStyle:"normal",pointLabelFontSize:12,pointLabelFontColor:"#666",pointDot:!0,pointDotRadius:3,pointDotStrokeWidth:1,datasetStroke:!0,datasetStrokeWidth:2,datasetFill:!0,animation:!0,animationSteps:60,animationEasing:"easeOutQuart",onAnimationComplete:null};var b=c?y(r.Radar.defaults,c):r.Radar.defaults;return new H(a,b,s)};this.Pie=function(a,
c){r.Pie.defaults={segmentShowStroke:!0,segmentStrokeColor:"#fff",segmentStrokeWidth:2,animation:!0,animationSteps:100,animationEasing:"easeOutBounce",animateRotate:!0,animateScale:!1,onAnimationComplete:null};var b=c?y(r.Pie.defaults,c):r.Pie.defaults;return new I(a,b,s)};this.Doughnut=function(a,c){r.Doughnut.defaults={segmentShowStroke:!0,segmentStrokeColor:"#fff",segmentStrokeWidth:2,percentageInnerCutout:50,animation:!0,animationSteps:100,animationEasing:"easeOutBounce",animateRotate:!0,animateScale:!1,
onAnimationComplete:null};var b=c?y(r.Doughnut.defaults,c):r.Doughnut.defaults;return new J(a,b,s)};this.Line=function(a,c){r.Line.defaults={scaleOverlay:!1,scaleOverride:!1,scaleSteps:null,scaleStepWidth:null,scaleStartValue:null,scaleLineColor:"rgba(0,0,0,.1)",scaleLineWidth:1,scaleShowLabels:!0,scaleLabel:"<%=value%>",scaleFontFamily:"'Arial'",scaleFontSize:12,scaleFontStyle:"normal",scaleFontColor:"#666",scaleShowGridLines:!0,scaleGridLineColor:"rgba(0,0,0,.05)",scaleGridLineWidth:1,bezierCurve:!0,
pointDot:!0,pointDotRadius:4,pointDotStrokeWidth:2,datasetStroke:!0,datasetStrokeWidth:2,datasetFill:!0,animation:!0,animationSteps:60,animationEasing:"easeOutQuart",onAnimationComplete:null};var b=c?y(r.Line.defaults,c):r.Line.defaults;return new K(a,b,s)};this.Bar=function(a,c){r.Bar.defaults={scaleOverlay:!1,scaleOverride:!1,scaleSteps:null,scaleStepWidth:null,scaleStartValue:null,scaleLineColor:"rgba(0,0,0,.1)",scaleLineWidth:1,scaleShowLabels:!0,scaleLabel:"<%=value%>",scaleFontFamily:"'Arial'",
scaleFontSize:12,scaleFontStyle:"normal",scaleFontColor:"#666",scaleShowGridLines:!0,scaleGridLineColor:"rgba(0,0,0,.05)",scaleGridLineWidth:1,barShowStroke:!0,barStrokeWidth:2,barValueSpacing:5,barDatasetSpacing:1,animation:!0,animationSteps:60,animationEasing:"easeOutQuart",onAnimationComplete:null};var b=c?y(r.Bar.defaults,c):r.Bar.defaults;return new L(a,b,s)};var G=function(a,c,b){var e,h,f,d,g,k,j,l,m;g=Math.min.apply(Math,[q,u])/2;g-=Math.max.apply(Math,[0.5*c.scaleFontSize,0.5*c.scaleLineWidth]);
d=2*c.scaleFontSize;c.scaleShowLabelBackdrop&&(d+=2*c.scaleBackdropPaddingY,g-=1.5*c.scaleBackdropPaddingY);l=g;d=d?d:5;e=Number.MIN_VALUE;h=Number.MAX_VALUE;for(f=0;f<a.length;f++)a[f].value>e&&(e=a[f].value),a[f].value<h&&(h=a[f].value);f=Math.floor(l/(0.66*d));d=Math.floor(0.5*(l/d));m=c.scaleShowLabels?c.scaleLabel:null;c.scaleOverride?(j={steps:c.scaleSteps,stepValue:c.scaleStepWidth,graphMin:c.scaleStartValue,labels:[]},z(m,j.labels,j.steps,c.scaleStartValue,c.scaleStepWidth)):j=C(l,f,d,e,h,
m);k=g/j.steps;x(c,function(){for(var a=0;a<j.steps;a++)if(c.scaleShowLine&&(b.beginPath(),b.arc(q/2,u/2,k*(a+1),0,2*Math.PI,!0),b.strokeStyle=c.scaleLineColor,b.lineWidth=c.scaleLineWidth,b.stroke()),c.scaleShowLabels){b.textAlign="center";b.font=c.scaleFontStyle+" "+c.scaleFontSize+"px "+c.scaleFontFamily;var e=j.labels[a];if(c.scaleShowLabelBackdrop){var d=b.measureText(e).width;b.fillStyle=c.scaleBackdropColor;b.beginPath();b.rect(Math.round(q/2-d/2-c.scaleBackdropPaddingX),Math.round(u/2-k*(a+
1)-0.5*c.scaleFontSize-c.scaleBackdropPaddingY),Math.round(d+2*c.scaleBackdropPaddingX),Math.round(c.scaleFontSize+2*c.scaleBackdropPaddingY));b.fill()}b.textBaseline="middle";b.fillStyle=c.scaleFontColor;b.fillText(e,q/2,u/2-k*(a+1))}},function(e){var d=-Math.PI/2,g=2*Math.PI/a.length,f=1,h=1;c.animation&&(c.animateScale&&(f=e),c.animateRotate&&(h=e));for(e=0;e<a.length;e++)b.beginPath(),b.arc(q/2,u/2,f*v(a[e].value,j,k),d,d+h*g,!1),b.lineTo(q/2,u/2),b.closePath(),b.fillStyle=a[e].color,b.fill(),
c.segmentShowStroke&&(b.strokeStyle=c.segmentStrokeColor,b.lineWidth=c.segmentStrokeWidth,b.stroke()),d+=h*g},b)},H=function(a,c,b){var e,h,f,d,g,k,j,l,m;a.labels||(a.labels=[]);g=Math.min.apply(Math,[q,u])/2;d=2*c.scaleFontSize;for(e=l=0;e<a.labels.length;e++)b.font=c.pointLabelFontStyle+" "+c.pointLabelFontSize+"px "+c.pointLabelFontFamily,h=b.measureText(a.labels[e]).width,h>l&&(l=h);g-=Math.max.apply(Math,[l,1.5*(c.pointLabelFontSize/2)]);g-=c.pointLabelFontSize;l=g=A(g,null,0);d=d?d:5;e=Number.MIN_VALUE;
h=Number.MAX_VALUE;for(f=0;f<a.datasets.length;f++)for(m=0;m<a.datasets[f].data.length;m++)a.datasets[f].data[m]>e&&(e=a.datasets[f].data[m]),a.datasets[f].data[m]<h&&(h=a.datasets[f].data[m]);f=Math.floor(l/(0.66*d));d=Math.floor(0.5*(l/d));m=c.scaleShowLabels?c.scaleLabel:null;c.scaleOverride?(j={steps:c.scaleSteps,stepValue:c.scaleStepWidth,graphMin:c.scaleStartValue,labels:[]},z(m,j.labels,j.steps,c.scaleStartValue,c.scaleStepWidth)):j=C(l,f,d,e,h,m);k=g/j.steps;x(c,function(){var e=2*Math.PI/
a.datasets[0].data.length;b.save();b.translate(q/2,u/2);if(c.angleShowLineOut){b.strokeStyle=c.angleLineColor;b.lineWidth=c.angleLineWidth;for(var d=0;d<a.datasets[0].data.length;d++)b.rotate(e),b.beginPath(),b.moveTo(0,0),b.lineTo(0,-g),b.stroke()}for(d=0;d<j.steps;d++){b.beginPath();if(c.scaleShowLine){b.strokeStyle=c.scaleLineColor;b.lineWidth=c.scaleLineWidth;b.moveTo(0,-k*(d+1));for(var f=0;f<a.datasets[0].data.length;f++)b.rotate(e),b.lineTo(0,-k*(d+1));b.closePath();b.stroke()}c.scaleShowLabels&&
(b.textAlign="center",b.font=c.scaleFontStyle+" "+c.scaleFontSize+"px "+c.scaleFontFamily,b.textBaseline="middle",c.scaleShowLabelBackdrop&&(f=b.measureText(j.labels[d]).width,b.fillStyle=c.scaleBackdropColor,b.beginPath(),b.rect(Math.round(-f/2-c.scaleBackdropPaddingX),Math.round(-k*(d+1)-0.5*c.scaleFontSize-c.scaleBackdropPaddingY),Math.round(f+2*c.scaleBackdropPaddingX),Math.round(c.scaleFontSize+2*c.scaleBackdropPaddingY)),b.fill()),b.fillStyle=c.scaleFontColor,b.fillText(j.labels[d],0,-k*(d+
1)))}for(d=0;d<a.labels.length;d++){b.font=c.pointLabelFontStyle+" "+c.pointLabelFontSize+"px "+c.pointLabelFontFamily;b.fillStyle=c.pointLabelFontColor;var f=Math.sin(e*d)*(g+c.pointLabelFontSize),h=Math.cos(e*d)*(g+c.pointLabelFontSize);b.textAlign=e*d==Math.PI||0==e*d?"center":e*d>Math.PI?"right":"left";b.textBaseline="middle";b.fillText(a.labels[d],f,-h)}b.restore()},function(d){var e=2*Math.PI/a.datasets[0].data.length;b.save();b.translate(q/2,u/2);for(var g=0;g<a.datasets.length;g++){b.beginPath();
b.moveTo(0,d*-1*v(a.datasets[g].data[0],j,k));for(var f=1;f<a.datasets[g].data.length;f++)b.rotate(e),b.lineTo(0,d*-1*v(a.datasets[g].data[f],j,k));b.closePath();b.fillStyle=a.datasets[g].fillColor;b.strokeStyle=a.datasets[g].strokeColor;b.lineWidth=c.datasetStrokeWidth;b.fill();b.stroke();if(c.pointDot){b.fillStyle=a.datasets[g].pointColor;b.strokeStyle=a.datasets[g].pointStrokeColor;b.lineWidth=c.pointDotStrokeWidth;for(f=0;f<a.datasets[g].data.length;f++)b.rotate(e),b.beginPath(),b.arc(0,d*-1*
v(a.datasets[g].data[f],j,k),c.pointDotRadius,2*Math.PI,!1),b.fill(),b.stroke()}b.rotate(e)}b.restore()},b)},I=function(a,c,b){for(var e=0,h=Math.min.apply(Math,[u/2,q/2])-5,f=0;f<a.length;f++)e+=a[f].value;x(c,null,function(d){var g=-Math.PI/2,f=1,j=1;c.animation&&(c.animateScale&&(f=d),c.animateRotate&&(j=d));for(d=0;d<a.length;d++){var l=j*a[d].value/e*2*Math.PI;b.beginPath();b.arc(q/2,u/2,f*h,g,g+l);b.lineTo(q/2,u/2);b.closePath();b.fillStyle=a[d].color;b.fill();c.segmentShowStroke&&(b.lineWidth=
c.segmentStrokeWidth,b.strokeStyle=c.segmentStrokeColor,b.stroke());g+=l}},b)},J=function(a,c,b){for(var e=0,h=Math.min.apply(Math,[u/2,q/2])-5,f=h*(c.percentageInnerCutout/100),d=0;d<a.length;d++)e+=a[d].value;x(c,null,function(d){var k=-Math.PI/2,j=1,l=1;c.animation&&(c.animateScale&&(j=d),c.animateRotate&&(l=d));for(d=0;d<a.length;d++){var m=l*a[d].value/e*2*Math.PI;b.beginPath();b.arc(q/2,u/2,j*h,k,k+m,!1);b.arc(q/2,u/2,j*f,k+m,k,!0);b.closePath();b.fillStyle=a[d].color;b.fill();c.segmentShowStroke&&
(b.lineWidth=c.segmentStrokeWidth,b.strokeStyle=c.segmentStrokeColor,b.stroke());k+=m}},b)},K=function(a,c,b){var e,h,f,d,g,k,j,l,m,t,r,n,p,s=0;g=u;b.font=c.scaleFontStyle+" "+c.scaleFontSize+"px "+c.scaleFontFamily;t=1;for(d=0;d<a.labels.length;d++)e=b.measureText(a.labels[d]).width,t=e>t?e:t;q/a.labels.length<t?(s=45,q/a.labels.length<Math.cos(s)*t?(s=90,g-=t):g-=Math.sin(s)*t):g-=c.scaleFontSize;d=c.scaleFontSize;g=g-5-d;e=Number.MIN_VALUE;h=Number.MAX_VALUE;for(f=0;f<a.datasets.length;f++)for(l=
0;l<a.datasets[f].data.length;l++)a.datasets[f].data[l]>e&&(e=a.datasets[f].data[l]),a.datasets[f].data[l]<h&&(h=a.datasets[f].data[l]);f=Math.floor(g/(0.66*d));d=Math.floor(0.5*(g/d));l=c.scaleShowLabels?c.scaleLabel:"";c.scaleOverride?(j={steps:c.scaleSteps,stepValue:c.scaleStepWidth,graphMin:c.scaleStartValue,labels:[]},z(l,j.labels,j.steps,c.scaleStartValue,c.scaleStepWidth)):j=C(g,f,d,e,h,l);k=Math.floor(g/j.steps);d=1;if(c.scaleShowLabels){b.font=c.scaleFontStyle+" "+c.scaleFontSize+"px "+c.scaleFontFamily;
for(e=0;e<j.labels.length;e++)h=b.measureText(j.labels[e]).width,d=h>d?h:d;d+=10}r=q-d-t;m=Math.floor(r/(a.labels.length-1));n=q-t/2-r;p=g+c.scaleFontSize/2;x(c,function(){b.lineWidth=c.scaleLineWidth;b.strokeStyle=c.scaleLineColor;b.beginPath();b.moveTo(q-t/2+5,p);b.lineTo(q-t/2-r-5,p);b.stroke();0<s?(b.save(),b.textAlign="right"):b.textAlign="center";b.fillStyle=c.scaleFontColor;for(var d=0;d<a.labels.length;d++)b.save(),0<s?(b.translate(n+d*m,p+c.scaleFontSize),b.rotate(-(s*(Math.PI/180))),b.fillText(a.labels[d],
0,0),b.restore()):b.fillText(a.labels[d],n+d*m,p+c.scaleFontSize+3),b.beginPath(),b.moveTo(n+d*m,p+3),c.scaleShowGridLines&&0<d?(b.lineWidth=c.scaleGridLineWidth,b.strokeStyle=c.scaleGridLineColor,b.lineTo(n+d*m,5)):b.lineTo(n+d*m,p+3),b.stroke();b.lineWidth=c.scaleLineWidth;b.strokeStyle=c.scaleLineColor;b.beginPath();b.moveTo(n,p+5);b.lineTo(n,5);b.stroke();b.textAlign="right";b.textBaseline="middle";for(d=0;d<j.steps;d++)b.beginPath(),b.moveTo(n-3,p-(d+1)*k),c.scaleShowGridLines?(b.lineWidth=c.scaleGridLineWidth,
b.strokeStyle=c.scaleGridLineColor,b.lineTo(n+r+5,p-(d+1)*k)):b.lineTo(n-0.5,p-(d+1)*k),b.stroke(),c.scaleShowLabels&&b.fillText(j.labels[d],n-8,p-(d+1)*k)},function(d){function e(b,c){return p-d*v(a.datasets[b].data[c],j,k)}for(var f=0;f<a.datasets.length;f++){b.strokeStyle=a.datasets[f].strokeColor;b.lineWidth=c.datasetStrokeWidth;b.beginPath();b.moveTo(n,p-d*v(a.datasets[f].data[0],j,k));for(var g=1;g<a.datasets[f].data.length;g++)c.bezierCurve?b.bezierCurveTo(n+m*(g-0.5),e(f,g-1),n+m*(g-0.5),
e(f,g),n+m*g,e(f,g)):b.lineTo(n+m*g,e(f,g));b.stroke();c.datasetFill?(b.lineTo(n+m*(a.datasets[f].data.length-1),p),b.lineTo(n,p),b.closePath(),b.fillStyle=a.datasets[f].fillColor,b.fill()):b.closePath();if(c.pointDot){b.fillStyle=a.datasets[f].pointColor;b.strokeStyle=a.datasets[f].pointStrokeColor;b.lineWidth=c.pointDotStrokeWidth;for(g=0;g<a.datasets[f].data.length;g++)b.beginPath(),b.arc(n+m*g,p-d*v(a.datasets[f].data[g],j,k),c.pointDotRadius,0,2*Math.PI,!0),b.fill(),b.stroke()}}},b)},L=function(a,
c,b){var e,h,f,d,g,k,j,l,m,t,r,n,p,s,w=0;g=u;b.font=c.scaleFontStyle+" "+c.scaleFontSize+"px "+c.scaleFontFamily;t=1;for(d=0;d<a.labels.length;d++)e=b.measureText(a.labels[d]).width,t=e>t?e:t;q/a.labels.length<t?(w=45,q/a.labels.length<Math.cos(w)*t?(w=90,g-=t):g-=Math.sin(w)*t):g-=c.scaleFontSize;d=c.scaleFontSize;g=g-5-d;e=Number.MIN_VALUE;h=Number.MAX_VALUE;for(f=0;f<a.datasets.length;f++)for(l=0;l<a.datasets[f].data.length;l++)a.datasets[f].data[l]>e&&(e=a.datasets[f].data[l]),a.datasets[f].data[l]<
h&&(h=a.datasets[f].data[l]);f=Math.floor(g/(0.66*d));d=Math.floor(0.5*(g/d));l=c.scaleShowLabels?c.scaleLabel:"";c.scaleOverride?(j={steps:c.scaleSteps,stepValue:c.scaleStepWidth,graphMin:c.scaleStartValue,labels:[]},z(l,j.labels,j.steps,c.scaleStartValue,c.scaleStepWidth)):j=C(g,f,d,e,h,l);k=Math.floor(g/j.steps);d=1;if(c.scaleShowLabels){b.font=c.scaleFontStyle+" "+c.scaleFontSize+"px "+c.scaleFontFamily;for(e=0;e<j.labels.length;e++)h=b.measureText(j.labels[e]).width,d=h>d?h:d;d+=10}r=q-d-t;m=
Math.floor(r/a.labels.length);s=(m-2*c.scaleGridLineWidth-2*c.barValueSpacing-(c.barDatasetSpacing*a.datasets.length-1)-(c.barStrokeWidth/2*a.datasets.length-1))/a.datasets.length;n=q-t/2-r;p=g+c.scaleFontSize/2;x(c,function(){b.lineWidth=c.scaleLineWidth;b.strokeStyle=c.scaleLineColor;b.beginPath();b.moveTo(q-t/2+5,p);b.lineTo(q-t/2-r-5,p);b.stroke();0<w?(b.save(),b.textAlign="right"):b.textAlign="center";b.fillStyle=c.scaleFontColor;for(var d=0;d<a.labels.length;d++)b.save(),0<w?(b.translate(n+
d*m,p+c.scaleFontSize),b.rotate(-(w*(Math.PI/180))),b.fillText(a.labels[d],0,0),b.restore()):b.fillText(a.labels[d],n+d*m+m/2,p+c.scaleFontSize+3),b.beginPath(),b.moveTo(n+(d+1)*m,p+3),b.lineWidth=c.scaleGridLineWidth,b.strokeStyle=c.scaleGridLineColor,b.lineTo(n+(d+1)*m,5),b.stroke();b.lineWidth=c.scaleLineWidth;b.strokeStyle=c.scaleLineColor;b.beginPath();b.moveTo(n,p+5);b.lineTo(n,5);b.stroke();b.textAlign="right";b.textBaseline="middle";for(d=0;d<j.steps;d++)b.beginPath(),b.moveTo(n-3,p-(d+1)*
k),c.scaleShowGridLines?(b.lineWidth=c.scaleGridLineWidth,b.strokeStyle=c.scaleGridLineColor,b.lineTo(n+r+5,p-(d+1)*k)):b.lineTo(n-0.5,p-(d+1)*k),b.stroke(),c.scaleShowLabels&&b.fillText(j.labels[d],n-8,p-(d+1)*k)},function(d){b.lineWidth=c.barStrokeWidth;for(var e=0;e<a.datasets.length;e++){b.fillStyle=a.datasets[e].fillColor;b.strokeStyle=a.datasets[e].strokeColor;for(var f=0;f<a.datasets[e].data.length;f++){var g=n+c.barValueSpacing+m*f+s*e+c.barDatasetSpacing*e+c.barStrokeWidth*e;b.beginPath();
b.moveTo(g,p);b.lineTo(g,p-d*v(a.datasets[e].data[f],j,k)+c.barStrokeWidth/2);b.lineTo(g+s,p-d*v(a.datasets[e].data[f],j,k)+c.barStrokeWidth/2);b.lineTo(g+s,p);c.barShowStroke&&b.stroke();b.closePath();b.fill()}}},b)},D=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1E3/60)},F={}};;/*
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

var x2js = new X2JS();;
/** 
 * 
 *	This class represents an application model and holds configuration detail of application.
 *  Use to scaffold the application 
 **/

appez.smartweb.model.Application = appez.smartweb.createClass({
	appName : "",
	appVersion : "",
	application : {},
	model : {},
	view : {},
	controller : {},
	service : {},
	config : {},
	constant : null,
	appController : null
	
});;/** 
 * 
 *	This class represents a generic application manager.
 *	Responsible for reading and parsing screens from Screen Templates.
 * 
 **/


appez.smartweb.manager.ApplicationManager = appez.smartweb.createClass({
	className : "appez.smartweb.manager.ApplicationManager",
	extend : appez.smartweb.swcore.BaseManager,
	singleton: true,
    application: {},
	
    init : function() {

	},
	
   initApplication:function(appConfig){
       this.application = new appez.smartweb.model.Application();
       this.application.appName = appConfig.appName;
       this.application.appVersion = appConfig.appVersion;
       this.application.config = appConfig.config;
       
       return this.application;
   },
                                                   
   initScreenTemplates:function(){
	   var smartEvent = null;
	   //var screenTemplatesFilePath = '../js/view/ScreenTemplates.xml';
	   var indexPageLocation = document.location.href;
	   var screenTemplatesFilePath = 'app/smartphone/js/view/ScreenTemplates.xml';
	   if(indexPageLocation.indexOf("indexTab.html")>-1){
		   screenTemplatesFilePath = 'app/tablet/js/view/ScreenTemplates.xml';
	   }
	   var fileReadReq = {
			   'requestUrl' : screenTemplatesFilePath
	   };
	   if (appez.isWindowsPhone()) {
	   	appez.smartweb.util.Ajax.performAjaxOperation(this.afterScreenTemplatesRead,this.afterErrorScreenTemplatesRead, this,fileReadReq,true);
	   }
	   else{
	   	appez.smartweb.util.Ajax.performAjaxOperation(this.afterScreenTemplatesRead,this.afterErrorScreenTemplatesRead, this,fileReadReq,false);	   	
	   }
   },
                                                   
   afterScreenTemplatesRead: function(response,textStatus,jqXHR) {
       var xmlToJson = new X2JS();
       var jsonObj;
       if (appez.isWindowsPhone()) {
           // For WP change string to xmlDoc
           var xmlDoc = xmlToJson.parseXmlString(response);
           jsonObj = xmlToJson.xml2json(xmlDoc);
       } else {
           var jsonObj = xmlToJson.xml2json(response);
       }
	   var screenTemplateData = JSON.stringify(jsonObj);
	   var templatesData="";
	   
	 templatesData = appez.smartweb.util.ScreenTemplatesParser.parseJson(jsonObj);
	
     
       for(var screenKey in templatesData) {
    	   appez.smartweb.getApplication().view[screenKey] = templatesData[screenKey];
       }  
   },
  
   afterErrorScreenTemplatesRead : function(jqXHR,textStatus,error){
	   console.log('Error reading ScreenTemplates file');
	   //TODO add better handling for this scenario whwrein the ScreenTemplates.xml file could not be read properly
   }
});;/** 
 * 
 *	This manager is responsible for management of controller stack
 * 
 **/


appez.smartweb.manager.StackManager = appez.smartweb.createClass({
	className : "appez.smartweb.manager.StackManager",
	extend : appez.smartweb.swcore.BaseManager,
	singleton: true,
    application: {},
    
    controllerStack : null,
    controllerMap : null,
    currentControllerCount : 0,
    currentPage : null,
    
    //this flag indicates whether or not the last operation was a Back key press
    isBackPressedInPreviousOp : false,
	
    init : function() {
    	this.controllerStack = {};
    	this.controllerMap = [];
    	this.currentControllerCount = 0;
	},
	
	navigateTo : function(pageId, controllerObj){
		
		this.currentPage = pageId;
		// Check if page id already exist in controller stack.
		if( this.controllerStack[pageId] ){
			// Search for page id in controllermap to find current controller count.
			for(var i =0; i< this.controllerMap.length; i++){
				if(this.controllerMap[i]===pageId){
						// since map is starting from 0 current controller count will be incremented by 1.
						this.currentControllerCount = i+1;
						break;
					}
			}
			// since controllerStack is a json object. it doesn't have slice method.
			// Clear values of controllerStack greater than currentControllerCount.
			for(var i= this.currentControllerCount; i<this.controllerMap.length; i++){
					
					delete this.controllerStack[this.controllerMap[i]];
			}
			// slice controllerMap upto currentControllerCount.
			this.controllerMap = this.controllerMap.slice(0,this.currentControllerCount);
			this.controllerStack[pageId] = controllerObj;
			
		}
		else{
			// If pageid is new then insert page id and controller object to controllerMap and controllerStack.
			this.controllerStack[pageId] = controllerObj;
			this.controllerMap[this.currentControllerCount]=pageId;
			this.currentControllerCount = this.currentControllerCount + 1;
			
		}
		
		appez.smartweb.setCurrentController(this.controllerStack[pageId]);
		
	},
	
	navigateBack : function(previousPageId){
	    
	   
		// Check if previuosPageId exist and currentControllerCount is greater than 0.
		if(previousPageId!=undefined && this.currentControllerCount>0){
			
			//If the Id of the previous page has been provided, then we need to set the current controller directly to that value
			
			var navigationInfo = {
				"from" : appez.smartweb.getCurrentController().className,
				"to" : this.controllerStack[previousPageId].className,
			};
			
			// Check controller stack has previousPageId. If it has, then set currentControllerCount to previous stack postion.
			// and clear the value of controllerMap and controllerStack.
			//if(this.controllerMap[this.currentControllerCount]!=previousPageId) {
			if(this.controllerStack[previousPageId]) {
				
				/*
				//This means that the user has specified to navigate to a page which is different from the one encountered during forward navigation
				delete this.controllerStack[this.currentPage];
				for(var controllerCurrentIndex=0;controllerCurrentIndex<this.currentControllerCount;controllerCurrentIndex++){
					if(this.controllerMap[controllerCurrentIndex]===previousPageId){
						this.currentControllerCount = controllerCurrentIndex;
						break;
					}
				}
				this.controllerMap[this.currentControllerCount]=previousPageId;
				*/
				// Search for page id in controllermap to find current controller count.
				for(var i=0;i<this.controllerMap.length;i++){
					if(this.controllerMap[i]===previousPageId){
						this.currentControllerCount = i+1;
						break;
					}
				}
				// since controllerStack is a json object. it doesn't have slice method.
				// Clear values of controllerStack greater than currentControllerCount.
				for(var i= this.currentControllerCount; i<this.controllerMap.length; i++){
					
					delete this.controllerStack[this.controllerMap[i]];
				}
				// slice controllerMap upto currentControllerCount.
				this.controllerMap = this.controllerMap.slice(0, this.currentControllerCount);
				
				appez.smartweb.setCurrentController(this.controllerStack[previousPageId]);
				
			} else {
			
				this.currentControllerCount = this.currentControllerCount-1;
				//This means the user is navigating back in the same manner as forward navigation
				delete this.controllerStack[this.currentPage];
				delete this.controllerMap[this.currentControllerCount];
				// Since map start from 0. thus need to decrease currentControllerCount by 1.
				appez.smartweb.setCurrentController(this.controllerStack[this.controllerMap[this.currentControllerCount-1]]);
				
			}
			// set currentPage to last value of controllerMap.
			this.currentPage = this.controllerMap[this.currentControllerCount-1];
			
		} else {
		
			//Means that the previous page is not mentioned by the user
			//In this case, get the controller in the previous position on the stack
			if(this.currentControllerCount>0){
				delete this.controllerStack[this.currentPage];
				this.controllerStack[this.controllerMap[this.currentControllerCount]] = null;
				this.controllerMap[this.currentControllerCount] = null;
				this.currentControllerCount = this.currentControllerCount-1;
				this.currentPage = this.controllerMap[this.currentControllerCount];
				appez.smartweb.setCurrentController(this.controllerStack[this.currentPage]);
			} else {
				this.currentPage = this.controllerMap[0];
				appez.smartweb.setCurrentController(this.controllerStack[this.currentPage]);
			}
		}
		// If user has navigated back function then invoke function.
		if(appez.smartweb.getCurrentController().navigatedBack != undefined){
			
			appez.smartweb.getCurrentController().navigatedBack.call(appez.smartweb.getCurrentController(),navigationInfo);
		}
		
		
	},
	removePageHistory : function(){
	
		delete this.controllerMap[this.currentControllerCount-1];
		delete this.controllerStack[this.currentPage];
		
		this.currentControllerCount = this.currentControllerCount-1;
		
	}
});;/** 
 * 
 *	Utility class for parsing screen templates (XML comments) into JSON object.
 *
 * NOTE : Some of the functionality in this class is 
 * 
 **/

appez.smartweb.util.ScreenTemplatesParser = appez.smartweb.createClass({
	className:"appez.smartweb.util.ScreenTemplatesParser",
    singleton:true,
    
    screenTemplateFile : null,
    
    setScreenTemplatesFileLoc : function(fileLocation) {
    	this.screenTemplateFile = fileLocation;
    },
    
    /*
    * Name: parseJson
    * Description: reads the screen definition fragments from XML and converts them to JSON
    * @Params: 
    *         screenJson: XML fragment to parse    
    * Returns: Parsed JSON object
    * 
    */
	
	parseJson: function(screenJson) {
		var screensJson = {};
		if(screenJson['screens']['screen'] instanceof Array){
			for(var screenJsonIterator =0;screenJsonIterator<screenJson.screens.screen.length;screenJsonIterator++) {
				var screen = screenJson.screens.screen[screenJsonIterator];
				screen.name = $.trim(screen.name);
				if(screen.content["__cdata"]!=undefined){
					screensJson[screen.name] = screen.content["__cdata"];
				}
				else {
					screensJson[screen.name] = screen.content;
				}
			}
		} else {
			//That means only 1 screen exists in the application
			var screen = screenJson.screens.screen;
			screen.name = $.trim(screen.name);
			if(screen.content["__cdata"]!=undefined){
				screensJson[screen.name] = screen.content["__cdata"];
			}
			else {
				screensJson[screen.name] = screen.content;
			}
		}
                                                  
		return screensJson;
	},
    
    /*
     * Name: parseWPJson
     * Description: reads the screen definition fragments from XML and converts them to JSON for WP
     * @Params: 
     *         screenJson: XML fragment to parse    
     * Returns: Parsed JSON object
     * 
     */	
	parseWPJson: function(screenJson) {
		var screensJson = {};
		for(var screenJsonIterator =0;screenJsonIterator<screenJson.screens.screen.length;screenJsonIterator++) {
			var screen = screenJson.screens.screen[screenJsonIterator];
			var screenName=$.trim(screen.name);
			screensJson[screenName] = screen.content.text;
		}
                                            
		return screensJson;
	},
    
    /*
     * Name: parse
     * Description: recursively parses XML document into JSON object
     * @Params: 
     *         xmlDocument: XML to parse    
     * Returns: Parsed screen JSON object
     * 
     */		
	parse: function(xmlDocument) {
		var screenJSON = {};
		screenJSON.SMARTPHONES_ANDROID = {};
		screenJSON.SMARTPHONES_IOS = {};
		var screenName = "";
		if(xmlDocument.childNodes.length > 0) {
			for(var nodeIteration =0;nodeIteration<xmlDocument.childNodes.length;nodeIteration++){
				var screensNode = xmlDocument.childNodes[nodeIteration];
				if(screensNode.nodeType == 1 && screensNode.nodeName == "screens") {
					for(var nodeIterationScreens =0;nodeIterationScreens<screensNode.childNodes.length;nodeIterationScreens++){
						var screenNode = screensNode.childNodes[nodeIterationScreens];
						if(screenNode.nodeType == 1 && screenNode.nodeName == "screen") {
							screenName = "";
							for(var nodeItearionsScreen=0;nodeItearionsScreen<screenNode.childNodes.length;nodeItearionsScreen++) {
								var node = screenNode.childNodes[nodeItearionsScreen];
								if(node.nodeType == 1) {
									if(node.nodeName == "name") {
										screenName = node.childNodes[0].nodeValue;	
									}
									else if(node.nodeName == "platforms") {
										screenPlatform = "";
										for(var nodeIterationsPlatforms=0;nodeIterationsPlatforms<node.childNodes.length;nodeIterationsPlatforms++) {
											var platformNode = node.childNodes[nodeIterationsPlatforms];
											if(platformNode.nodeType == 1 && platformNode.nodeName == "platform") {
												var screenPlatform = platformNode.attributes[0].value;
												for(var nodeIterationsPlatform=0;nodeIterationsPlatform<platformNode.childNodes.length;nodeIterationsPlatform++) {
													var platformChildNode = platformNode.childNodes[nodeIterationsPlatform];
													if(platformChildNode.nodeType == 1 && platformChildNode.nodeName == "content") {
														for(var nodeIterationsContent=0;nodeIterationsContent<platformChildNode.childNodes.length;nodeIterationsContent++) {
															var contentNode = platformChildNode.childNodes[nodeIterationsContent];
															if(contentNode.nodeType == 4) {
																screenJSON[screenPlatform][screenName] = contentNode.nodeValue;
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		return screenJSON;
	}		
});;/** 
 * 
 *	Utility class for generating data models from primitive types such as array and object.
 * 
 **/

appez.smartweb.util.ModelGenerator = appez.smartweb.createClass({
	className:"appez.smartweb.util.ModelGenerator",
    singleton:true,      
    
    //The 'modelClass' refers to the reference of the model in the client application
    getModel : function(jsonObject, rootTag, modelClass){
    	var rootNodeDepth = 0;
    	var rootTagDepthElements = null;
    	var modelClassRef = modelClass;
    	//Generic logic for parsing the JSON object received from the server and creating the model from it
    	var modelObject = jsonObject;
    	
    	if((rootTag!=undefined)&&(rootTag.length>0)){
    		this.rootTagDepthElements = rootTag.split('.');
    		this.rootNodeDepth = this.rootTagDepthElements.length;
        	for(var iter=0;iter<this.rootNodeDepth;iter++) {
        		if(modelObject == undefined) {
        			break;
        		}
        		modelObject = modelObject[this.rootTagDepthElements[iter]];
        	}
    	}
    	
    	if(modelObject == undefined) {
    		return null;
    	}
    	
    	//Check if the 'modelObject' is an 'Array'/'Object'
    	if(modelObject instanceof Array){
//    		eMob.log("modelObject instanceof Array->Total array elements:"+modelObject.length);
    		var totalModelObjects = modelObject.length;
    		var preparedModels = [];
    		for(var currentObj=0;currentObj<totalModelObjects;currentObj++){
    			preparedModels[currentObj] = this.populateModel(modelObject[currentObj],modelClassRef);
    			preparedModels[currentObj].init(modelObject[currentObj]);
    		}
    		//TODO need to check when the 'init()' of individual models will be called
    		
    		return preparedModels;
    	} else if(modelObject instanceof Object){
//    		eMob.log("modelObject instanceof Object");
    		var preparedModel = this.populateModel(modelObject,modelClassRef);
    		preparedModel.init(modelObject);
    		return preparedModel;
    	}
    },

    //Logic for filling the data in the model comes here
    populateModel : function(jsonObject,modelClassRef){
    	var modelObj = new modelClassRef();
    	for(var objElements in jsonObject){
    		if(modelObj.mapping[objElements]!=undefined){
    			//Need to call the setter for setting the value for this parameter
    			var paramName = modelObj.mapping[objElements];
    			
    			//The setter function should be of the form 'set<Parameter-Name>' where the '<Parameter-Name>' should be a class variable of the model starting with an upper case
    			var setterFunctionName = "set" + paramName.charAt(0).toUpperCase() + paramName.slice(1);
    			if(modelObj[setterFunctionName]!=undefined){
    				var setterFunction = modelObj[setterFunctionName];
    				setterFunction.call(modelObj,jsonObject[objElements]);
    			}
    		}
    	}
    	return modelObj;
    }
});;/**
 * Works as a adapter and wraps the calls between the appez Web library and the chart.js library
 */
appez.smartweb.util.graph.GraphAdapter= appez.smartweb.createClass({
	className : "appez.smartweb.util.graph.GraphAdapter",
	singleton : true,

	/**
	 * Initialize the graph with the necessary parameters
	 * Init paramters should contain the following properties
	 * 'graphType','targetDiv','chartData'
	 * */
	drawGraph : function(reqParams) {
		if(reqParams && (reqParams instanceof Object)){
			var graphType = reqParams[appez.smartweb.constant.CHART_REQ_PARAM_GRAPH_TYPE];
			var targetDiv = reqParams[appez.smartweb.constant.CHART_REQ_PARAM_TARGET_DIV];
			var chartData = reqParams[appez.smartweb.constant.CHART_REQ_PARAM_DATA];
			var chartObj = null;
			switch(graphType){
			case appez.smartweb.constant.CHART_TYPE_BAR:
				chartObj = new Chart(document.getElementById(targetDiv).getContext("2d")).Bar(chartData,{'animation':false});
				break;
				
			case appez.smartweb.constant.CHART_TYPE_PIE:
				chartObj = new Chart(document.getElementById(targetDiv).getContext("2d")).Pie(chartData,{'animation':false});
				break;
				
			case appez.smartweb.constant.CHART_TYPE_LINE:
				chartObj = new Chart(document.getElementById(targetDiv).getContext("2d")).Line(chartData,{'animation':false});
				break;
				
			case appez.smartweb.constant.CHART_TYPE_DOUGHNUT:
				chartObj = new Chart(document.getElementById(targetDiv).getContext("2d")).Doughnut(chartData,{'animation':false});
				break;	
				
			default:
				//Throw an error here as this means that it is an unsupported graph type
				break;	
			}
			
		} else {
			//throw an error that the user has not specified the init parameters
		}
	}
});;/** 
 * 
 *	Utility class for performing Ajax class.
 * 
 **/

appez.smartweb.util.Ajax= appez.smartweb.createClass({
	className : "appez.smartweb.util.Ajax",
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
	performAjaxOperation : function(callbackFunc,callbackErrorFunc, callbackFuncScope, requestObj,shouldRunLocal){
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
		var jqxhr;
		if(shouldRunLocal){
			jqxhr = $.ajax({
			type: requestType,
			url: requestUrl,
                	isLocal: true,
			data: requestBody,
			contentType : reqContentType,
			beforeSend: function (request)
		            {
						if(headerKeyValue!=null){
							for(var key in headerKeyValue){
								console.log('AJAX.js->performAjaxOperation-> header key:'+key+",header value:"+headerKeyValue[key]);
				                request.setRequestHeader(key, headerKeyValue[key]);
							}
						}
		            },
			async:false
		});
		} else {
		jqxhr = $.ajax({
			type: requestType,
			url: requestUrl,
			data: requestBody,
			contentType : reqContentType,
			beforeSend: function (request)
		            {
						if(headerKeyValue!=null){
							for(var key in headerKeyValue){
								console.log('AJAX.js->performAjaxOperation-> header key:'+key+",header value:"+headerKeyValue[key]);
				                request.setRequestHeader(key, headerKeyValue[key]);
							}
						}
		            },
			async:false
		});
	}
	jqxhr.done(function(response, textStatus, jqXHR) {
			//console.log("AJAX success->Response:"+response+",Text status:"+textStatus);
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

});