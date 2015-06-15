'use strict';

function EventEmitter() {
	this.events = {};
}


EventEmitter.prototype.on = function (type, handler) {
	if(typeof handler !== 'function'){
		return false;
	}
	
	if(!this.events){
		this.events = {};
	}
	
	if(this.events[type] === undefined){
		this.events[type] = [];
	}
	this.events[type].push(handler);
};


EventEmitter.prototype.off = function (type, handler) {
	var index;
	if(this.events[type] === undefined){
		return false;
	}
	
	if(!this.events){
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


EventEmitter.prototype.once = function (type, handler) {
	var self = this;
	var func = function(){
		self.off(type, func);
		handler();
	};
	self.on(type, func);
};


EventEmitter.prototype.emit = function (type, data) {
	var i, self = this;
	data = data || {};
	if(this.events[type] === undefined){
		return false;
	}

	for(i = 0; i < this.events[type].length; i++){
		setTimeout((function(index){
			return function(){
				if(self.events[type][index]){
					self.events[type][index](data);
				}
			};
		}(i)), 0);
	}
};

