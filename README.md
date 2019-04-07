
### `Intro`
Saw the way (monkeytalks)[https://github.com/BananoCoin/monkeytalks] encodes text into the amount in a transaction. I wanted to expand on this idea
The encoding can be slimed down by using the pow to store the charset. If we use the past two digest of the pow that expands the charset to 65535.

This is a first attempt to use this expanded charset to store longer text.

```
const Talk = require('banano.talk');

(new Talk()).encode('howtobanano.info').then((res) => {
	console.log('done', res);
}).catch(console.log);
```
The output should look like this
```
{
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