function TaskTimer(){
    this.timeOutId = null;//定时任务的id不对外
};
TaskTimer.prototype = {
    setTimer:function(method,time,context){
		this.clearTimer();
		if(time===undefined)time=0;
		this.timeOutId =setTimeout(function(){
			method.call(context);
		},time);
	},
	clearTimer:function(){
		if(this.timeOutId !=null){
			clearTimeout(this.timeOutId );
			this.timeOutId =null;
		}
	},
	isIdle:function(){
		if(this.timeOutId !=null){
			return false;
		}else{
			return true;
		}
	}
};
module.exports = TaskTimer;