
'use strict';


function ViewComponent(){
	
	
};

ViewComponent.prototype.on = function (type, handler) {
	if(typeof handler !== 'function'){
		return false;
	}
	
	if(!this.hasOwnProperty('events')){
		this.events = {};
	}
	
	if(this.events[type] === undefined){
		this.events[type] = [];
	}
	this.events[type].push(handler);
};


ViewComponent.prototype.off = function (type, handler) {
	var index;
	
	if(type === undefined && handler === undefined){
		this.events = {};
	}
	
	if(this.events[type] === undefined){
		return false;
	}
	
	if(!this.hasOwnProperty('events')){
		this.events = {};
	}

	if(handler !== undefined){
		index = this.events[type].indexOf(handler);
		if(index < 0){
			return false;
		}
		this.events[type].splice(index, 1);
	} else {
		this.events[type].length = 0;
	}
	
};




ViewComponent.prototype.emit = function (type, data) {
	var i, self = this;
	data = data || {};
	var self = this;
	
	if(this.events[type] !== undefined){
		for(i = 0; i < this.events[type].length; i++){
			setTimeout((function(index){
				return function(){
					if(self.events[type] && self.events[type][index]){
						self.events[type][index](data);
					}
				};
			}(i)), 0);
		}
	}	
	
};


ViewComponent.prototype.init = function(){
	return true;
};


ViewComponent.prototype.render = function(){
	return this.nodeContent;
};




ViewComponent.prototype.getRenderable = function(){ 
	var tree = this.render();
	var deferred = Q.defer();
	var self = this, i;
	if(typeof tree === 'object' && tree.then && tree.fail){
		tree.then(function(res){
			deferred.resolve(self.prepare(res));
		});
	} else if(typeof tree === 'object' && tree.render && tree.componentName){
		if(this.node){
			tree.appendTo(this.node);
			tree.parent = this;
			this.addChild(tree);
			deferred.resolve(self.prepare(''));
		}
	} else {
		deferred.resolve(self.prepare(tree));
	}
	
	return deferred.promise;
};


ViewComponent.prototype.prepare = function(tree){
	var div, i, fragment;
	var self = this;
	this.renderTree = tree;
	ViewComponent.executePluginCallbacks('componentRender', this);
	
	if(typeof this.renderTree === 'string'){
		div = document.createElement('div');
		div.innerHTML = this.renderTree;
		fragment = document.createDocumentFragment();
		for(i = 0; i < div.childNodes.length; i++){
			fragment.appendChild(div.childNodes[i].cloneNode(true));
		}
		div.innerHTML = '';
		this.renderTree = fragment;
	} else if(this.renderTree instanceof HTMLCollection){
		fragment = document.createDocumentFragment();
		while(this.renderTree.length){
			fragment.appendChild(this.renderTree[0]);
		}
		this.renderTree = fragment;
		
	} else if(!tree instanceof HTMLElement) {
		throw new Error('Invalid DOM element');
	}
	
	
	
	ViewComponent.executePluginCallbacks('componentStartScan', this);
	
	
	ViewComponent.traverseTree(this.renderTree, function(node){
		ViewComponent.scanNode(node, self);
	});
	
	
	
	
	ViewComponent.executePluginCallbacks('componentEndScan', this);
	

	this.emit('parsed');
	
	return this.renderTree;
};


ViewComponent.prototype.appendTo = function(node){
	var self = this;
	if(!node instanceof HTMLElement) {
		throw new Error('Invalid DOM element');
	}
	
	this.parentNode = node;
	var componentNode = document.createElement(self.componentName);
	this.node = componentNode;
	this.node._component = this;
	this.getRenderable().then(function(res){
		componentNode.appendChild(res);
		node.appendChild(componentNode);
		self.emit('render');
	}).fail(function(res){
		throw new Error(res);
	});
	
	
};


ViewComponent.prototype.rerender = function(){
	var oldThree = this.renderTree;
	var oldChildren = this.children.slice();
	var self = this;

	this.children.forEach(function(child){
		child.destroy();
	});
	this.children = [];
	this.getRenderable().then(function(tree){
		if(self.node){
			self.node.innerHTML = '';
		}
		self.node.appendChild(tree);
		/*
		oldThree.forEach(function(node){	
			if(node.parentNode){
				node.parentNode.removeChild(node);
			}
		});
		
		oldChildren.forEach(function(child){
			child.removeFromDOM();
		});*/
		
		self.emit('render');	
	});
	
};


ViewComponent.prototype.addChild = function(child){
	this.children.push(child);
};

ViewComponent.prototype.removeChild = function(child){
	var index = this.children.indexOf(child);
	if(index >= 0){
		this.children.splice(index, 1);
	}
	
};

ViewComponent.prototype.getParent = function(){
	return this.parent;
};


ViewComponent.prototype.findExecutable = function(name, params){
	var parent, self = this;
	if(this.actions[name]){
		return function(){
			var args = Array.prototype.slice.call(arguments).concat(params);
			return self.actions[name].apply(self, args);
		};
	}
	
	
	parent = this.ancestor;
	while(parent){
		if(parent.actions[name]){
			return function(){
				var args = Array.prototype.slice.call(arguments).concat(params);
				return parent.actions[name].apply(parent, args);
			};
		}
		parent = parent.ancestor;
	}
	
	parent = this.getParent();
	while(parent){
		if(parent.actions[name]){
			return function(){
				var args = Array.prototype.slice.call(arguments).concat(params);
				return parent.actions[name].apply(parent, args);
			};
		}
		parent = parent.getParent();
	}
	
	return undefined;
};



ViewComponent.prototype.destroy = function(){
	
	this.on('destroy', function(){
		this.off();
		if(this.parent){
			this.parent.removeChild(this);
		}
	}.bind(this));
	this.state.clearHandlers();
	this.emit('destroy');
	this.children.forEach(function(child){
		child.destroy();
	});
	
//	this.removeFromDOM();
	
	

};

ViewComponent.prototype.removeFromDOM = function(){
	if(this.node && this.node.parentNode){
		this.node.parentNode.removeChild(this.node);
	}
};




ViewComponent.prototype.parseActionAttribute = function(actionName, action){
	var paramsDelimiter, params = [], executable;
	actionName = actionName.replace('action-', '');
	action = action.split('|');
	if(action.length > 1){
		params = action[1].split(",").map(function(elem){
			return elem.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		});
	}
	
	executable = this.findExecutable(action[0], params);
	
	return {name : actionName, executable : executable};
};


ViewComponent.prototype.parseStateAttribute = function(actionName, action){
	var executableInfo;
	actionName = actionName.replace('state-', '');
	executableInfo = this.parseActionAttribute(actionName, action);
	
	this.state.subscribe(actionName, executableInfo.executable);
	return executableInfo;
};


ViewComponent.prototype.callAction = function(actionName){
	var args = Array.prototype.slice.call(arguments);
	args.shift();
	return this.findExecutable(actionName, args)();
};


ViewComponent.prototype.callSuper = function(actionName){
	var args = Array.prototype.slice.call(arguments);
	args.shift();
	
	if(this.ancestor && typeof this.ancestor[actionName] === 'function'){
		return this.ancestor[actionName].apply(this, args);
	}
};



ViewComponent.prototype.find = function(selector){
	return ViewComponent.find(selector, this);
};


ViewComponent.prototype.addAction = function(name, func){
	this.actions[name] = func;
	return this;
};


ViewComponent.prototype.removeAction = function(name){
	delete this.actions[name];
	return this;
};






// ***** ViewComponent.State *****

ViewComponent.State = function(component){
	this.state = {};
	this.subscribers = {};
	this.stateHandlers = {};
	this.component = component;
};

ViewComponent.State.prototype.getStateRoot = function(){
	var rootComponent = this.component;
	while(rootComponent.parent){
		rootComponent = rootComponent.parent;
	}
	return rootComponent.state;
};

ViewComponent.State.prototype.set = function(name, value){
	var root, tmp, i, oldVal, nameParts;
	name = name.toUpperCase();
	nameParts = name.split('.');
	root = this.getStateRoot();
        
        value = this.parseObjectValue(value);

	tmp = root.state;
	for(i = 0; i < nameParts.length; i++){
		if(tmp[nameParts[i]] === undefined && i < nameParts.length - 1){
			tmp[nameParts[i]] = {};
		} 
		
		if(i < nameParts.length - 1){
			tmp = tmp[nameParts[i]];
		} else {
			oldVal = tmp[nameParts[i]];
			tmp[nameParts[i]] = value;
		}
	}
	
	root.publish(name, value, oldVal);
};


ViewComponent.State.prototype.parseObjectValue = function (val) {
    if (typeof val === 'object') {
        let res = {};
        Object.keys(val).forEach(key => {
            res[key.toUpperCase()] =  this.parseObjectValue(val[key]);
        });
	return res;
        
    } else {
        return val;
    }
};


ViewComponent.State.prototype.get = function(name, defaultVal){
	var root, tmp, i, nameParts;
	root = this.getStateRoot();
	
	if(name === undefined){
		return root.state;
	}
	name = name.toUpperCase();
	
	nameParts = name.split('.');
	tmp = root.state;
	for(i = 0; i < nameParts.length; i++){
		if(tmp[nameParts[i]] === undefined && i < nameParts.length - 1){
			return defaultVal;
		} 
		
		if(i < nameParts.length - 1){
			tmp = tmp[nameParts[i]];
		} else {
			return tmp[nameParts[i]];
		}
	}
	
	return defaultVal;
};

ViewComponent.State.prototype.subscribe = function(name, handler){
	var root = this.getStateRoot();
	name = name.toUpperCase();
	if(typeof handler !== 'function'){
		return false;
	}
	
	if(root.subscribers[name] === undefined){
		root.subscribers[name] = [];
	}
	
	if(this.stateHandlers[name] === undefined){
		this.stateHandlers[name] = [];
	}
	
	
	root.subscribers[name].push(this);
	this.stateHandlers[name].push(handler);
};



ViewComponent.State.prototype.executeHandlers = function(name, newValue, oldValue){
	var i, self = this;
	if(this.stateHandlers[name] === undefined){
		return false;
	}
	for(i = 0; i < this.stateHandlers[name].length; i++){
		setTimeout((function(index){
			return function(){
				if(self.stateHandlers[name] && self.stateHandlers[name][index]){
					self.stateHandlers[name][index](newValue, oldValue);
				}
			};
		}(i)), 0);
	}
};


ViewComponent.State.prototype.clearHandlers = function(){
	this.stateHandlers = {};
	this.getStateRoot().removeSubscriber(this);
};

ViewComponent.State.prototype.removeSubscriber = function(subscriber){
	var index, i;
	for(i in this.subscribers){
		if(!this.subscribers.hasOwnProperty(i)){
			continue;
		}
		index = this.subscribers[i].indexOf(subscriber);
		if(index >= 0){
			this.subscribers[i].splice(index, 1);
		}
	}
	
};

ViewComponent.State.prototype.publish = function(name, newValue, oldValue){
	var i, self = this;
	var self = this;
	
	if(this.subscribers[name] === undefined){
		return;
	}

	for(i = 0; i < this.subscribers[name].length; i++){
		this.subscribers[name][i].executeHandlers(name, newValue, oldValue);
	}
};


//****************************

ViewComponent.registeredComponents = {};
ViewComponent.plugins = {};
ViewComponent.rootComponent = null;


ViewComponent.register = function(name, object, ancestor){
	var component = ViewComponent.extend(object, name, ancestor);
	ViewComponent.registeredComponents[name.toUpperCase()] = component;
	return component;
};


ViewComponent.extend = function(object, name, ancestor){
	var i;
	var ancestorInstance = typeof ancestor === 'function' ? new ancestor(object) : null;
	var F = function(config, parent, node){
		var i, j, actionInfo;
		config = config || {};
		
		this.actions = {};
		if(ancestorInstance){
			for(i in ancestorInstance){
				if(!ancestorInstance.hasOwnProperty(i)){
					continue;
				}
				if(i === 'actions' ){
					for(j in ancestorInstance.actions){
						this.actions[j] = ancestorInstance.actions[j];
					}
					
				} else {
					this[i] = ancestorInstance[i];
				}
			}
		}
		
		this.state = new ViewComponent.State(this);
		this.ancestor = ancestorInstance;
		this.parent = null;
		this.children = [];
		this.renderTree = null;
		this.parentNode = null;
		this.nodeContent = '';
		
		this.events = {};
		this.componentName = name;
		
		if(typeof this.actions !== 'object'){
			this.actions = {};
		}
		
		
		if(node){
			this.nodeContent = node.innerHTML;
			this.parentNode = node.parentNode;
			this.node = node;
		}
		
		ViewComponent.executePluginCallbacks('componentCreate', this);
		
		
		
		
		for(i in object){
			if(object.hasOwnProperty(i)){
				if(i === 'actions' ){
					for(j in object.actions){
						this.actions[j] = object.actions[j];
					}
					
				} else {
					this[i] = object[i];
				}
				
			}
		}
		
		
		if(parent){
			parent.addChild(this);
			this.parent = parent;
		}
		
		for(i in config){
			if(config.hasOwnProperty(i) && i.indexOf('action-') >= 0){
				actionInfo = this.parseActionAttribute(i, config[i]);
				config[actionInfo.name] = actionInfo.executable;
			}
			if(config.hasOwnProperty(i) && i.indexOf('state-') >= 0){
				this.parseStateAttribute(i, config[i]);
			}
		}
		
		if(typeof this.init === 'function'){
			this.init(config);
		}
		
		
		
	};
	
	
	
	F.prototype = typeof ancestor === 'function' ? ancestor.prototype : new ViewComponent();
	ViewComponent.executePluginCallbacks('componentRegister', name);
	return F;
};



ViewComponent.traverseTree = function (node, callback) {
	if (node && !ViewComponent.nodeHasAttribute(node, 'vc-literal')) {
		callback(node);
	}
	node = node.firstChild;
	
	if(!node){
		return;
	}
	

	while (node) {
		if(!ViewComponent.nodeHasAttribute(node, 'vc-literal')){
			ViewComponent.traverseTree(node, callback);
		}
		
		node = node.nextSibling;
	}

};



ViewComponent.scan = function(node){
	ViewComponent.traverseTree(node, ViewComponent.scanNode);
};


ViewComponent.scanNode = function(node, parent){
	var attName, attValue, i, config = {}, createFromAttribute = false;
	
	if(node.attributes !== undefined && node.attributes !== null){
		for(i = 0; i < node.attributes.length; i++){
			attValue = node.attributes[i].value;
			attName = node.attributes[i].nodeName;
			config[attName] = attValue;
			if(ViewComponent.registeredComponents.hasOwnProperty(attName.toUpperCase())){
				createFromAttribute = attName;	
			}
			
		}
		if(createFromAttribute !== false){
			ViewComponent.createComponent(createFromAttribute, config, parent, node);
		}
	}
	
	if(ViewComponent.registeredComponents.hasOwnProperty(node.nodeName.toUpperCase())){
		ViewComponent.createComponent(node.nodeName, config, parent, node);
	}
	
	ViewComponent.executePluginCallbacks('scanNode', node);
	
};


ViewComponent.nodeHasAttribute = function(node, attribute){
	if(node.hasAttribute){
		return node.hasAttribute(attribute);
	}
	return false;
};


ViewComponent.createComponent = function(componentName, config, parent, node, attName){

	var component = new ViewComponent.registeredComponents[componentName.toUpperCase()](config, parent, node);
	component.node._component = component;
	node.innerHTML = '';
	component.getRenderable().then(function(tree){
		node.innerHTML = '';
		node.appendChild(tree, node);
		component.emit('render');
	});
	
	
};


ViewComponent.traverseComponentTree = function(node, callback){
	var i;
	if(!node){
		return;
	}
	callback(node);
	for(i = 0; i < node.children.length; i++){
		ViewComponent.traverseComponentTree(node.children[i], callback);
	}
};





ViewComponent.find = function(selector, root){
	var results = [];
	if(root === undefined){
		root = ViewComponent.rootComponent;
	}
	ViewComponent.traverseComponentTree(root, function(node){
		if(ViewComponent.selectorMatches(selector, node)){
			results.push(node);
		}
	});
	
	return results;
};


ViewComponent.selectorMatches = function(selector, node){
	var parts, i, matched;
	var selectors = selector.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').split(' ');
	
	for(i = 0; i < selectors.length; i++){
		selectors[i] = selectors[i].replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		parts = selectors[i].split('=');
		matched = false;

		if(parts.length > 1){
			matched = node[parts[0]] !== undefined && node[parts[0]] === parts[1].toString();
		} else {
			matched = node instanceof ViewComponent.registeredComponents[parts[0].toUpperCase()]; 
		}
		
		if(!matched){
			return false;
		}
		
	}
	
	return true;
	
};



ViewComponent.registerPlugin = function(name, plugin){
	if(typeof name !== 'string' || name === ''){
		throw new Error('invalid pludin name');
	}
	if(typeof plugin !== 'object'){
		throw new Error('invalid pludin');
	}
	ViewComponent.plugins[name] = plugin;
	ViewComponent.executePluginCallbacks('init');
};


ViewComponent.executePluginCallbacks = function(type, obj){
	var i;
	
	for(i in ViewComponent.plugins){
		if(!ViewComponent.plugins.hasOwnProperty(i)){
			continue;
		}
		if(typeof ViewComponent.plugins[i][type] === 'function'){
			ViewComponent.plugins[i][type](obj);
		}
	}
};
