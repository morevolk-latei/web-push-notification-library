var PushNotification = null;

(function(window, document){

	// Memory management
	window.onunload = function(e){
		e.cancelBubble = true;
		if (e.stopPropagation) {
		    e.stopPropagation();
		    e.preventDefault();
		}

		console.log('Freeing allocated memory');
		PushNotification = null;
	};

	PushNotification = (function(){
		function FirebaseNotification() {
			this.requestUserPermission(function(permission, hasError) {
				if (hasError) {
					return log(2, 'Cannot proceed furthor as permission is ', permission);
				}

				this.registerWorker(this.config.workerFilePath)
					.then(function(res) {
						this.registration = res;
						this.config.messaging.usePublicVapidKey(this.config.serverPublicKey);
						this.config.messaging.useServiceWorker(res);
						this.displayForegroundNotification();
						this.getFCMTokenFirebase();
						this.listenForFCMTokenRefresh();
					}.bind(this))
					.catch(function(err) {});
			}.bind(this));
		};

		function CustomNotification() {
			this.registerWorker(this.config.workerFilePath)
				.then(function(res) {
					this.registration = res;
					this.subscribe();
				}.bind(this))
				.catch(function(err) {});
		};

		// Private functions
		function log() {
			/* @arguments[0]::loggerType 0, 1, 2, 3
			 * 0 - console.log
			 * 1 - console.info
			 * 2 - console.warn
			 * 3 - console.error
			 * 4 - console.group
			 */
			var logger = console.log;
			switch(arguments[0]) {
				case 1: console.info; break;
				case 2: console.warn; break;
				case 3: console.error; break;
				case 4: console.group; break;
			};

			var args = Array.prototype.slice.call(arguments, 1);
			logger.apply(console, args);
		};

		function urlB64ToUint8Array(base64String) {
		  var padding = '='.repeat((4 - base64String.length % 4) % 4);
		  var base64 = (base64String + padding)
		    .replace(/\-/g, '+')
		    .replace(/_/g, '/');

		  var rawData = window.atob(base64);
		  var outputArray = new Uint8Array(rawData.length);

		  for (var i = 0; i < rawData.length; ++i) {
		    outputArray[i] = rawData.charCodeAt(i);
		  }
		  return outputArray;
		};

		function validateConfig(c) {
			if (!c) return false;
			if (!c.workerFilePath) return false;
			if (!c.serverPublicKey) return false;

			return true;
		};
		// Private functions ends

		function NotificationApp(config) {
			if (!validateConfig(config)) {
				log(3, 'Invalid config file passed to constructor.', config);
				return;
			}

			if (config.messaging && config.messaging.app && config.messaging.app.firebase_) {
				this.isFirebaseEnabled = true;
			} else {
				this.isFirebaseEnabled = false;
			}

			var encodedServerPublicKey = {
				serverPublicKey: urlB64ToUint8Array(config.serverPublicKey)
			};

			if (this.isFirebaseEnabled) {
				encodedServerPublicKey = {}
			}

			var _config = Object.assign(config, encodedServerPublicKey);

			// All validation and sanitization are applied on config.
			this.config = _config;
			var _this = this; // reference to NotificationApp class scope.

			// Constructor calling
			this.init();
		};

		NotificationApp.prototype.init = function(){
				log(0, 'Push Notification instance created with config ', this.config);

				if (this.isServiceWorkerSupported() && !this.isFirebaseEnabled) {
					// Now register notification service worker.
					CustomNotification.call(this);
				} else if (this.isServiceWorkerSupported() && this.isFirebaseEnabled){
					// firebase flow
					FirebaseNotification.call(this);
				}
		};

		NotificationApp.prototype.isServiceWorkerSupported = function(){
			return 'serviceWorker' in navigator && 'PushManager' in window;
		};

		NotificationApp.prototype.registerWorker = function(workerFilePath){
			return new Promise(function(resolve, reject) {
				navigator.serviceWorker.register(workerFilePath)
					.then(function(registration) {
						log(2, 'serviceWorker registered.');
						resolve(registration);
					}).catch(function(registration) {
						log(1, 'serviceWorker register failed.');
						reject(registration);
					});
			});
		};

		NotificationApp.prototype.requestUserPermission = function(callback) {
			log(0, 'requesting permission...');
			Notification.requestPermission().then(function(permission) {
			  if (permission === 'granted') {
			    log(0, 'Notification permission granted.');
			    // TODO(developer): Retrieve an Instance ID token for use with FCM.
			    // Get Instance ID token. Initially this makes a network call, once retrieved
			    // subsequent calls to getToken will return from cache.
			    callback(permission, false);
			  } else {
			    log(2, 'Unable to get permission to notify.');
			    callback(permission, true);
			  }
			});
		};

		NotificationApp.prototype.sendFCMTokenToServer = function(token){
			// send FCM token to server
			console.log('Sending FCM token to server ', token);
		}

		NotificationApp.prototype.getFCMTokenFirebase = function() {
			this.config.messaging.getToken().then(function(FCMToken) {
			  if (FCMToken) {
				console.log('FCMToken ', FCMToken);
				this.sendFCMTokenToServer(FCMToken);
			  } else {
			    // Show permission request.
			    console.log('No Instance ID token available. Request permission to generate one.');
			    // Show permission UI.
			  }
			}.bind(this)).catch(function(err) {
			  console.log('An error occurred while retrieving token. ', err);
			});
		};

		NotificationApp.prototype.listenForFCMTokenRefresh = function(){
			log(1, 'Listing for FCM token referesh.');
			this.config.messaging.onTokenRefresh(function() {
				this.getFCMTokenFirebase();
			}.bind(this));
		};

		NotificationApp.prototype.displayForegroundNotification = function(){
			this.config.messaging.onMessage(function(payload) {
			  console.log('Message received foreground. ', payload, this);
			  // ...
			  // Customize notification here
			  var notificationTitle = 'Foreground Message Title';
			  var notificationOptions = {
			    body: 'Foreground Message body.',
			    icon: '/firebase-logo.png'
			  };

			  return this.registration.showNotification(notificationTitle,
			    notificationOptions);
			}.bind(this));
		};

		NotificationApp.prototype.getExistingSubscriptionOrGenerateNew = function(callback){
			this.registration.pushManager.getSubscription()
				.then(function(existingSubscription) {
					if (existingSubscription) {
						console.log('Existing subscription');
						callback.call(this, existingSubscription, false);
					} else {
						this.registration.pushManager.subscribe({
							applicationServerKey: this.config.serverPublicKey,
							userVisibleOnly: true
						}).then(function(newSubscription) {
							log('User is subscribed. ', newSubscription);
							callback.call(this, newSubscription, false);
						})
						.catch(function(errorSubscription){
							log('User subscribe failed. ', errorSubscription);
							callback.call(this, null, true);
						});
					}
				}.bind(this))
				.catch(function(err) {
					log('An error ocurred during Service Worker registration. ', err);
					callback.call(this, null, true);
				}.bind(this));
		};

		NotificationApp.prototype.subscribe = function(){
			this.getExistingSubscriptionOrGenerateNew(function(subscription, isError) {
				if (isError) {
					return;
				}

				// Send subscription to server.
				console.log('FCM received ', subscription, this);
			});
		};


		return NotificationApp;
	})();

})(window, document);