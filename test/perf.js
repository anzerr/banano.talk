
const {Simple} = require('../index.js');

const run = (x, func) => {
	let total = 0, count = 0;
	for (let i = 0; i < x; i++) {
		let start = process.hrtime();
		func();
		let end = process.hrtime(start);
		total += ((end[0] * 1e9 + end[1]) / 1e9);
		count += 1;
	}
	return [total, count];
};

const simple = new Simple(), wait = [];
simple.encode('hello, world!').then(() => {
	let start = process.hrtime();
	console.log('test', run(10000, () => {
		wait.push(simple.encode('hello, world!').then((res) => {
			return simple.decode(res.code);
		}));
	}));

	Promise.all(wait).then(() => {
		let end = process.hrtime(start);
		console.log('done', ((end[0] * 1e9 + end[1]) / 1e9));
	});
});
