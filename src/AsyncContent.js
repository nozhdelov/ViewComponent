'use strict';

ViewComponent.AsyncContent = ViewComponent.register('AsyncContent', {
	
	actions : {
		op : function(){alert('11111');}
	},
	
	render : function() {
		var deferred = Q.defer();
		var self = this;
		setTimeout(function(){
			var time = Date.now();
			deferred.resolve('<h1>wats aaaaaaaaap '+time+' </h1> <KWButton action="op"></KWButton>\n\
<KWButton></KWButton><KWButton></KWButton><KWButton></KWButton>');
			setTimeout(function(){
				self.rerender();		
			}, 1000);
			
		}, 1000);
		

		
		return deferred.promise;
	}
	
	
});
