'use strict';

function ViewComponent(){
	this.parent = null;
	this.children = [];
	this.renderTree = null;
	this.parentNode = null;
	this.nodeContent = '';
	this.actions = {};
	this.events = {};
	
};

ViewComponent.prototype = new EventEmitter();


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
	} else if(typeof tree === 'object' && tree.render){
		for(i = 0; i < ViewComponent.registeredComponents.length; i++){
			if(tree instanceof ViewComponent.registeredComponents[i]){
				tree.getRenderable().then(function(res){
					deferred.resolve(self.prepare(res));
				});
			}
		}
		
	} else {
		deferred.resolve(self.prepare(tree));
	}
	
	return deferred.promise;
};


ViewComponent.prototype.prepare = function(tree){
	var div, i, fragment;
	var self = this;
	if(typeof tree === 'string'){
		div = document.createElement('div');
		div.innerHTML = tree;
		fragment = document.createDocumentFragment();
		for(i = 0; i < div.childNodes.length; i++){
			fragment.appendChild(div.childNodes[i].cloneNode(true));
		}
		div.innerHTML = '';
		tree = fragment;
	}  else if(!tree instanceof HTMLElement) {
		throw new Error('Invalid DOM element');
	}
	
	if(tree.nodeType === 11){		
		this.renderTree = Array.prototype.slice.call(tree.childNodes, 0);
	} else {
		this.renderTree = [tree];
	}
	
	

	
	ViewComponent.traverseTree(tree, function(node){
		ViewComponent.scanNode(node, self);
	});
	

	this.emit('parsed');
	
	return tree;
};


ViewComponent.prototype.appendTo = function(node){
	var self = this;
	if(!node instanceof HTMLElement) {
		throw new Error('Invalid DOM element');
	}
	
	this.parentNode = node;
	this.getRenderable().then(function(res){
		node.appendChild(res);
		self.emit('render');
	}).fail(function(res){
		throw new Error(res);
	});
	
	
};


ViewComponent.prototype.rerender = function(){
	var insertionNode = this.renderTree[0];
	var oldThree = this.renderTree;
	var oldChildren = this.children.slice();
	var self = this;
	
	this.children.forEach(function(child){
		child.destroy();
	});
	this.children = [];
	
	this.getRenderable().then(function(tree){
		
		self.parentNode.insertBefore(tree, insertionNode);
		
		
		
		oldThree.forEach(function(node){	
			if(node.parentNode){
				node.parentNode.removeChild(node);
			}
		});
		
		oldChildren.forEach(function(child){
			child.removeFromDOM();
		});
		
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
			self.actions[name].apply(self, args);
		};
	}
	parent = this.getParent();
	while(parent){
		if(parent.actions[name]){
			return function(){
				var args = Array.prototype.slice.call(arguments).concat(params);
				parent.actions[name].apply(parent, args);
			};
		}
		parent = parent.getParent();
	}
	
	return undefined;
};



ViewComponent.prototype.destroy = function(){
	this.on('destroy', function(){
		this.off();
	}.bind(this));
	this.emit('destroy');
	this.children.forEach(function(child){
		child.destroy();
	});
	
//	this.removeFromDOM();
	if(this.parent){
		this.parent.removeChild(this);
	}
	

};



ViewComponent.prototype.removeFromDOM = function(){
	if(typeof this.renderTree === 'object' && this.renderTree && this.renderTree.length){
		this.renderTree.forEach(function(node){
			if(node && node.parentNode){
				node.parentNode.removeChild(node);
			}
		});
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


ViewComponent.prototype.callAction = function(actionName){
	var args = Array.prototype.slice.call(arguments);
	args.shift();
	return this.findExecutable(actionName, args)();
};


ViewComponent.prototype.find = function(selector){
	return ViewComponent.find(selector, this);
};


//****************************

ViewComponent.registeredComponents = {};
ViewComponent.rootComponent = null;


ViewComponent.register = function(name, object){
	var component = ViewComponent.extend(object);
	ViewComponent.registeredComponents[name.toUpperCase()] = component;
	return component;
};


ViewComponent.extend = function(object, parent){
	var i;
	var F = function(config, parent){
		var i, actionInfo;
		for(i in object){
			if(object.hasOwnProperty(i)){
				this[i] = object[i];
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
		}
		
		this.events = {};
		this.init(config);
	};
	
	F.prototype = new ViewComponent();
	
	return F;
};



ViewComponent.traverseTree = function (node, callback) {
	if (node) {
		callback(node);
	}
	node = node.firstChild;
	
	if(!node){
		return;
	}
	

	while (node) {
		ViewComponent.traverseTree(node, callback);
		node = node.nextSibling;
	}

};



ViewComponent.scan = function(node){
	ViewComponent.traverseTree(node, ViewComponent.scanNode);
};


ViewComponent.scanNode = function(node, parent){
	var attName, attValue, i, component, config = {};
	
	if(!ViewComponent.registeredComponents.hasOwnProperty(node.nodeName.toUpperCase())){
		return;
	}
	
	for(i = 0; i < node.attributes.length; i++){
		attValue = node.attributes[i].value;
		attName = node.attributes[i].nodeName;
		config[attName] = attValue;
	}
	
	component = new ViewComponent.registeredComponents[node.nodeName.toUpperCase()](config, parent);
	
	component.nodeContent = node.innerHTML;
	component.parentNode = node.parentNode;
	component.node = node;
	node.innerHTML = '';
	component.getRenderable().then(function(tree){
		component.fulfillParent(tree, node);
		node.parentNode.insertBefore(tree, node);
		node.parentNode.removeChild(node);
		component.emit('render');
	});
	
	
	
};

ViewComponent.prototype.fulfillParent = function(tree, componentNode){
	var i, parts = [];
	if(!this.parent){
		return;
	}

	for(i = 0; i < this.parent.renderTree.length; i++){
		if(componentNode === this.parent.renderTree[i]){
			if(tree.nodeType === 11){
				parts[0] = this.renderTree.slice(0, i);
				parts[1] = Array.prototype.slice(tree.childNodes);
				parts[2] = this.renderTree.slice(i, this.renderTree.length);
				
				
				this.parent.renderTree = parts[0].concat(parts[1]).concat(parts[2]);
			} else {
				this.parent.renderTree[i] = tree;
			}
			
		}
		
	}
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