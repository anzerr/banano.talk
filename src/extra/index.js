
const Charset = require('./charset.js');

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
			text = (text + ' ').toLowerCase();
			if (!this.charset.valid(text)) {
				throw new Error('this text can\'t be encoded');
			}

			for (let i in sets) {
				if (text.match(sets[i].regex)) {
					let match = [], tmp = text;
					while(tmp) {
						let best = 0, k = 0;
						for (let v in sets[i].char) {
							let m = tmp.match(new RegExp('^' + sets[i].char[v].replace(/\./g, '\\.')));
							if (m && m[0] && m[0].length > best) {
								best = m[0].length;
								k = v;
							}
						}
						match.push(k);
						tmp = tmp.slice(best);
					}
					if (match.length <= this.size.msg) {
						let txt = [], code = [], sum = 0;
						for (let x in match) {
							txt.push(sets[i].char[match[x]]);
							code.push(match[x].padStart(2, 0));
						}
						code = code.reverse().join('').padStart(this.size.msg * 2, '0');
						for (let x in code) {
							sum += Number(code[x]);
						}
						return {
							text: text,
							charset: (i.toString(16)).padStart(4, 0),
							blocks: txt,
							raw: match,
							code: code + (sum % 10) + this.flag
						};
					}
				}
			}
			return null;
		});
	}

}

module.exports = Encoder;
