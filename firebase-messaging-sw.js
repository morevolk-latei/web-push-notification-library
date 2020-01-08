

(function(self){
	importScripts('https://www.gstatic.com/firebasejs/7.6.1/firebase-app.js');
	importScripts('https://www.gstatic.com/firebasejs/7.6.1/firebase-messaging.js');
	
	// Your web app's Firebase configuration
	var firebaseConfig = {
	    apiKey: "AIzaSyC92ikuZxcqadaCOksglaSP4MquKnFnE7Y",
	    authDomain: "shiksha-f9687.firebaseapp.com",
	    databaseURL: "https://shiksha-f9687.firebaseio.com",
	    projectId: "shiksha-f9687",
	    storageBucket: "shiksha-f9687.appspot.com",
	    messagingSenderId: "947477020965",
	    appId: "1:947477020965:web:e2482b2d5d00496d869acc",
	    measurementId: "G-PDDL5QV3C4"
	};
	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);
	var messaging = firebase.messaging();

	console.log('Firebase Notification worker loaded...');
	console.log(self, messaging);


	messaging.setBackgroundMessageHandler(function(payload) {
	  console.log('[firebase-messaging-sw.js] Received background message ', payload);
	  // Customize notification here
	  const notificationTitle = 'Background Message Title';
	  const notificationOptions = {
	    body: 'Background Message body.',
	    icon: '/firebase-logo.png'
	  };
	  
	  return self.registration.showNotification(notificationTitle,
	    notificationOptions);
	});

	// self.addEventListener('push', function(event) {
	// 	console.log('notification event ', event);
	// 	var options = {
	// 		body: 'Hi, there! I have something for you...',
	// 		title: 'Sample notification'
	// 	}
	// 	event.waitUntil(
	// 		self.registration.showNotification(options.title, options)
	// 	);

	// 	// console.log('New notification', event);
	// 	// var data = event.data.json()
	// 	// console.log('New notification', data);

	// 	// var options = {
	// 	// 	body: data.body,
	// 	// }

	// 	// event.waitUntil(
	// 	// 	self.registration.showNotification(data.title, options)
	// 	// );
	// });

	function init() {
		console.log('init called');

	};

	init();
})(self);
