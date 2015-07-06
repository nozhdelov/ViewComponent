## **Api Reference**
Methods 

- [init](#methodInit)
- [render](#methodRender)
- [rerender](#methodRerender)
- [destroy](#methodDestroy)
- [find](#methodFind)


--

Events
- [parsed](#eventParsed)
- [render](#eventRender)
- [destroy](#destroy)

### <a name="methodInit"></a>init 
Used for initialization of the component. The init method is called automaticly on component creation. It receives a *config* object that is either passed in the constructor with the JS syntax or captured from the DOM attributes when using the HTML syntax;


```

     var MyComponent = ViewComponent.register('MyComponent, {
        myName : 0,
        init : function(config){
            this.myName = config.name;
        }
    });
```
### <a name="methodRender"></a>render 
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
    
    
###<a name="methodRerender"></a>rerender
The rerender method is used for updating the component's content. When some state changes inside the component the rerender method can be called to update the DOM.
     
     `
     var MyComponent = ViewComponent.register('MyComponent, {
        caption : 'Press me',
        btn : null,
        init : function(){
          this.btn = document.createElement(button);
          this.btn.addEventListener('click', function(){
               this.caption = 'Thank you';
               this.rerender();
          }.bind(this));
        },
        
        render : function(){
               this.btn.value = this.caption;
               return this.btn;
        }
     });
     
     `

###<a name="methodDestroy"></a>destroy
The destroy method removes the component from the DOM and emits the *destroy* event so application specific cleanup can be done. Calling *destroy* also invokes the same method on the children of the component.


###<a name="methodFind"></a>find
The *find* method returns an array with components that are children of the calling component and meet certain creteria
    
     `
     
     <MyComponent>
          <MyButton id="1" ></MyButton>
          <MyButton id="2" ></MyButton>
          <MyButton id="3" ></MyButton>
     </MyComponent>
     
     var MyComponent = ViewComponent.register('MyComponent, {
        caption : 'Press me',
        btn : null,
        init : function(){
        
          this.on('parsed', function(){
               var children = this.find('MyButton id=2');
          });
        },
        
        render : function(){
         
        }
     });
     
     `




