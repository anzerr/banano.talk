
class Work {

	constructor(ar, max) {
		this.work = Buffer.from(ar);
		this.max = max;
		this._i = 0;
	}

	increment() {
		for (let i = this.work.length - 1; i > 0; i--) {
			if (this.work[i] === this.max) {
				this.work[i] = 0;
			} else {
				this.work[i] += 1;
				break;
			}
		}
		this._i += 1;
		return this;
	}

	get() {
		return Buffer.from(this.work).reverse();
	}

}

module.exports = Work;
