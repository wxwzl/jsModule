/**
 * 分帧函数执行器
 * 用法：
 * method:要分帧执行的代码段构成的函数，
 * array：它的长度决定上面的代码段执行的次数。array数组的子项会作为method函数执行的第一个参数项传入，
 * context:method执行时的上下文环境
 * config:{
 *     frameTime:一帧的毫秒数定义
 * }
 * let frameExecutor = frameExecutorFactTory.getFrameExecutor(array, method, context, config)；
 * frameExecutor.execute();
 */
let iteratorGenerator = require("./IteratorGenerator");

let TaskTimer = require("./TaskTimer");

function FrameExecutor(iteratorGenerator, config) {
    this.frameTime = 60; //定义每帧的毫秒数
    this.iteratorGenerator = iteratorGenerator;
    if (config && config.frameTime) {
        this.frameTime = config.frameTime;
    }
    this.status = 0;
    this._timer = new TaskTimer();
};
FrameExecutor.prototype = {
    constructor: FrameExecutor,
    statusMap: {
        pause: -1,
        run: 1
    },
    execute: function () {
        this.status = this.statusMap.run;
        let lastTimeStamp = new Date().getTime();
        iterator.next();
        let nowTimeStamp = null;
        while (iterator.hasNext()) {
            if (this.status == this.statusMap.pause) {
                return;
            }
            nowTimeStamp = new Date().getTime();
            if (nowTimeStamp - lastTimeStamp > this.frameTime) {
                this._nextTick(this.execute, this);
                break;
            } else {
                iterator.next();
            }
        }
    },
    _nextTick: function (callBack, context) {
        this._timer.setTimer(function () {
            callBack && callBack.call(context);
        }, 0);
    },
    pause: function () {
        this.status = this.statusMap.pause;
        this._timer.clearTimer();
    },
    resume: function () {
        this.execute();
    }
};

function FrameExecutorFactory() {

}

FrameExecutorFactory.prototype = {
    constructor: FrameExecutorFactory,
    getFrameExecutor: function (array, method, context, config) {
        let iterator = iteratorGenerator.getIterator(array, method, context);
        return new FrameExecutor(iterator, config);
    }
}
let frameExecutorFactory = new FrameExecutorFactory();
module.exports = frameExecutorFactory;