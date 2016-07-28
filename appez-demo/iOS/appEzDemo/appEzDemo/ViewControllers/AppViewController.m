//
//  AppViewController.m
//  Trendz
//
//  Created by impetus on 6/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "AppViewController.h"
#import "AppEvents.h"
#import "AppConstants.h"

@implementation AppViewController

- (id)initWithPageURI:(NSString*)uri {
    self = [super initWithExtendedSplashAndPageURI:uri] ;
    if (self)
    {
    }
    return self;
}
- (void)viewDidLoad
{
    [super viewDidLoad];
    [super registerAppDelegate:self];
    self.configInfo=[AppUtils getJsonFromDictionary:[AppUtils getAppConfigFileProps:@"assets/www/app/appez.conf"]];
	[self.splashImageView setUserInteractionEnabled:YES];
	}

-(void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    self.navigationController.navigationBar.barStyle=1;
    [AppUtils showDebugLog:[NSString stringWithFormat:@"in appview controller status bar is %d",self.navigationController.navigationBar.barStyle]];
    self.navigationController.navigationBar.hidden=TRUE;
	

}
- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)didReceiveMemoryWarning
{
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];
    
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark - View lifecycle

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

/** Specifies action to be taken when a notification is received from the JavaScript. 
 * Uses event data and notification received from JavaScript to determine action
 * 
 * @param eventData : Event data that determines specific action for any notification received from JavaScript
 * @param notification : Notification from JavaScript
 */
-(void)didReceiveSmartNotification:(NSString*)eventData WithNotification:(NSString*) notification
{
    [AppUtils showDebugLog:[NSString stringWithFormat:@"notification and event data %@ and %@",notification,eventData]];
    switch ([notification intValue])
    {
            //Set menu option for current screen
        case APP_NOTIFY_MENU_ACTION:
            self.menuInformation=eventData;
            [AppUtils showDebugLog:[NSString stringWithFormat:@"menu info initialy is %@",self.menuInformation]];
            //[super showOptionMenu:self.menuInformation];
            break;
        case APP_NOTIFY_CREATE_MENU:
             //self.menuInformation=eventData;
            [AppUtils showDebugLog:[NSString stringWithFormat:@"menu info %@",self.menuInformation]]
            ;
            [super showOptionMenu:self.menuInformation];
            break;
        case APP_NOTIFY_OPEN_BROWSER:
            [self openBrowser:eventData];
            break;
			
		
			
		case APP_CONTROL_TRANSFER:
			[self processAppEvent:eventData];
	
    }
}

-(void)openBrowser:(NSString*)url
{
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:url]];
}

-(void)didReceiveDataNotification:(NSString*)notification  WithFileUrl:(NSString*)fromFile
{
    switch ([notification intValue])
    {
        case 0:
        {
            //Place your code here
        }
            break;
    }
}
-(void)didReceiveDataNotification:(NSString*)notification WithData:(NSData*)responseData
{
    switch ([notification intValue])
    {
        case 0:
        {
            //Place your code here
        }
            break;
    }
}


- (void)processAppEvent:(NSString *)eventData
{
    NSLog(@"AppViewActivity->processAppEvent->eventData : %@",eventData);
    NSDictionary *appConfiguration=[AppUtils getDictionaryFromJson:eventData];
    NSString *eventType;
    NSString *data;
    if ([appConfiguration.allKeys containsObject:EVENT_TYPE])
    {
        eventType=[appConfiguration objectForKey:EVENT_TYPE];
    }
    else
    {
    eventType=@"";
    }
    if ([appConfiguration.allKeys containsObject:EVENT_DATA])
    {
        data=[appConfiguration objectForKey:EVENT_DATA];
    }
    else
    {
        data=@"";
    }
    switch ([eventType intValue]) {

			
        case APP_EVENT_SHARE_APP:{
			
            if(data!=nil && data.length>0){
                NSDictionary *sharingDetails=[AppUtils getDictionaryFromJson:data];
				
				NSURL *descriptionURL=[NSURL URLWithString:[sharingDetails objectForKey:kDescriptionURL]];
				
				//add brackets
				//NSURL *url = [[NSURL alloc] initWithString:@""];
			
                NSString *description=[sharingDetails objectForKey:kDescription];
                NSURL * imageURL=[NSURL URLWithString:[sharingDetails objectForKey:kImageURL]];
                
				
                
				
				
                    NSMutableArray *dataToShare=[NSMutableArray new];
                    if(imageURL!=nil){
                        [dataToShare addObject:imageURL];
                    }
					if(description!=nil){
                        [dataToShare addObject:description];
                    }
                    if(descriptionURL!=nil){
                        [dataToShare addObject:descriptionURL];
                    }
					
                    [self shareDataOnSN:dataToShare];
					
            }//outer if
            
       }//case APP_EVENT_SHARE
            break;
//        case APP_EVENT_SHARE_NEWS:{
//            
//            BOOL isImageURL=NO;
//            if(data!=nil && data.length>0){
//                NSDictionary *sharingDetails=[AppUtils getDictionaryFromJson:data];
//                NSString *description=[sharingDetails objectForKey:kNewsDescription];
//                NSURL * imageURL=[NSURL URLWithString:[sharingDetails objectForKey:kNewsImageURL]];
//                
//                isImageURL=[self isImageURL:imageURL];
//                
//                if (isImageURL) {//if imageurl ,download the image
//                    loadingController=[[LoadingController alloc] initWithText:@"Getting details..."];
//                    [self shareImage:imageURL descriptionURL:nil description:description];
//                    loadingController.modalPresentationStyle = UIModalPresentationOverCurrentContext;
//                    [self presentViewController:loadingController animated:NO completion:nil];
//                }
//                else{//share all data
//                    NSMutableArray *dataToShare=[NSMutableArray new];
//                    if(imageURL!=nil){
//                        [dataToShare addObject:imageURL];
//                    }
//                    
//                    if(description!=nil){
//                        [dataToShare addObject:description];
//                    }
//                    [self shareDataOnSN:dataToShare];
//                }
//            }//outer if
//
//        }//case school new share end
//            break;
    }//swith ends
   
}
 - (void)shareDataOnSN:(NSArray *)dataToShare{
    //fetch url or image from data
    if (dataToShare!=nil) {
        UIActivityViewController *activityController=[[UIActivityViewController alloc] initWithActivityItems:dataToShare applicationActivities:nil];
        [self presentViewController:activityController animated:YES completion:nil];
    }
}

//For push Notification




@end
