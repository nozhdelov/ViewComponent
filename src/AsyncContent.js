'use strict';

ViewComponent.AsyncContent = ViewComponent.register('AsyncContent', {
	
	render : function() {
		var deferred = Q.defer();
		
		setTimeout(function(){
			deferred.resolve('<h1>wats aaaaaaaaap</h1> <KWButton></<KWButton>');
		}, 4000);
		
		return deferred.promise;
	}
	
	
});