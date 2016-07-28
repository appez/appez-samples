//
//  AppConstants.m
//  Vidyatree
//
//  Created by Manoj Pratap on 25/09/15.
//
//

#import "AppConstants.h"

//Constants
NSString *const PERSIST_KEY_FROM_NOTIFICATION = @"version";
NSString *const ALERT_DATA_CHANGED_NOTIFICATION=@"alertDataChanged";
NSString *const STORE_NAME=@"Vidyatree";
NSString *const isAppNotLaunchFirstTime=@"isAppNotLaunchFirstTime";

//Fetch-interval
int const FETCH_INTERVAL_TIME=60*30;//30 mins

//userinfo keys for local notification
NSString *const kStudentAlert=@"alerts" ;
NSString *const kDOW=@"birthdayDate";//date of wish
NSString *const KDOM=@"birthdayMessage";//message for B'day

//Happy B'day message
NSString *const happyBdayMessage=@"Happy Birthday Dear %@ .";

//Query for background fetch
NSString *const queryBackGroundFetch=@"https://docs.google.com/spreadsheets/d/1BLhE4iZs18RDKQZVMrFHi6wUu-6K9LsMl8trobft9Gw/gviz/tq?tq=SELECT+*+WHERE++%%28B+%%3D+date%%27%@%%27%%29++and+%%28%%28D+%%3D+%%27Class%%27+and+E+contains+%%276+%@%%27%%29+or+%%28D+%%3D+%%27Bus%%27+and+G+contains+%%27%d%%27%%29+or+%%28D+%%3D+%%27Student%%27+and+F+contains+%%27%@%%27%%29+or+%%28D+%%3D+%%27School%%27%%29+%%29";

//wish data to be saved in preference
NSString *const kFatherName=@"fathername";
NSString *const kFatherDOB=@"fatherdob";
NSString *const kMotherName=@"mothername";
NSString *const kMotherDOB=@"motherdob";
NSString *const kStudentName=@"studentname";
NSString *const kStudentDOB=@"studentdob";

//keys for student data
NSString *const kStudentId=@"studentid";
NSString *const kStandard=@"standard";
NSString *const kSection=@"section";
NSString *const kRouteNo=@"routeno";

//Keys for sharing data
NSString *const kImageURL=@"newsBgUrl";
NSString *const kDescriptionURL=@"shareImg";
NSString *const kDescription=@"newsDesc";

//Keys for sharing news
NSString *const kNewsImageURL=@"shareId";
NSString *const kNewsDescription=@"shareTitle";
