
'use strict';

ViewComponent.KWInfoBox = ViewComponent.register('KWInfoBox', {
	
	actions : {
		close : function(){
			alert('da sa ebe6');
		}
	},
	
	text : '',
	
	init : function(config){
		this.text = config.text;
	},
	
	render : function(){
		return '<p> '+ this.text +' <KWButton value="close" action="close"  disable="true" /> </p>';
	}
	
});