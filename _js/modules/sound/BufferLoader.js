function BufferLoader(context, url, callback) {
	this.context = context;
	this.url = url;
	this.onload = callback;
	this.buffer = [];
	this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url) {
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";
	var loader = this;

	request.onload = function() {
		loader.context.decodeAudioData(
			request.response,
			function(buffer) {
				if (!buffer) {
					console.error('error decoding file data: ' + url);
					return;
				}
				loader.buffer = buffer;
				loader.onload(loader.buffer);
			},
			function(error) {
				console.error('decodeAudioData error', error);
			}
		);
	};

	request.onerror = function() {
		console.error('BufferLoader: XHR error');
	};

	request.send();
};

BufferLoader.prototype.load = function() {
	this.loadBuffer(this.url);
};

module.exports = BufferLoader;
