'use strict';

function EventEmitter() {
	this.events = {};
}


EventEmitter.EVENT_TYPE_ALL = '__*__';


EventEmitter.prototype.on = function (type, handler) {
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


EventEmitter.prototype.off = function (type, handler) {
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
	var self = this;
	
	if(this.events[type] !== undefined){
		for(i = 0; i < this.events[type].length; i++){
			setTimeout((function(index){
				return function(){
					if(self.events[type][index]){
						self.events[type][index](data);
					}
				};
			}(i)), 0);
		}
	}	

	
	if(this.events[EventEmitter.EVENT_TYPE_ALL] !== undefined){
		for(i = 0; i < this.events[EventEmitter.EVENT_TYPE_ALL].length; i++){
			setTimeout((function(index){
				return function(){
					if(self.events[EventEmitter.EVENT_TYPE_ALL][index]){
						self.events[EventEmitter.EVENT_TYPE_ALL][index](data, type);
					}
				};
			}(i)), 0);
		}
	}
	
	
};


EventEmitter.prototype.listen = function (handler) {
	return this.on(EventEmitter.EVENT_TYPE_ALL, handler);
};

