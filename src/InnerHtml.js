'use strict';

ViewComponent.InnerHtml = ViewComponent.register('InnerHtml', {
	
	init : function(){
		var self = this;
		this.on('render', function(){
			someSelector().on('click', function(){
				loadSomeStuff().then(function(res){
					self.nodeContent = res;
					self.rerender();
					someEffect();
				});
			});
		});
		
	},
	
	render : function(){
		setTimeout(function(){
			this.nodeContent = new Date().toString() + '<br>';
			this.rerender();
		}.bind(this), 2000);
		return this.nodeContent;
	}
});

