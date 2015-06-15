'use strict';

ViewComponent.AsyncContent = ViewComponent.register('AsyncContent', {
	
	actions : {
		op : function(){alert('11111');}
	},
	
	render : function() {
		var deferred = Q.defer();
		
		setTimeout(function(){
			deferred.resolve('<h1>wats aaaaaaaaap</h1> <KWButton action="op"></KWButton>\n\
<KWButton></KWButton><KWButton></KWButton><KWButton></KWButton>');
		}, 4000);
		
		return deferred.promise;
	}
	
	
});