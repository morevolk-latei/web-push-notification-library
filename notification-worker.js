

(function(self){
	console.log('Custom Notification worker loaded...');
	// var messaging = null;
	importScripts('https://www.gstatic.com/firebasejs/7.6.1/firebase-app.js');
	importScripts('https://www.gstatic.com/firebasejs/7.6.1/firebase-messaging.js');
	importScripts('https://www.gstatic.com/firebasejs/7.6.1/firebase-analytics.js');
	importScripts('firebase-init.js');
	var messaging = null;

	function init() {
		// importScripts('https://www.gstatic.com/firebasejs/7.6.1/firebase-app.js');
		// importScripts('https://www.gstatic.com/firebasejs/7.6.1/firebase-messaging.js');
		// importScripts('https://www.gstatic.com/firebasejs/7.6.1/firebase-analytics.js');
		// importScripts('firebase-init.js');
		messaging = firebase.messaging();
		messaging.setBackgroundMessageHandler(showNotification);
		// self.addEventListener('push', showNotification);
	};

	function showNotification(payload) {
		console.log('[firebase-messaging-sw.js] Received background message ', payload.data, Object.keys(payload.data).length);
		// Customize notification here
		const notificationTitle = 'Background Message Title';
		const notificationOptions = {
		  body: 'Background Message body.',
		  icon: '/firebase-logo.png'
		};
		
		return self.registration.showNotification(notificationTitle,
		  notificationOptions);
	}

	init();
})(self);
