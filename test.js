
const {Advanced, Simple} = require('./index.js');

const advanced = new Advanced();
advanced.encode('send ban i guess').then((res) => {
	console.log('done', res);
}).catch(console.log);

const simple = new Simple();
simple.encode('send ban, i guess').then((res) => {
	console.log('done', res);
	return simple.decode(res.code);
}).then((res) => {
	console.log('done', res);
}).catch(console.log);
