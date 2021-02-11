class EventM{
  name:string;
  handlers:Array<any>=[];
  constructor(name:string){
    this.name = name;
  }

  pushHandler(method:(data:any)=>void|boolean, times:number|null){
    var obj = {
      method: method,
      times: times,
    };
    this.handlers.push(obj);
  }

  deleHandler(method:(data:any)=>void|boolean) {
    var handlers = this.handlers;
    var len = handlers.length;
    var handler = null;
    for (var i = 0; i < len; i++) {
      handler = handlers[i];
      if (handler.method === method) {
        return this.handlers.splice(i, 1);
      }
    }
  }

  executeHandlers(data:any) {
    var params = [].slice.call(arguments, 0);
    var handlers = this.handlers;
    var handler = null;
    for (var i = 0; i < handlers.length; i++) {
      handler = handlers[i];
      var clone = JSON.parse(JSON.stringify(params));
      if (isNaN(handler.times) === true) {
        handler.method.apply(window, clone);
      } else {
        if (handler.times > 0) {
          handler.method.apply(window, clone);
          handler.times--;
        }
        if (handler.times <= 0) {
          handlers.splice(i, 1);
          i--;
        }
      }
    }
  }
}


class EventModel{
  _events:Array<EventM>= [];


  on(eventName:string, callBack:(data:any)=>void|boolean, times:number|null) {
    var eventNames = eventName.replace(/\s+/g, " ").split(" ");
    var events = this._events;
    var len = events.length;
    var event = null;
    var i = 0;
    for (; i < len; i++) {
      event = events[i];
      eventName = event.name;
      if (this.hasItem(eventNames, eventName)) {
        if (callBack) {
          event.pushHandler(callBack, times);
        }
        this.removeItem(eventNames, eventName);
      }
    }
    if (eventNames.length > 0) {
      for (i = 0; i < eventNames.length; i++) {
        eventName = eventNames[i];
        event = new EventM(eventName);
        if (callBack) {
          event.pushHandler(callBack, times);
        }
        events.push(event);
      }
    }
    return this;
  }

  trigger(eventName:string, data:any) {
    var events = this._events;
    var len = events.length;
    var event = null;
    for (var i = 0; i < len; i++) {
      event = events[i];
      if (event.name === eventName) {
        event.executeHandlers(data);
        return;
      }
    }
  }
  off(eventName:string, handler:(data:any)=>void|boolean) {
    var events = this._events;
    var len = events.length;
    var event = null;
    var i = 0;
    for (; i < len; i++) {
      event = events[i];
      if (event.name === eventName) {
        if (handler) {
          event.deleHandler(handler);
        } else {
          events.splice(i, 1);
        }
        return event;
      }
    }
    return this;
  }

  hasItem(array:Array<any>, item:any) {
    var len = array.length;
    for (var i = 0; i < len; i++) {
      if (array[i] === item) {
        return true;
      }
    }
    return false;
  }

  removeItem(array:Array<any>, item:any) {
    var len = array.length;
    for (var i = 0; i < len; i++) {
      if (array[i] === item) {
        return array.splice(i, 1);
      }
    }
  }
}
module.exports = EventModel;
