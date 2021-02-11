function EventManager(object) {
	if (object != undefined) {
		var clone = new Object(EventManager.prototype);
		for (var o in clone) {
			if (o == "constructor") continue;
			object[o] = clone[o];
		};
		return object;
	}
	this.listeners = {};
	this.subManagers = [];
	this.Behind = false;
	/*
	 * 自定义事件的处理函数。
	 * */
	this.handlers = {};
};
EventManager.prototype = {
	constructor: eventManager,
	getEvent: function (event) {
		return event ? event : window.event;
	},
	getTarget: function (event) {
		return event.target ? event.target : event.srcElement;
	},
	getEventProperty: function (event, propertyName) {
		event = this.getEvent(event);
		if (event[propertyName]) {
			return event[propertyName];
		} else {
			try {
				return event.originalEvent[propertyName];
			} catch (err) {
				return null;
			}
		}
	},
	trim: function (str) {
		return str.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, '');
	},
	isArray: function (o) {
		return (o == undefined || !(o instanceof Array)) ? false : true;
	},
	//selector:遵循css选择符，target为dom节点。
	compareTarget: function (selector, target) {
		var i, n;
		if (typeof selector == "object" && !(selector instanceof Array) &&
			!(selector instanceof String)) {
			if (target === selector) {
				return true;
			}
			return false;
		}
		if (this.isArray(selector)) {
			for (i = 0; i < selector.length; i++) {
				if (this.compareTarget(selector[i]), target) {
					return true;
				}
			}
			return false;
		}
		if (typeof selector == "string" || selector instanceof String) {
			/*
			 * 逗号分隔多个选择符。
			 * */
			var elems = selector.split(",");
			for (n = 0; n < elems.length; n++) {
				if (compareOneSelector.call(this, elems[n], target)) {
					return true;
				}
			}
			return false;
		};
		/*
		 * 匹配一个完整的选择符。（不含逗号）
		 * */
		function compareOneSelector(selector, target) {
			var i;
			var spaceReg = /\s+/g;
			var nodes = selector.split(spaceReg);
			var currentNode = compareChild.call(this, nodes[nodes.length - 1], target);
			if (typeof currentNode == "object") {
				currentNode = currentNode.parentNode;
				if (nodes.length > 1) {
					for (i = nodes.length - 2; i >= 0; i--) {
						currentNode = compareSun.call(this, nodes[i], currentNode);
						if (currentNode == false) return false;
					}
				}
				return true;
			} else return false;
		};
		/*查找target元素是不是selector选择符匹配元素的后代，查找到html标签。
		 * selector:css选择符：只含有>,.className,#id,[name='value'],标签名不含子孙选择符；
		 * target开始查找的起点节点对象
		 * @return 找到target的符合选择符的祖先节点，返回该祖先节点，没找到，返回false;
		 * */
		function compareSun(selector, target) {
			var isEnd = false,
				flag = false;
			flag = compareChild.call(this, selector, target);
			while (flag == false && isEnd == false) {
				target = target.parentNode;
				flag = compareChild.call(this, selector, target);
				if (target.tagName.toLowerCase() == "html") isEnd = true;
			}
			if (flag == false) return false;
			return target;
		};
		/*selector:css选择符：只含有>,.className,#id,[name='value'],标签名不含子孙选择符；
		 * target：开始查找的起点节点对象
		 * @return 找到target的符合选择符的祖先节点，返回该祖先节点，没找到，返回false;
		 * */
		function compareChild(selector, target) {
			var childReg = />/g,
				parentNode, j;
			var childs = selector.split(childReg);
			parentNode = target;
			if (compare.call(this, childs[childs.length - 1], parentNode)) {
				if (childs.length > 1) {
					for (j = childs.length - 2; j >= 0; j--) {
						parentNode = parentNode.parentNode;
						if (!compare.call(this, childs[j], parentNode)) {
							return false;
						}
					}
					return parentNode;
				} else return parentNode;
			} else return false;
		};
		/*selector:css选择符：只含有.className,#id,[name='value'],标签名,不含子孙和后代选择符；
		 * target要匹配的dom节点对象
		 * 匹配到，返回true，反之，返回false；
		 * */
		function compare(selector, target) {
			var i;
			var idReg = /(#[A-Za-z0-9_-]+)/g,
				classReg = /(\.[A-Za-z0-9_-]+)/g,
				attrReg = /(\[[A-Za-z0-9_-]+(='[A-Za-z0-9_-]+')?\])/g;

			var idArray = selector.match(idReg);
			if (idArray) {
				if (idArray[0].substr(1) !== target.id) {
					return false;
				}
			}
			var classArray = selector.match(classReg);
			if (classArray) {
				var className = target.getAttribute("class"); //不用target.className因为svg标签得到的是一个对象
				if (!className) return false;
				var classes = this.trim(className).replace(/\s+/g, " ").split(" ");
				if (classes.length < 1) return false;
				var index = -1;
				for (i = 0; i < classArray.length; i++) {
					index = (function (array, elem) {
						for (var j = 0; j < array.length; j++) {
							if (array[j] === elem) {
								return j;
							}
						};
						return -1;
					})(classes, classArray[i].substr(1));
					if (index < 0) return false;
				};
			}
			var attrArray = selector.match(attrReg);
			if (attrArray) {
				var attr, attribute;
				for (i = 0; i < attrArray.length; i++) {
					attr = attrArray[i].split("=");
					if (attr.length == 1) {
						attribute = target.getAttribute(attr[0].substr(1, attr[0].length - 2));
						if (attribute == undefined || attribute == "") return false;
					} else if (target.getAttribute(attr[0].substr(1)) != (attr[1].substr(1, attr[1].length - 3)))
						return false;
				}
			}
			var TagStr = selector.replace(attrReg, "").replace(classReg, "").replace(idReg, "");
			if (TagStr != "") {
				if (target.tagName.toLowerCase() != TagStr.toLowerCase()) return false;
			}
			return true;
		};
	},
	addSubManager: function (name, eventManager) {
		if (eventManager.trigger && eventManager.trigger instanceof Function) {
			for (var i = 0; i < this.subManagers.length; i++) {
				if (this.subManagers[i].name == name) {
					return false;
				}
			}
			this.subManagers.push({
				"name": name,
				"key": eventManager
			});
		}
		return this;
	},
	getSubManager: function (name) {
		for (var i = 0; i < this.subManagers.length; i++) {
			if (this.subManagers[i].name == name) {
				return this.subManagers[i].key;
			}
		}
	},
	/*
	 * 返回所移除的监听器
	 * */
	removeSubManager: function (name) {
		for (var i = 0; i < this.subManagers.length; i++) {
			if (this.subManagers[i].name == name) {
				return this.subManagers.splice(i, 1);
			}
		}
	},
	addListener: function (types, selector, method, times) {
		types = types.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, '');
		types = this.trim(types).split(/\s+/);
		for (var i = 0, type; i < types.length; i++) {
			type = types[i];
			if (typeof this.listeners[type] == "undefined") {
				this.listeners[type] = [];
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
	trigger: function (event) {
		if (arguments.length >= 2 || typeof event == "string" || event instanceof String) {
			this.dispatchEvent.apply(this, arguments);
			return false;
		} else {
			event = this.getEvent(event);
		}
		var target = this.getTarget(event);
		var type = event.type,
			nodeName = target.nodeName.toLowerCase(),
			nodeType = target.nodeType;
		if (nodeType === 3 || nodeType === 8 ||
			(type == "click" && (nodeName == "input" || nodeName == "select"))) {
			return;
		}
		var i, j, flag, catched = false,
			param;
		this.Behind = false;
		var paramArray = [];
		if (arguments.length > 1) {
			paramArray.slice.call(arguments, 1);
		}
		for (var i = 0; i < this.subManagers.length; i++) {
			var allParam = [event].concat(paramArray);
			flag = true;
			flag = this.subManagers[i].key.trigger.apply(this.subManagers[i].key, allParam);
			if (flag === false) {
				return false;
			}
		}
		if (this.isArray(this.listeners[type])) {
			var listeners = this.listeners[type];
			var len = listeners.length;
			for (i = 0; i < len; i++) {
				if (this.compareTarget(listeners[i].selector, target)) {
					catched = true;
					var handlers = listeners[i].handlers;
					for (j = 0; j < handlers.length; j++) {
						flag = true;
						if (paramArray.legnth > 0) {
							param = paramArray.push(event);
						} else {
							param = handlers[j].param.concat([event]);
						}
						param.push(event);
						flag = handlers[j].method.apply(this, param);
						if (!isNaN(Number(handlers[j].times))) {
							handlers[j].times--;
							if (handlers[j].times == 0) {
								handlers.splice(j, 1);
								j--;
							}
						}
						if (flag === false) return false;
					};
				}
			}
		}
		this.fire("eventHandleComplete", event);
		if (catched && this.Behind) return false;
	},
	removeListener: function (types, selector, handler) {
		types = this.trim(types).split(/\s+/);
		for (var i = 0, type; i < types.length; i++) {
			type = types[i];
			if (this.isArray(this.listeners[type])) {
				var listeners = this.listeners[type];
				if (selector === undefined) {
					listeners = null;
				} else {
					if (handler === undefined) {
						for (var i = 0; i < listeners.length; i++) {
							if (listeners[i].selector == selector) {
								break;
							}
						}
						listeners.splice(i, 1);
					} else {
						for (var i = 0; i < listeners.length; i++) {
							if (listeners[i].selector == selector) {
								var handlers = listeners[i].handlers;
								for (var j = 0; j < handlers.length; j++) {
									if (handlers[j].method === handler) {
										break;
									}
								}
								handlers.splice(j, 1);
								break;
							}
						}
					}
				}
			}
		}
		return this;
	},
	clearListener: function () {
		this.listeners = {};
		this.subManagers = [];
	},
	clearHandler: function () {
		this.handlers = [];
	},
	//true,将阻止其父事件管理器中的排在该管理器之后的子管理器的事件触发。false,反之
	stopBehind: function (flag) {
		this.Behind = flag;
	},
	stopPropagation: function (event) {
		if (event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		};
	},
	/**
	 * 
	 * 添加自定义事件的处理函数
	 * */
	on: function (type, handler, times) {
		var param = [];
		if (arguments.length > 3) {
			param = param.slice.call(arguments, 3);
		}
		var types = type.split(",");
		var size = types.length,
			e = null;
		for (var i = 0; i < size; i++) {
			e = this.trim(types[i]);
			if (this.handlers[e] == undefined) {
				this.handlers[e] = [];
			}
			this.handlers[e].push({
				"method": handler,
				"param": param,
				"time": times
			});
		}
		return this;
	},
	/**
	 * 
	 * 删除自定义事件的处理函数
	 * */
	off: function (type, handler) {
		if (handler != undefined) {
			var handlers = this.handlers[type],
				i;
			for (i = 0; i < handlers.length; i++) {
				if (handlers[i].method == handler) {
					handlers.splice(i, 1);
					return this;
				}
			}
		} else {
			delete this.handlers[type];
		}
		return this;
	},
	/**
	 * 
	 * 触发某类型的事件。
	 * */
	fire: function (type) {
		var handlers = this.handlers[type],
			i, handler = null;
		var param = [];
		if (arguments.length > 1) {
			param = param.slice.call(arguments, 1);
		}
		if (handlers != undefined) {
			for (i = 0; i < handlers.length; i++) {
				handler = handlers[i];
				if (param.length == 0) {
					param = handler.param;
				}
				var returnValue = handler.method.apply(this, param);
				if (handler.time != undefined) {
					handler.time--;
					if (handler.time == 0) {
						handlers.splice(i, 1);
						i--;
					}
				}
				if (returnValue === false) {
					return false;
				}
			}
		}
	},

	/*
	 * 原生javascript分派事件给元素。
	 * */
	dispatchEvent: function (type, elem) {
		var params = [];
		if (arguments.length == 1) {
			params = [type, this.rootNode];
			dispatch.apply(this, params);
		} else {
			dispatch.apply(this, arguments);
		}

		function dispatch(type, elem) {
			if (document.all) {
				if (typeof type == "object") {
					elem.fireEvent(type);
				} else {
					elem.fireEvent("on" + type);
				}
			} else {
				var evt = null;
				if (typeof type == "object") {
					evt = type;
				} else {
					evt = document.createEvent("Events");
					evt.initEvent(type, true, true);
				}
				if (arguments > 2) {
					evt.data = [].slice.call(arguments, 2);
				}
				elem.dispatchEvent(evt);
			}
		}
	},
	getPrototype: function (SubType, SuperType) {
		var SuperP = SuperType.prototype;
		var SubTypeP = SubType.prototype;
		var prototype = Object(SuperP);
		for (var o in prototype) {
			if (o == "constructor" || SubTypeP[o] != undefined) continue;
			SubTypeP[o] = prototype[o];
		};
		return SubTypeP;
	}

};