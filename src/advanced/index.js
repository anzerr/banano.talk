
const Charset = require('./charset.js'),
	{b10} = require('../util');

class Encoder {

	constructor() {
		this.charset = new Charset();
		let size = ['0000000000000000000000000000', '0', '0'];
		this.flag = '9';
		this.size = {
			msg: size[0].length / 2,
			checksum: size[1],
			flag: size[2]
		};
	}

	encode(text) {
		return this.charset.load().then((sets) => {
			text = `${text} `.toLowerCase();
			if (!this.charset.valid(text)) {
				throw new Error('this text can\'t be encoded');
			}

			for (let i in sets) {
				if (text.match(sets[i].regex)) {
					let match = [], tmp = text;
					while (tmp) {
						let best = 0, k = 0;
						for (let v in sets[i].char) {
							let m = tmp.match(new RegExp('^' + v.replace(/\./g, '\\.')));
							if (m && m[0] && m[0].length > best) {
								best = m[0].length;
								k = v;
							}
						}
						match.push(k);
						tmp = tmp.slice(best);
					}

					if (match.length <= this.size.msg) {
						let code = b10.encode(match, sets[i].char);
						let checksum = this.charset.checksum(code.toString()),
							charset = (i.toString(16)).padStart(4, 0),
							value = `${code}${checksum}${this.flag}`;
						return {
							text: text,
							charset: charset,
							raw: match,
							sum: checksum,
							cost: Number(value) / 1e29,
							code: value
						};
					}
				}
			}
			return null;
		});
	}

}

module.exports = Encoder;
