
const Talk = require('./index.js');

(new Talk()).encode('howtobanano.info').then((res) => {
	console.log('done', res);
}).catch(console.log);
