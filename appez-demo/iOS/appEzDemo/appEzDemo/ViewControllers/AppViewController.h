//
//  AppViewController.h
//  Trendz
//
//  Created by impetus on 6/5/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "SmartConstants.h"
#import "CommMessageConstants.h"
#import "SmartNetworkDelegate.h"
#import "NetworkService.h"
#import "SmartViewController.h"

@interface AppViewController : SmartViewController <SmartAppDelegate,SmartNetworkDelegate>
{
    NetworkService *service;
}
- (id)initWithPageURI:(NSString*)uri;

@end
