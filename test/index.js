
const {Simple} = require('../index.js'),
	assert = require('assert');

class Test {

	constructor() {
		this.simple = new Simple();
	}

	checksum() {
		assert.equal(this.simple.charset.checksum('0'), '1');
		assert.equal(this.simple.charset.checksum('1'), '2');
		assert.equal(this.simple.charset.checksum('12'), '4');
		assert.equal(this.simple.charset.checksum('123'), '7');
		assert.equal(this.simple.charset.checksum('012'), '4');
		assert.equal(this.simple.charset.checksum('999'), '8');
		assert.equal(this.simple.charset.checksum('900'), '0');
		assert.equal(this.simple.charset.checksum('000'), '1');

		assert.equal(this.simple.charset.checksum(''), null);
		assert.equal(this.simple.charset.checksum('a'), null);
		assert.equal(this.simple.charset.checksum('1a'), null);
		assert.equal(this.simple.charset.checksum(' '), null);
		assert.equal(this.simple.charset.checksum(123), null);
		assert.equal(this.simple.charset.checksum(true), null);
	}

	validate() {
		assert.equal(this.simple.charset.validate('0', '1'), true);
		assert.equal(this.simple.charset.validate('1', '2'), true);
		assert.equal(this.simple.charset.validate('12', '4'), true);
		assert.equal(this.simple.charset.validate('123', '7'), true);
		assert.equal(this.simple.charset.validate('012', '4'), true);
		assert.equal(this.simple.charset.validate('999', '8'), true);
		assert.equal(this.simple.charset.validate('900', '0'), true);
		assert.equal(this.simple.charset.validate('000', '1'), true);

		assert.equal(this.simple.charset.validate('', ''), false);
		assert.equal(this.simple.charset.validate('', '1'), false);
		assert.equal(this.simple.charset.validate('', 'a'), false);
		assert.equal(this.simple.charset.validate('a', '1'), false);
		assert.equal(this.simple.charset.validate('1a', '2'), false);
		assert.equal(this.simple.charset.validate(' ', '1'), false);
		assert.equal(this.simple.charset.validate('a', false), false);
		assert.equal(this.simple.charset.validate(false, false), false);
		assert.equal(this.simple.charset.validate(false, '1'), false);
		assert.equal(this.simple.charset.validate('123', 'a'), false);
	}

	wrap(p) {
		return p.then((e) => {
			console.log(e);
			throw new Error('test');
		}).catch((err) => {
			assert.notEqual(err.message, 'test');
		});
	}

	encode() {
		return Promise.all([
			this.wrap(this.simple.encode('\\')),
			this.wrap(this.simple.encode('^')),
			this.simple.encode('etaoinsrhldcumfpgwybvkxjqz').then((res) => {
				assert.equal(res.code, '454671098947234223080558686603081012516894');
			}),
			this.simple.encode('a').then((res) => {
				assert.equal(res.code, '160001');
			}),
			this.simple.encode('hello, world!').then((res) => {
				assert.equal(res.code, '2182701366461085457178942');
			}),
			this.simple.encode('e').then((res) => {
				assert.equal(res.code, '140001');
			})
		]);
	}

	decode() {
		return Promise.all([
			this.wrap(this.simple.decode('\\')),
			this.wrap(this.simple.decode('^')),
			this.wrap(this.simple.decode('^')),
			this.wrap(this.simple.decode('A')),
			this.wrap(this.simple.decode(true)),
			this.wrap(this.simple.decode(false)),
			this.wrap(this.simple.decode(12345)),
			this.simple.decode('454671098947234223080558686603081012516894').then((res) => {
				assert.equal(res, 'etaoinsrhldcumfpgwybvkxjqz');
			}),
			this.simple.decode('140001').then((res) => {
				assert.equal(res, 'e');
			})
		]);
	}

}

let t = new Test();
t.checksum();
t.validate();
Promise.all([
	t.encode(),
	t.decode()
]).catch((e) => {
	console.log(e);
	process.exit(1);
});

