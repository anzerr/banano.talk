
const fs = require('fs.promisify'),
	Work = require('./charset/work.js');

const numbers = '0123456789'.split(''),
	special = '_-./;:'.split('');


class Charset {

	constructor() {
		this.sets = null;
	}

	valid(text) {
		return text.match(/^[a-z0-9_\-\.\/;:\s]+\s$/);
	}

	load(gen = false) {
		return Promise.resolve().then(() => {
			if (gen) {
				return this.generate();
			}
		}).then(() => {
			return fs.readFile('./src/charset/charset.json');
		}).then((res) => {
			let set = JSON.parse(res.toString());
			for (let i in set) {
				set[i].regex = new RegExp(set[i].regex);
			}
			return (this.sets = set);
		});
	}

	buildData() {
		return fs.readFile('./src/charset/data.txt').then((res) => {
			let data = res.toString().split('\n'), json = {};
			for (let i in data) {
				let n = data[i].split('\t');
				if (!json[n[0].length]) {
					json[n[0].length] = [];
				}
				json[n[0].length].push({word: n[0], n: Number(n[1]) || 0});
			}
			for (let i in json) {
				json[i].sort((a, b) => b.n - a.n);
				let o = [];
				for (let x in json[i]) {
					o.push(json[i][x].word.toLowerCase());
				}
				json[i] = o;
			}
			return fs.writeFile('./src/charset/data.json', JSON.stringify(json, null, '\t')).then(() => json);
		});
	}

	generate() {
		return this.buildData().then((json) => {
			let base = numbers.length + special.length + json[1].length;
			let part = [], size = (100 - base) / 3;
			if (size !== Math.round(size)) {
				throw new Error(`not round split ${base} ${size}`);
			}
			for (let i = 2; i <= 4; i++) {
				let o = [];
				for (let x = 0; x < 41; x++) {
					o.push(json[i].slice(x * size, (x + 1) * size));
				}
				part.push(o);
			}
			let sets = [], work = new Work([0, 0, 0], 40);
			while (sets.length < 0xffff) {
				let w = work.get();
				let a = [].concat([' '], numbers, special, json[1], part[0][w[0]], part[1][w[0]], part[2][w[0]]);
				sets.push({
					regex: `^[${a.join('').replace(/\./g, '\\.')}]+$`,
					char: a
				});
				work.increment();
			}
			return fs.writeFile('./src/charset/charset.json', JSON.stringify(sets, null, '\t')).then(() => sets);
		});
	}

}

module.exports = Charset;
