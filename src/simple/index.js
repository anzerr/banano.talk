
const Charset = require('./charset.js'),
	is = require('type.util');

// https://github.com/pawapps/nanote/blob/master/src/nanote.js
// https://monkeytalks.cc/

class Encoder {

    constructor() {
		this.charset = new Charset();
    }

    shortest(plaintext) {
        // Keep only unique characters in plaintext
        plaintext = String.prototype.concat(...new Set(plaintext));

        var ret = -1;
        var good_charset = true;

        // Iterate over all charsets
        for (var counter in this.charsets) {
            var charset = this.charsets[counter];
            good_charset = true;

            // Iterate over all characters in plaintext
            for (var char of plaintext) {
                // Plaintext character not found in this charset
                if (charset.indexOf(char) == -1) {
                    good_charset = false;
                    break;
                }
            }

            if (good_charset) {
                // Return first good charset because shorter charsets are
                // iterated over before longer charsets.
                return Number(counter);
            }
        }

        return ret;
    }

    encode(plaintext) {
        // input validation
        if (typeof plaintext != 'string') {
            if (this.verbose) { console.error('Failed to encode due to non string input'); }
            return false;
        }

        // Prepend space. This space acts as a checksum for discerning nanote messages.
        // A space is the "least expensive" character
        plaintext = ' ' + plaintext;

        var charset_index = this.shortest_charset(plaintext);
        if (charset_index == -1)
        {
            // No charset found
            if (this.verbose) { console.error('Failed to encode due to no available charset'); }
            return false;
        }
        if (this.verbose) { console.log('Encoding with charset (' + charset_index + '): ' + this.charsets[charset_index]); }

        var quotient = this.b10encode(plaintext, this.charsets[charset_index]);

        // Format Nano value string
        quotient = quotient + (this.minimum_raw/BigInt(10**(this.charset_index_length+1)));    // Add minimum_raw (divide charset_index_length+1
                                                                                // because quotient is shifted left to
                                                                                // allow charset index and checksum)

        var nano = String(quotient);                                                    // Set encoded string
        nano = nano + String(charset_index).padStart(this.charset_index_length, '0');   // Set charset index
        var checksum = this.calculate_checksum(String(charset_index));                  // Set checksum
        if (checksum === false) {
            if (this.verbose) { console.error('Failed to encode due to failed checksum calculation'); }
            return false;
        }
        nano = nano + checksum;     // Set checksum
        nano = nano.padStart(31, '0');                      // Ensure leading zeros
        nano = nano.slice(0, -30) + '.' + nano.slice(-30);  // Add decimal

        return nano;
    }

    decode(nano) {
        if (typeof nano != 'string') {
            if (this.verbose) { console.error('Failed to decode due to non string input'); }
            return false;
        }
        if (nano.match(/^\d+\.\d{30}/) == null) {
            if (this.verbose) { console.error('Failed to decode due to regex mismatch'); }
            return false;
        }
        try {
            var checksum = nano.slice(-1,);
            var charset_index = Number(nano.slice((this.charset_index_length*-1)-1, -1));
        } catch(err) {
            if (this.verbose) { console.error('Failed to decode due to amount parsing exception'); }
            return false;
        }
        if (this.validate_checksum(String(charset_index), checksum) === false) {
            if (this.verbose) { console.error('Failed to decode due to invalid checksum'); }
            return false;
        }

        if (this.verbose) { console.log('Decoding with charset (' + charset_index + '): ' + this.charsets[charset_index]); }

        // Format Nano value string to quotient
        var quotient = nano.replace('.', '');                                   // remove decimal
        quotient = quotient.slice(0, -1)                                        // remove checksum
        quotient = quotient.slice(0, (this.charset_index_length*-1));           // remove charset index
        quotient = BigInt(quotient);
        quotient = quotient - (this.minimum_raw/BigInt(10**(this.charset_index_length+1)));    // remove minimum_raw (divide charset_index_length+1
                                                                                // and checksum length because quotient was shifted right)
        if (quotient < 0) {
            // nano input was not larger than the minimum raw
            if (this.verbose) { console.error('Failed to decode due to amount not being larger than the minimum raw'); }
            return false;
        }
        var plaintext = this.b10decode(BigInt(quotient), this.charsets[charset_index]);

        // Check that the first character is a space, as required by the protocol, and then strip it.
        if (plaintext[0] !== ' ') {
            if (this.verbose) { console.error('Failed to decode due to decoded string not beginning with a space character'); }
            return false;
        }
        plaintext = plaintext.slice(1,);

        return plaintext;
    }

}

module.exports = Nanote;