
const fs = require('fs.promisify'),
	path = require('path'),
	is = require('type.util'),
	Work = require('./charset/work.js');

const numbers = '0123456789'.split(''),
	special = '=_-./;:'.split('');

class Charset {

	constructor() {
		this.sets = null;
	}

	valid(text) {
		return is.string(text) && text.match(/^[a-z0-9_=\-\.\/;:\s]+\s$/);
	}

	load(gen = false) {
		return Promise.resolve().then(() => {
			if (gen) {
				return this.generate();
			}
			return fs.access(path.join(__dirname, 'charset/charset.json'), fs.constants.R_OK | fs.constants.W_OK).catch(() => {
				return this.generate();
			});
		}).then(() => {
			return fs.readFile(path.join(__dirname, 'charset/charset.json'));
		}).then((res) => {
			let set = JSON.parse(res.toString());
			for (let i in set) {
				set[i].regex = new RegExp(set[i].regex);
				let map = {};
				set[i].charset = set[i].char.join('');
				for (let x in set[i].char) {
					map[set[i].char[x]] = Number(x);
				}
				set[i].char = map;
			}
			return (this.sets = set);
		});
	}

	buildData() {
		return fs.readFile(path.join(__dirname, 'charset/data.txt')).then((res) => {
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
			return fs.writeFile(path.join(__dirname, 'charset/data.json'), JSON.stringify(json, null, '\t')).then(() => json);
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
					o.push(json[i].slice(x * size, ((x + 1) * size) - ((i === 4) ? 3 : 0)));
				}
				part.push(o);
			}
			let sets = [], work = new Work([0, 0, 0], 40);
			while (sets.length < 0xffff) {
				let w = work.get();
				let a = [].concat([' '], numbers, special, json[1], part[0][w[0]], part[1][w[0]], part[2][w[0]]);
				sets.push({
					regex: `^(${a.reverse().join('|').replace(/([\/\.\$])/g, '\\$1')})+$`,
					char: a
				});
				work.increment();
			}
			return fs.writeFile(path.join(__dirname, 'charset/charset.json'), JSON.stringify(sets, null, '\t')).then(() => sets);
		});
	}

	checksum(num) {
		if (!is.string(num) || !num.match(/^\d+$/)) {
			return false;
		}
		let sum = 0;
		for (let i in num) {
			sum = sum + Number(num[i]);
		}

		sum++;
		return (sum % 10).toString();
	}

	validate(num, checksum) {
		return (is.string(num) && is.string(checksum) && checksum.match(/^\d$/) && this.checksum(num) === checksum);
	}

}

module.exports = Charset;
