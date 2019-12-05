
const Charset = require('./charset'),
	{b10} = require('../util'),
	is = require('type.util');

class Encoder {

	constructor() {
		this.charset = new Charset();
		this.minimum = 0n;
	}

	encode(text) {
		return this.charset.load().then((sets) => {
			text = ` ${text}`.toLowerCase();
			if (!this.charset.valid(text)) {
				throw new Error('this text can\'t be encoded');
			}
			for (let i in sets) {
				if (text.match(sets[i].regex)) {
					let code = b10.encode(text, sets[i].char) + this.minimum;
					let charset = i.toString().padStart(3, 0),
						checksum = this.charset.checksum(charset),
						value = `${code}${charset}${checksum}`;
					return {
						text: text,
						charset: charset,
						checksum: checksum,
						blocks: code,
						cost: Number(value) / 1e29,
						code: value
					};
				}
			}
			throw new Error('this text can\'t be encoded');
		});
	}

	decode(text) {
		return this.charset.load().then((sets) => {
			if (!is.string(text) || !text.match(/^\d+$/)) {
				throw new Error('this text can\'t be decoded');
			}
			const checksum = text.slice(-1),
				index = text.slice(-4, -1),
				code = text.slice(0, -4);
			if (!this.charset.validate(index, checksum)) { // yes this is weird why checksum index?
				throw new Error('invalid checksum');
			}
			return b10.decode(BigInt(code) - this.minimum, sets[Number(index)].char).slice(1);
		});
	}

}

module.exports = Encoder;
