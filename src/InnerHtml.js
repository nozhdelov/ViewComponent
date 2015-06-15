'use strict';

ViewComponent.InnerHtml = ViewComponent.register('InnerHtml', {
	render : function(){
		setTimeout(function(){
			this.nodeContent = new Date().toString() + '<br>';
			this.rerender();
		}.bind(this), 2000);
		return this.nodeContent;
	}
});

