/**
 * 不加注释，时间一久着实忘记当初写的这些api的目的了。。。
 * 类的作用：dom事件的事件代理封装，比如传入body节点，只在body节点绑定监听各种dom事件，
 * 然后利用的事件的冒泡机制，在body节点的回调函数里处理所有body子节点下的各dom事件。
 * 好处是：减少事件注册，节省内存,避免涉及到过多的dom对象，方便管理页面的事件。
 * 当然上面是极端例子，层级太多也不好，建议进行节点的分区和分层设置事件代理委托，并及时阻止事件传播。
 * 
 * @param {*} element 
 */
var DOMEventManager = function (element) {
	this.rootNode = element;
	this.methods = {};
	this.triggerMethods = {};
	EventManager.call(this);
};
DOMEventManager.prototype = {
	/*
		* 当监听blur、focus等事件时，记得阻止冒泡，因为这里事件在捕获阶段执行，如果允许冒泡会导致回调函数执行两次。
		* */
	addHandler: function (type, handler) {
		var element = this.rootNode,
			methods = this.methods;
		if (typeof methods[type] == "undefined") methods[type] = [];
		methods[type][methods[type].length] = handler;
		var capture = null;
		switch (type) {
			case "blur":
				;
			case "focus":
				;
			case "focusin":
				;
			case "focusout":
				capture = true;
				break;
			default:
				capture = false;
		}
		if (element.addEventListener) {
			element.addEventListener(type, methods[type][methods[type].length - 1], capture);
		} else if (element.attachEvent) {
			element.attachEvent("on" + type, methods[type][methods[type].length - 1]);
		} else {
			element["on" + type] = methods[type][methods[type].length - 1];
		}
	},
	removeHandler: function (type, handler) {
		var element = this.rootNode,
			methods = this.methods[type];
		if (handler != undefined) {
			for (var i = 0; i < methods.length; i++) {
				if (methods[i] == handler) {
					removeOneHandler(element, type, methods[i]);
					methods.splice(i, 1);
					if (methods[i] == this.triggerMethods[type])
						delete this.triggerMethods[type];
					return;
				}

			}
		} else {
			for (var i = 0; i < methods.length; i++) {
				removeOneHandler(element, type, methods[i]);
			}
			delete this.triggerMethods[type];
		}

		function removeOneHandler(element, type, handler) {
			if (element.removeEventListener) {
				element.removeEventListener(type, handler, false);
			} else if (element.detachEvent) {
				element.detachEvent(type, handler);
			} else {
				element["on" + type] = null;
			}
		};
	},
	clearAllHandler: function () {
		var methods = this.methods;
		for (var type in methods) {
			this.removeHandler(type);
		}
		this.clearListener();
		this.clearHandler();
	},
	addSubManager: function (name, eventManager, checkOnly) {
		if (eventManager.trigger && eventManager.trigger instanceof Function) {
			if (typeof eventManager.listeners == undefined) return false;
			var listeners = eventManager.listeners,
				me = this;
			for (var type in listeners) {
				if (this.triggerMethods[type] == undefined) {
					this.triggerMethods[type] = function (event) {
						var flag = me.trigger(event);
						if (flag === false) {
							me.preventDefault(event);
							return false;
						};
					};
					this.addHandler(type, this.triggerMethods[type]);
				}
			}
			if (checkOnly) {
				var len = this.subManagers.length;
				for (var i = 0; i < len; i++) {
					if (this.subManagers[i].name == name) {
						return false;
					}
				}
			}
			this.subManagers.push({
				"name": name,
				"key": eventManager
			});
		} else {
			return false;
		}
		return true;
	},
	/**
	 * 
	 * @param {*} types 监听的事件类型
	 * @param {*} selector 要监听的节点，类似css选择器的语法
	 * @param {*} method 事件触发时的回调函数
	 * @param {*} times 监听的次数
	 */
	addListener: function (types, selector, method, times) {
		types = types.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, '').split(/\s+/);
		for (var i = 0, type; i < types.length; i++) {
			type = types[i];
			if (typeof this.listeners[type] == "undefined") {
				this.listeners[type] = [];
				if (this.triggerMethods[type] == undefined) {
					var me = this;
					this.triggerMethods[type] = function (event) {
						var flag = me.trigger(event);
						if (flag === false) {
							me.preventDefault(event);
							return false;
						};
					};
					this.addHandler(type, this.triggerMethods[type]);
				}
			}
			if (selector != undefined && method instanceof Function) {
				var array = [];
				if (arguments.length > 4) {
					array = array.slice.call(arguments, 4);
				}
				var listeners = this.listeners[type];
				var len = listeners.length,
					selectorFlag = true;
				for (var i = 0; i < len; i++) {
					if (listeners[i].selector === selector) {
						selectorFlag = false;
						var j = 0,
							handlerFlag = true;
						var handlers = listeners[i].handlers;
						for (; j < handlers.length; j++) {
							if (handlers[j].method === method && handlers[j].param === array) {
								handlerFlag = false;
								break;
							}
						}
						if (handlerFlag) {
							handlers.push({
								"method": method,
								"param": array,
								"times": times
							});
						}
						break;
					}
				}
				if (selectorFlag) {
					this.listeners[type].push({
						"selector": selector,
						"handlers": [{
							"method": method,
							"param": array,
							"times": times
						}]
					});
				}
			}
		}
		return this;
	},
	preventDefault: function (event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnvalue = false;
		};
	},
	destroy: function (event) {
		this.clearAllHandler();
		this.rootNode.parentNode.removeChild(this.rootNode);
	}
};
EventManager.prototype.getPrototype(DOMEventManager, EventManager);