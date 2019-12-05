
### `Intro`
Util to encode and decode for [monkeytalks](https://github.com/BananoCoin/monkeytalks). This has the start of a new spec I wanted to expand on the idea to try and get longer text saved.
The encoding can be slimed down by using the pow to store the charset. If we use the last two digest of the PoW that expands the charset to 65535.

This is a first attempt to use this expanded charset to store longer text.

#### `Install`
``` bash
npm install --save git+https://github.com/anzerr/banano.talk.git
npm install --save @anzerr/banano.talk
```

#### `Example`
``` javascript
const {Advanced, Simple} = require('banano.talk');

const advanced = new Advanced(); // new spec still in beta
advanced.encode('send ban i guess').then((res) => {
	console.log('done', res);
}).catch(console.log);

const simple = new Simple(); // respects the specs for https://monkeytalks.cc/
simple.encode('hello, world!').then((res) => {
	console.log('done', res);
	return simple.decode(res.code);
}).then((res) => {
	console.log('done', res);
}).catch(console.log);

const n = BigInt('2500000000000000000895174265676'.slice(-29)) ^ 895175784877n; // monkeytalks has a xor key

simple.decode(n.toString()).then((res) => {
	console.log('done', res);  // hi
}).catch(console.log);

```

The output should look like this
``` javascript
{ // Simple
	text: ' hello, world!',
	charset: '894',
	checksum: '2',
	blocks: 218270136646108545717n,
	cost: 0.000021827013664610858,
	code: '2182701366461085457178942'
}
{ // Advanced
    text: 'howtobanano.info ',
    charset: '0000',
    blocks: ['h', 'o', 'w', 'to', 'b', 'an', 'an', 'o', '.', 'in', 'f', 'o', ' '],
    raw: ['37',
        '28',
        '40',
        '45',
        '22',
        '56',
        '56',
        '28',
        '14',
        '46',
        '34',
        '28',
        '0'
    ],
    code: '000028344614285656224540283719'
}
```