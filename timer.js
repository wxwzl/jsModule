
function Task(method,context,times ,params){
    this.method = method;
    this.context = context;
    this.times = times;
    this.params = params;
}
Task.prototype = {
    execute:function(){
        this.method&&this.method.apply(this.context,this.params);
        if(this.times!=undefined){
            this.times--;
        }
    }
}

function TaskTimer(){
    this.timeOutId = null;//定时任务的id不对外
};
TaskTimer.prototype = {
    setTimer:function(time,method,context){
		this.clearTimer();
		let me=this;
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
};
module.exports = TaskTimer;

function Timer() {
    this.times = 0;
    this.interval = 1000 * 5;
    this.executionList = {};
    this.taskTimer = new TaskTimer();
    this.onceTimer = new TaskTimer();
};
Timer.prototype = {
    run: function () {
        this.taskTimer.setTimer(this.interval,function(){
            this.execute();
            this.run();
        },this);
    },
    execute:function(){
        this.times++;
        let seconds = parseInt(this.times*5);
        // console.log("定时任务正在运行：",this.times);
        this.walkExecutionList(function(interval,array,executionList){
            if(seconds%interval==0){
                if(array&&array.length){
                    let len = array.length;
                    let task = null;
                    for(let i=0;i<len;i++){
                        task = array[i];
                        try {
                            task.execute();
                        } catch (error) {
                            console.error("定时任务：",task.method.name,"报错！");
                        }
                        if(task.times!=undefined){
                            if(task.times<=0){
                                array.splice(i,1);
                                i--;
                            }
                        }
                    }
                }
            }
        },this);
    },
    walkIntervalList:function(handler,context,interval){
        let list = this.executionList[interval];
       return this.walkArray(list,handler,context);
    },
    walkExecutionList:function(handler,context){
        let executionList = this.executionList;
        this.walkObject(executionList,function(interval,array,executionList){
            interval = parseInt(interval);
            if(handler){
                return handler.call(context,interval,array,executionList);
            }
        },this);
    },
    removeExecution:function(method,interval){
       if(method){
           if(interval!=undefined){
                let list = this.executionList[interval]
                if(list){
                    this.walkIntervalList(function(execution,index,array){
                        if(execution.method==method){
                            array.splice(index,1);
                            return true;
                        }
                    },this,interval);
                }
                return ;
           }else{
            this.walkExecutionList(function(key,array,executionList){
                return this.walkIntervalList(function(execution,index,array){
                    if(execution.method==method){
                        array.splice(index,1);
                        return true;
                    }
                },this,key);
            },this);
           }
          
       }
        return this;
    },
    /**
     * @param
     * method: 要加入定时执行的函数
     * times:函数执行的次数，可以不传
     */
    pushExecutionList:function(config){
        let method = config.method;
        let interval = config.interval;
        if(method&&(typeof interval == "number")){
            if(!this.executionList[interval]){
                this.executionList[interval] = [];
            }
            let execution = new Task(config.method,config.context,config.times,config.params);
            this.executionList[interval].push(execution);
        }
        return this;
    },
    clearExecutionList:function(){
        this.executionList = {};
    },
    once:function(time,method,context){
        this.onceTimer.setTimer(time,method,context);
    },
    destroy:function(){
        this.stop();
        this.clearExecutionList();
    },
    stop:function(){
        this.taskTimer.clearTimer();
    },
    walkArray:function(array,handler,context){
        if(array&&array.length){
            let len = array.length;
            for(let i=0;i<len;i++){
                if(handler){
                    let isStop = handler.call(context,array[i],i,array);
                    if(isStop){
                        return isStop;
                    }
                }
                
            }
        }
    },
    walkObject:function(object,handler,context){
        let keys = Object.keys(object);
        let len = keys.length;
        if(len>0){
            let key = null;
            let value = null;
            for(let i = 0;i<len;i++){
                key = keys[i];
                value = object[key];
                if(handler){
                    let isStop = handler.call(context,key,value,object);
                    if(isStop){
                        return isStop;
                    }
                }
                
            }
        }
    },
};
if(!window.spaceCR){
    window.spaceCR={};
}
if(!window.spaceCR.timer){
    window.spaceCR.timer = new Timer();
}
module.exports = window.spaceCR.timer;