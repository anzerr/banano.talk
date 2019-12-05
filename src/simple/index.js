
const Charset = require('./charset'),
	{b10} = require('../util'),
	is = require('type.util');

class Encoder {

    constructor() {
		this.charset = new Charset();
		this.minimum = 100000000000000000000000000n;
    }

    encode(text) {
        return this.charset.load().then((sets) => {
			text = `${text} `.toLowerCase();
			if (!this.charset.valid(text)) {
				throw new Error('this text can\'t be encoded');
			}
			for (let i in sets) {
				if (text.match(sets[i].regex)) {
					let code = b10.encode(text, sets[i].char) + (this.minimum / BigInt(10 ** (sets[i].charset.length + 1)));
					let checksum = this.charset.checksum(code.toString()),
						charset = i.toString().padStart(3, 0),
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
	        return null;
		});
    }

    decode(text) {
		return this.charset.load().then((sets) => {
			if (!is.string(text) || !text.match(/^\d+$/)) {
				throw new Error('this text can\'t be decoded');
			}
			const checksum = text.slice(-1),
				index = Number(text.slice(-4, -1)),
				code = text.slice(0, -4);
			if (!this.charset.validate(code, checksum)) {
				throw new Error('invalid checksum');
			}
			return b10.decode(BigInt(code) - (this.minimum / BigInt(10 ** (sets[index].charset.length + 1))), sets[index].char).slice(0, -1);
		});
    }

}

module.exports = Encoder;