import history from 'services/History';
import api from 'services/ApiService';

/* global cordova, device, StatusBar, PushNotification */

var service = {};

service.init = function() {
  if (PHONEGAP) {
    document.addEventListener('deviceready', service.onDeviceReady, false);
  }  
};

service.pickContact = function() {
  return new Promise((resolve, reject) => {
    navigator.contacts.pickContact(resolve, reject);
  });
};

service.scan = function() {
  return new Promise((resolve, reject) => {
    cordova.plugins.barcodeScanner.scan(resolve, reject, {
      preferFrontCamera : false,
      showFlipCameraButton : true,
      showTorchButton : true,
      torchOn: false,
      prompt : "",
      resultDisplayDuration: 0,
      formats : "QR_CODE,CODE_128,CODE_39",
      disableAnimations : true,
      disableSuccessBeep: false
    });
  });
};

service.onDeviceReady = function() {
  service.ready = true;

  // Set StatusBar style (preferences in confix.xml does not work with PGB).
  StatusBar.overlaysWebView(false);
  StatusBar.styleLightContent();
  StatusBar.backgroundColorByHexString("#009933");

  // Close splashscreen after short delay.
  setTimeout(navigator.splashscreen.hide, 100); 

  var push = PushNotification.init({
    android: {
      icon: 'pushicon',
      iconColor: '#009933',
      sound: true
    },
    ios: {
      alert: true,
      badge: true,
      sound: true
    }
  });

  push.setApplicationIconBadgeNumber(() => {}, () => {}, 0);
  document.addEventListener('resume', function() {
    push.setApplicationIconBadgeNumber(() => {}, () => {}, 0);
  }, false);

  push.on('registration', function(data) {
    api.setPushToken({ token: data.registrationId, os: device.platform.toLowerCase(), version: device.version });
  });

  push.on('notification', function(data) {

    push.setApplicationIconBadgeNumber(() => {}, () => {}, 0);

    if (data.additionalData.path) {
      history.push(data.additionalData.path);
    }

  });

  push.on('error', function (e) {
    console.log('Push Error', e.message);
  });

};

export default service;