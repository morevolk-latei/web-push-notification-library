

(function(self){
	console.log('Notification worker loaded...');
	console.log(self);

	self.addEventListener('push', function(event) {
		var options = {
			body: 'Hi, there! I have something for you...',
			title: 'Sample notification'
		}
		event.waitUntil(
			self.registration.showNotification(options.title, options)
		);

		// console.log('New notification', event);
		// var data = event.data.json()
		// console.log('New notification', data);

		// var options = {
		// 	body: data.body,
		// }

		// event.waitUntil(
		// 	self.registration.showNotification(data.title, options)
		// );
	});

	function init() {
		console.log('init called');

	};

	init();
})(self);
