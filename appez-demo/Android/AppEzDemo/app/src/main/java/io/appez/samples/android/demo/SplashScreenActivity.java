package io.appez.samples.android.demo;

import org.json.JSONObject;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.view.Window;
import android.widget.Toast;

import io.appez.constants.SmartConstants;
import io.appez.utility.AppUtility;

public class SplashScreenActivity extends Activity {
	private String appConfigInformation = null;

	@SuppressLint({ "ShowToast", "HandlerLeak" })
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		setContentView(R.layout.splash_screen);

		Toast welcomeToast = Toast.makeText(this, AppConstants.APP_VERSION, Toast.LENGTH_SHORT);
		//welcomeToast.show();

		// Read the contents of the 'appit.conf' file and hold them in form of
		// JSON object key-value pair
		String configFileLocation = "www/app/appez.conf";
		JSONObject configParams = AppUtility.getAppConfigFileProps(this, configFileLocation);
		if (configParams != null) {
			// Means the configuration file exists at the expected location
			appConfigInformation = configParams.toString();
		}

		Handler splashHandler = new Handler() {
			@Override
			public void handleMessage(Message msg) {
				Intent intent = new Intent(getApplicationContext(), AppViewActivity.class);
				intent.putExtra(SmartConstants.CHECK_FOR_INTENT_EXTRA, true);
				intent.putExtra(SmartConstants.CHECK_FOR_BACKGROUND, true);
				intent.putExtra(SmartConstants.PAGE_URI, getString(R.string.page_url));
				intent.putExtra(SmartConstants.CHECK_FOR_APP_CONFIG_INFO, appConfigInformation);
				intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
				intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION);
				startActivity(intent);
				finish();
				overridePendingTransition(0, 0);
				super.handleMessage(msg);
			}
		};
		splashHandler.sendEmptyMessageDelayed(0, 1000);
	}

	@Override
	public void onConfigurationChanged(Configuration newConfig) {
		super.onConfigurationChanged(newConfig);
	}
}
