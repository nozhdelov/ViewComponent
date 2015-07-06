## **Api Reference**

Methods 
- ###init 
     Used for initialization of the component. The init method is called automaticly on component creation. It receives a *config* object that is either passed in the constructor with the JS syntax or captured from the DOM attributes when using the HTML syntax;


`

     var MyComponent = ViewComponent.register('MyComponent, {
        myName : 0,
        init : function(config){
            this.myName = config.name;
        }
    });
    `
- ###render 
     The render method is used for rendering the component on the screen. Its return value must be a string, a DOM node or a promise (every object that implements then and fail methods is considered a promise) 

`
         
   
     var MyComponent = ViewComponent.register('MyComponent, {
        myName : 0,
        render : function(){
            return '<p>Hi, my name is ' + this.myName + '.</p>';
        }
    });
    
    var MyComponent = ViewComponent.register('MyComponent, {
        myName : 0,
        render : function(){
            var p = document.createElement('p');
            p.innerHTML = Hi, my name is ' + this.myName;
            return p;
        }
    });


    var MyComponent = ViewComponent.register('MyComponent, {
        myName : 0,
        render : function(){
            return $.get('www.example.com/myContent');
        }
    });`

