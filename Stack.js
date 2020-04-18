function Stack() {
	this.list = [];
};
Stack.prototype = {
	top: function () {
		return this.list[0];
	},
	pop: function () {
		return this.list.splice(0, 1)[0];
	},
	push: function (e) {
		return this.list.unshift(e);
	},
	walk: function (handler, context) {
		let len = this.list.length;
		let node = null;
		let flag = false;
		for (let i = 0; i < len; i++) {
			node = this.list[i];
			if (handler) {
				flag = handler.call(context, node, i);
				if (flag) {
					return;
				}
			}
		}
	},
	size:function(){
		return this.list.length;
	},
	clear:function(){
		let array = this.list;
		this.list = [];
		return array;
	}
};

module.exports = Stack;