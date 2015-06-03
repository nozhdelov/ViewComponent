'use strict';

function ViewComponent(){
	
	
}


ViewComponent.prototype.getRenderable = function(){
	
};


ViewComponent.prototype.appendTo = function(node){
	var tree = this.render();
	var template;
	if(typeof tree === 'string'){
		template = document.createElement('template');
		template.innerHTML = html;
		tree = template.content;
	}
	
	
	
};


ViewComponent.registeredComponents = [];

ViewComponent.extend = function(object){
	var F = function(){
		for(i in object){
			if(object.hasOwnProperty(i)){
				this[i] = object[i];
			}
		}
	};
	var i;
	
	F.prototype = new ViewComponent();
	
	
	
	
	return F;
};