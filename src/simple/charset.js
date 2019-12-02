
const fs = require('fs.promisify'),
	is = require('type.util');

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
			return fs.access('./src/simple/charset.json', fs.constants.R_OK | fs.constants.W_OK).catch(() => {
				return this.generate();
			});
		}).then(() => {
			return fs.readFile('./src/simple/charset.json');
		}).then((res) => {
			let set = JSON.parse(res.toString());
			for (let i in set) {
				set[i].regex = new RegExp(set[i].regex);
			}
			return (this.sets = set);
		});
	}

	generate() {
		let charsets = [];
		let letters = 'etaoinsrhldcumfpgwybvkxjqz';
		let noVowels = 'tnsrhldcmfpgwbvkxjqz';
		let numbers = '1234567890';
		let puncsList = ['', '~', '!', '@', '#', '$', '%', '&', '*', '(', ')', '-', '_', '+', '=', ',', '.', '?', '/', '<', '>', ';', ':', '[', ']', '\''];
		let puncs = puncsList.slice(0);

		for (let i = 0; i < puncsList.length; i = i + 4) {
			puncs.push(puncsList.join('').slice(i, i + 4));
		}
		for (let i = 0; i < puncsList.length; i = i + 8) {
			puncs.push(puncsList.join('').slice(i, i + 8));
		}
		for (let i = 0; i < puncsList.length; i = i + 16) {
			puncs.push(puncsList.join('').slice(i, i + 16));
		}
		puncs.push(puncsList.join(''));
		for (let punc of puncs) {
			for (let i = 10; i <= letters.length; i++) {
				charsets.push(' ' + letters.slice(0, i) + punc);
			}

			charsets.push(' ' + letters.slice(0, 10) + numbers + punc);
			charsets.push(' ' + letters.slice(0, 14) + numbers + punc);
			charsets.push(' ' + letters.slice(0, 18) + numbers + punc);
			charsets.push(' ' + letters.slice(0, 22) + numbers + punc);
			charsets.push(' ' + letters + numbers + punc);
			charsets.push(' ' + noVowels + punc);
			charsets.push(' ' + noVowels + numbers + punc);
			charsets.push(' ' + numbers + punc);
		}
		charsets = charsets.sort((a, b) => a.length - b.length);
		return fs.writeFile('./src/simple/charset.json', JSON.stringify(charsets, null, '\t')).then(() => charsets);
	}

	checksum(num) {
        if (!is.string(num) || !num.match(/^\d+$/)) {
            return false;
        }
        var sum = 0;
        for (let i in num) {
            sum = sum + Number(num[i]);
        }

        sum++;
        return (sum % 10).toString();
    }

    validate(num, checksum) {
        return (is.string(num) && is.string(checksum) && checksum.match(/^\d$/) && this.checksum(num) == checksum);
    }

}

module.exports = Charset;
