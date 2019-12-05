
class B10 {

	encode(plaintext, charset) {
        let quotient = 0n,
			modulus = 0n,
			max = BigInt(Object.keys(charset).length + 1);

        for (let char of plaintext) {
            modulus = BigInt(charset[char] + 1);
            quotient = (quotient * max) + modulus
        }

        return quotient;
    }

	decode(quotient, charset) {
	    let plaintext = '',
			modulus = 0n;
		const map = [];
		for (let i in charset) {
			map[charset[i]] = i;
		}
		const max = BigInt(map.length + 1);

	    while (quotient != 0n || modulus != 0n) {
	        modulus = quotient % max;
	        if (quotient > 0n) {
	            quotient = BigInt(quotient / max);
	        }
	        if (modulus > 0n) {
	            plaintext = `${map[modulus - 1n]}${plaintext}`;
	        }
	    }

	    return plaintext;
	}

}

module.exports = {b10: new B10()};