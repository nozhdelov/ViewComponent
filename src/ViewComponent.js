'use strict';

function ViewComponent(){
	this.parent = null;
	this.children = [];
	this.renderTree = null;
	this.parentNode = null;
	this.nodeContent = '';
	this.actions = {};
	
}

ViewComponent.prototype = new EventEmitter();


ViewComponent.prototype.init = function(){
	return true;
};


ViewComponent.prototype.render = function(){
	return true;
};

ViewComponent.prototype.onBeforeRender = function(){
	return true;
};

ViewComponent.prototype.onAfterRender = function(){
	return true;
};


ViewComponent.prototype.getRenderable = function(){
	var tree = this.render();
	var deferred = Q.defer();
	var self = this;
	if(typeof tree === 'object' && tree.then && tree.fail){
		tree.then(function(res){
			deferred.resolve(self.prepare(res));
		});
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
			fragment.appendChild(div.childNodes[i]);
		}
		
		tree = fragment;
	} else if(!tree instanceof HTMLElement) {
		throw new Error('Invalid DOM element');
	}
	
	if(tree.nodeType === 11){
		this.renderTree = Array.prototype.slice.call(tree.childNodes, 0);
	} else {
		this.renderTree = tree;
	}
	

	
	ViewComponent.traverseTree(tree, function(node){
		ViewComponent.scanNode(node, self);
	});
	

	this.emit('beforeRender');
	
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
	var oldThree = this.renderTree.slice();
	var self = this;

	
	this.getRenderable().then(function(tree){
		self.parentNode.insertBefore(tree, insertionNode);
		oldThree.forEach(function(node){
		if(node.parentNode){
			node.parentNode.removeChild(node);
		}
		
		self.emit('render');
	});
		
	});
	
};


ViewComponent.prototype.addChild = function(child){
	this.children.push(child);
};


ViewComponent.prototype.getParent = function(){
	return this.parent;
};


ViewComponent.prototype.findExecutable = function(name){
	var parent;
	if(this.actions[name]){
		return this.actions[name].bind(this);
	}
	parent = this.getParent();
	while(parent){
		if(parent.actions[name]){
			return parent.actions[name].bind(parent);
		}
		parent = parent.getParent();
	}
	
	return false;
};


ViewComponent.prototype.removeFromDOM = function(){
	this.renderTree.forEach(function(node){
		if(node.parentNode){
			node.parentNode.removeChild(node);
		}
	});
	
};


//****************************

ViewComponent.registeredComponents = {};


ViewComponent.register = function(name, object){
	var component = ViewComponent.extend(object);
	ViewComponent.registeredComponents[name.toUpperCase()] = component;
	return component;
};


ViewComponent.extend = function(object, parent){
	var i;
	var F = function(config, parent){
		var i, actionName;
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
				actionName = i.replace('action-', '');
				config[actionName] = this.findExecutable(config[i]);
			}
		}
		
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
	component.getRenderable().then(function(tree){
		node.parentNode.insertBefore(tree, node);
		node.parentNode.removeChild(node);
		component.emit('render');
	});
	
	
	
};