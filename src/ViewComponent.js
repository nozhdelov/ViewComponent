'use strict';

function ViewComponent(){
	this.parent = null;
	this.children = [];
	this.renderTree = null;
	this.actions = {};
	
}


ViewComponent.prototype.init = function(){
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
	var template;
	var self = this;
	if(typeof tree === 'string'){
		template = document.createElement('template');
		template.innerHTML = tree;
		tree = template.content;
	} else if(!tree instanceof HTMLElement) {
		throw new Error('Invalid DOM element');
	}

	
	ViewComponent.traverseTree(tree, function(node){
		ViewComponent.scanNode(node, self);
	});
	
	this.renderTree = tree;
	
	return tree;
};


ViewComponent.prototype.appendTo = function(node){
	this.getRenderable().then(function(res){
		node.appendChild(res);
	}).fail(function(res){
		throw new Error(res);
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


ViewComponent.prototype.destroy = function(){
	console.log(this.renderTree, this.renderTree.parentNode);
	this.renderTree.parentNode.removeChild(this.renderTree);
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
		for(i in object){
			if(object.hasOwnProperty(i)){
				this[i] = object[i];
			}
		}
		
		if(parent){
			parent.addChild(this);
			this.parent = parent;
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
	
	component.getRenderable().then(function(tree){
		node.parentNode.insertBefore(tree, node);
		node.parentNode.removeChild(node);
	});
	
	
	
};