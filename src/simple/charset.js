
const fs = require('fs.promisify'),
	staticCharset = require('./static'),
	is = require('type.util');

const letters = 'etaoinsrhldcumfpgwybvkxjqz',
	noVowels = 'tnsrhldcmfpgwbvkxjqz',
	numbers = '1234567890',
	puncsList = ['', '\'', ']', '[', ':', ';', '>', '<', '/', '?', '.', ',', '=', '+', '_', '-', ')', '(', '*', '&', '%', '$', '~', '#', '@', '!'];

const part = [];
for (let i = 10; i <= letters.length; i++) {
	part.push(` ${letters.slice(0, i)}`);
}
part.push(...[
	` ${letters.slice(0, 10)}${numbers}`,
	` ${letters.slice(0, 14)}${numbers}`,
	` ${letters.slice(0, 18)}${numbers}`,
	` ${letters.slice(0, 22)}${numbers}`,
	` ${letters}${numbers}`,
	` ${noVowels}`,
	` ${noVowels}${numbers}`,
	` ${numbers}`
]);

class Charset {

	constructor() {
		this.sets = null;
	}

	valid(text) {
		return is.string(text) && text.match(/^\s[a-z0-9~\!@#\$\%\&\*\(\)\-\_\+\=,\.\?\/<>;:\[\]\\\s]+$/);
	}

	load(gen = false) {
		if (this.sets && !gen) {
			return Promise.resolve(this.sets);
		}
		return Promise.resolve().then(() => {
			if (gen) {
				return this.generate();
			}
			return fs.access('./src/simple/charset.json', fs.constants.R_OK | fs.constants.W_OK).catch(() => {
				return this.generate();
			});
		}).then(() => {
			return fs.readFile('./src/simple/charset.json');
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

	generate(useStatic = true) {
		let charsets = [];
		if (useStatic) { // this is static because the underlayer code found https://github.com/pawapps/nanote/blob/master/src/nanote.js#L10 is wrong
			charsets = staticCharset;
		} else {
			const punc = puncsList.slice(0);

			let size = [4, 8, 16];
			for (let x in size) {
				for (let i = 0; i < puncsList.length; i = i + size[x]) {
					punc.push(puncsList.join('').slice(i, i + size[x]));
				}
			}
			punc.push(puncsList.join(''));

			for (let x in punc) {
				for (let i in part) {
					charsets.push(`${part[i]}${punc[x]}`);
				}
			}
			charsets = charsets.sort((a, b) => a.length - b.length);
		}
		let out = {};
		for (let i in charsets) {
			let a = charsets[i].split('');
			out[i] = {
				id: i,
				regex: `^(${a.join('|').replace(/([\/\.\*\?\!\+\(\)\[\]\$])/g, '\\$1')})+$`,
				char: a
			};
		}
		return fs.writeFile('./src/simple/charset.json', JSON.stringify(out, null, '\t')).then(() => out);
	}

	checksum(num) {
		if (!is.string(num) || !num.match(/^\d+$/)) {
			return null;
		}
		let sum = 0;
		for (let i in num) {
			sum = sum + Number(num[i]);
		}

		sum++;
		return (sum % 10).toString();
	}

	validate(num, checksum) {
		return (is.string(num) && is.string(checksum) && checksum.match(/^\d$/) !== null && this.checksum(num) === checksum);
	}

}

module.exports = Charset;
