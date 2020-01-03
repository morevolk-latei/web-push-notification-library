console.log('Notification service file loaded.');

function Notification(config) {
	// Private functions
	function log(msg, arg1, arg2) { console.log(msg, arg1, arg2) };

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
	}

	function validateConfig(c) {
		if (!c) return false;
		if (!c.workerFilePath) return false;
		if (!c.serverPublicKey) return false;

		return true;
	}

	// Private functions ends
	if (!validateConfig(config)) return;

	var _config = Object.assign(config, {
		serverPublicKey: urlB64ToUint8Array(config.serverPublicKey)
	});

	this.config = _config;

	function init() {
		console.log('Init called with ', this.config);
		
		if (this.isServiceWorkerSupported()) {
			var _this = this;
			// Now register notification service worker.
			this.registerWorker(this.config.workerFilePath)
				.then(function(res) {
					_this.registration = res;
					_this.subscribe();
				})
				.catch(function(err) {});
		}
	}

	// Scope methods

	this.isServiceWorkerSupported = function() {
		return 'serviceWorker' in navigator && 'PushManager' in window;
	};

	this.registerWorker = function(workerFilePath) {
		return new Promise(function(resolve, reject) {
			navigator.serviceWorker.register(workerFilePath)
				.then(function(registration) {
					log('serviceWorker registered. ', registration)
					resolve(registration);
				}).catch(function(registration) {
					log('serviceWorker register failed. ', registration);
					reject(registration);
				});
		});
	};

	this.requestUserPermission = function() {};
	this.getExistingSubscriptionOrGenerateNew = function(callback) {
		var _this = this;
		_this.registration.pushManager.getSubscription()
			.then(function(existingSubscription) {
				if (existingSubscription) {
					console.log('Existing subscription');
					callback.call(_this, existingSubscription, false);
				} else {
					_this.registration.pushManager.subscribe({
						applicationServerKey: _this.config.serverPublicKey,
						userVisibleOnly: true
					}).then(function(newSubscription) {
						log('User is subscribed. ', newSubscription);
						callback.call(_this, newSubscription, false);
					})
					.catch(function(errorSubscription){
						log('User subscribe failed. ', errorSubscription);
						callback.call(_this, null, true);
					});
				}
			})
			.catch(function(err) {
				log('An error ocurred during Service Worker registration. ', err);
				callback.call(_this, null, true);
			});
	};
	this.subscribe = function() {
		this.getExistingSubscriptionOrGenerateNew(function(subscription, isError) {
			if (isError) {
				return;
			}

			// Send subscription to server.
			console.log('FCM received ', subscription, this);
		});
	};

	// Constructor calling
	init.apply(this);
};