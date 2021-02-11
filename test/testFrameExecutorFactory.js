let frameExecutorFactory = require("../src/FrameExecutorFactory");
let array = [];
for(let i=0;i<100;i++){
    array.push(i);
}
let frameExecutor = frameExecutorFactory.getFrameExecutor(array, function(index){
    console.log('\x1b[37m',"I am one:",index);
},null,{frameTime:0.01});
frameExecutor.execute();

let frameExecutor2 = frameExecutorFactory.getFrameExecutor(array, function(index){
    console.log('\x1b[31m',"I am two:",index);
},null,{frameTime:0.01});
frameExecutor2.execute();