function Iterator(keys, handler, context) {
    this.keys = keys;
    this.index = 0;
    this.handler = handler;
    this.context = context;
};
Iterator.prototype = {
    constructor: Iterator,
    next: function () {
        let key = this.keys[this.index++];
        if (key&&this.handler) {
            this.handler.call(this.context,key,this);
        }else{
            console.log(key);
        }
        return key;
    },
    hasNext: function () {
        if (this.index > this.keys.length - 1) {
            return false;
        }
        return true;
    },
    getCurrent: function () {
        return this.keys[this.index];
    },
};

function IteratorGenerator() {

};
IteratorGenerator.prototype = {
    getIterator: function (obj,handler, context) {
        let keys = Object.keys(obj);
        return new Iterator(keys,handler, context);
    },
};
let generator = new IteratorGenerator();
module.exports = generator;