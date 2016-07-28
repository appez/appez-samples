package io.appez.samples.android.demo;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;

import org.json.JSONException;
import org.json.JSONObject;

import io.appez.activities.SmartViewActivity;
import io.appez.constants.AppEvents;
import io.appez.listeners.DialogListener;
import io.appez.listeners.SmartAppListener;
import io.appez.modal.SessionData;
import io.appez.utility.AppUtility;
import io.appez.utility.UIUtility;


public class AppViewActivity extends SmartViewActivity implements SmartAppListener{
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		AppUtility.initUtils(getApplicationContext());
		super.registerAppListener(this);
		webViewDefaultImg.setBackgroundResource(R.drawable.background);
	}

    @Override
    public void onResume() {
        super.onResume();
    }

    @Override
    public void onPause() {
       super.onPause();
    }

	@Override
	public void onReceiveSmartNotification(String eventData, String notification) {
		//Log.d(AppConstants.APP_NAME, "AppViewActivity->onReceiveSmartNotification->eventData:" + eventData + ",notification:" + notification);
		switch (Integer.parseInt(notification)) {
		case AppEvents.APP_NOTIFY_EXIT:
			finish();
			overridePendingTransition(0, 0);
			break;

		case AppEvents.APP_NOTIFY_MENU_ACTION:
			screenInformation = eventData;
			super.processScreenInformation();
			break;

		case AppEvents.APP_CONTROL_TRANSFER:
			processAppEvent(eventData);
			break;
		}
	}

	private void processAppEvent(String eventData){
			try{
				Log.i(AppConstants.APP_NAME, "AppViewActivity->processAppEvent->eventData : " + eventData);
				JSONObject appConfigInformation = new JSONObject(eventData);
				String eventType, data,title;
				if (appConfigInformation.has(AppConstants.EVENT_TYPE)) {
					eventType = appConfigInformation
							.getString(AppConstants.EVENT_TYPE);
				} else {
					eventType = "";
				}

				if (appConfigInformation.has(AppConstants.TITLE)) {
					title = appConfigInformation.getString(AppConstants.TITLE);
				} else {
					title = "";
				}

				if (appConfigInformation.has(AppConstants.EVENT_DATA)) {
					data = appConfigInformation.getString(AppConstants.EVENT_DATA);
				} else {
					data = "";
				}
				Log.i(AppConstants.APP_NAME,"EVENTTYPE"+ eventType  +"EVENTDATA"+ eventData);
				switch (Integer.parseInt(eventType)) {
                    case AppConstants.APP_EVENT_SHARE_APP:
						Log.i(AppConstants.APP_NAME,"DATA"+ data);
						JSONObject shareinfo = new JSONObject(data);
						String description = shareinfo.getString("newsDesc");
						Log.i(AppConstants.APP_NAME,"DESCRIPTION"+ description);
						new UIUtility(this,null).createDialog(DialogListener.DIALOG_LOADING, "Preparing for sharing");
						shareDataOnSN(description);//if imageURL!=image,share description url and description only
						break;
				}
			}catch(JSONException e){

			}
	}

	public void shareDataOnSN(String description){
		String dataToShare=description;
		Intent shareIntent = new Intent();
		shareIntent.setType("text/plain");
		shareIntent.setAction(Intent.ACTION_SEND);
		shareIntent.putExtra(Intent.EXTRA_TEXT, dataToShare);
		shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
		startActivity(Intent.createChooser(shareIntent, "Share data..."));
		SessionData.getInstance().getProgressDialog().dismiss();
	}

	@Override
	public void onReceiveDataNotification(String notification, String fromFile) {

	}

	@Override
	public void onReceiveDataNotification(String notification, byte[] responseData) {

	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		return super.onCreateOptionsMenu(menu);
	}

	@Override
	public boolean onPrepareOptionsMenu(Menu menu) {
		return super.onPrepareOptionsMenu(menu);
	}

}