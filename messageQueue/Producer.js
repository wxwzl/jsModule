
let TaskTimer = require("../TaskTimer");
 /**
  *生产者
  */
 function Producer(){
     /**先用数组表达队列结构，后续看情况建个队列结构,或对象来管理消息存储队列来保证避免并发的问题*/
    this.msgQueue = function(){
        let storage = [];
        return {
            addMsg:function(msg){
                storage.push(msg);
            },
            removeMsg:function(){
                return storage.shift();
            },
            size:function(){
                return storage.length;
            }
        }
    }();
    this.consumers = [];
    /**广播可消费事件的节流时间 */
    this.cacheTimeToPMsg = 1000;//milisecond;
 };
 Producer.prototype={

    /**
     * 用来接收外部的消息源，---通俗的说就是生产者生产消息的原材料
     * @param {*} msg 
     */
    putMsg:function(msg){
        this.msgQueue.addMsg();
        TaskTimer.setTimer(this.cacheTimeToPMsg,function(){
            this.produceMsg();
        },this);
    },
    /**
     * 向消费者广播可消费消息，这里简单直接拿消费者对象通知有消息可消费事件,这个传播消息的方式有很多，
     * 也可以通过http请求，websocket，向后端的RocketMQ，Kafka，RabbitMQ等
     */
    produceMsg:function(){
        this.consumers.forEach(function(consumer){
            consumer.fetchMsg();
        });
    },
    /**
     * 添加消息的消费者
     */
    addConsumer:function(consumer){
        consumer._producer = this;
        this.consumers.push(consumer);
    },
    /**
     * 消费者主动来消费消息接口
     */
    fetchMsg:function(){
        return this.msgQueue.removeMsg();
    } 
 }