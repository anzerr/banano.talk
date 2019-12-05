
const {Advanced, Simple} = require('./index.js');

/* const advanced = new Advanced();
advanced.encode('send ban i guess').then((res) => {
	console.log('done', res);
}).catch(console.log);*/

const simple = new Simple();
simple.encode('hello, world!').then((res) => {
	console.log('done', res);
	return simple.decode(res.code);
}).then((res) => {
	console.log('done', res);
}).catch(console.log);

const n = BigInt('2500000000000000000895174265676'.slice(-29)) ^ 895175784877n;

simple.decode(n.toString()).then((res) => { // hi
	console.log('done', res);
}).catch(console.log);
