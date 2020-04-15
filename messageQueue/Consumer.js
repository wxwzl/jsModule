/**
 * 消费者
 */
function Consumer(){
    this._producer;
    this._isIdle = true;
    this._consumeMethod = [];
};
Consumer.prototype={
    fetchMsg:function(){
        if(this._isIdle&&this._producer){
            this._isIdle = false;
            this._consumeMsg();
        }
    },
    _consumeMsg:function(){
        if(this._producer){
            let msg = this._producer.fetchMsg();
            if(msg){
                this.consumers.forEach(function(method){
                    method.call(this,msg);
                });
                return this.consumeMsg();
            }
        }
        this._isIdle = true;
    },
    addConsumeMethod:function(method){
        this._consumeMethod.push(method);
    }
};
