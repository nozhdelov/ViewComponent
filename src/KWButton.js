'use strict';

ViewComponent.KWButton = ViewComponent.register('KWButton', {
	
	value : 'button',
	action : function(){},
	disable : false,
	timeout : 1000,
	
	init : function(config){
		var action;
		if(config.value){
			this.value = config.value;
		}
		

		if(config.disable){
			this.disable = !!config.disable;
		}
		
		if(config.timeout){
			this.timeout = +config.timeout;
		}
		
		if(config.action){
			if(typeof config.action === 'function'){
				this.action = config.action;
			} else {
				action = this.findExecutable(config.action);
				if(action){
					this.action = action;
				}
			}
			
		}
	},
	
	render : function(){
		var btn = document.createElement('input');
		var self = this;
		btn.type = 'button';
		btn.value = this.value;
		btn.addEventListener('click', function(){
			self.action();
			if(self.disable){
				btn.disabled = 'disabled';
				setTimeout(function(){
					btn.disabled = false;
				}, self.timeout);
			}
			
		}, false);
		
		
		return btn;
		
	},
	
	onAfterRender : function(){
		
		document.getElementById('kur').addEventListener('click', function(){
			alert('dsfdsfdsfd');
		});
	}
	
	
});