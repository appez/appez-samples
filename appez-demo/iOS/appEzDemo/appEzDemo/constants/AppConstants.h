//
//  AppConstants.h
//  iMobilizer
//
//  Created by impetus on 2/27/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//
#import  "AppDelegate.h"

#define  appDelegate            ((AppDelegate*)[[UIApplication sharedApplication] delegate])
#define  APP_VERSION            @"v1.0"
#define  APP_NAME               @"VidyatreeMWC"
#define  EVENT_TYPE             @"eventType"
#define  EVENT_DATA             @"eventData"
#define  TITLE                  @"title"
#define  APP_EVENT_OPEN_WEBVIEW 1
#define  APP_EVENT_WISHES       2

#define  APP_EVENT_SHARE_APP    3
#define  APP_EVENT_SHARE_NEWS   5


//Constants
extern NSString *const PERSIST_KEY_FROM_NOTIFICATION;
extern NSString *const ALERT_DATA_CHANGED_NOTIFICATION;
extern NSString *const STORE_NAME ;
extern NSString *const isAppNotLaunchFirstTime;
extern int const FETCH_INTERVAL_TIME;

//userinfo keys for local notification
extern NSString *const kStudentAlert ;
extern NSString *const kDOW;

//Query for background fetch
extern NSString *const queryBackGroundFetch;

//Happy B'day message
extern NSString *const happyBdayMessage;

//wish data to be saved in preference
extern NSString *const kFatherName;
extern NSString *const kFatherDOB;
extern NSString *const kMotherName;
extern NSString *const kMotherDOB;
extern NSString *const kStudentName;
extern NSString *const kStudentDOB;

//keys for student data
extern NSString *const kStudentId;
extern NSString *const kStandard;
extern NSString *const kSection;
extern NSString *const kRouteNo;

//key foe sharing data
extern NSString *const kImageURL;
extern NSString *const kDescriptionURL;
extern NSString *const kDescription;

//Keys for sharing news
extern NSString *const kNewsImageURL;
extern NSString *const kNewsDescription;


