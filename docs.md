## **API Reference**
Methods 

- [init](#methodInit)
- [render](#methodRender)
- [rerender](#methodRerender)
- [destroy](#methodDestroy)
- [find](#methodFind)



--


Properties
- [parent](#propParent)
- [children](#propChildren)
- [parentNode](#propParentNode)
- [nodeContent](#propNodeContent)
- [actions](#propActions)


State
- [set](#stateSet)
- [get](#stateGet)
- [subscribe](#stateSubscribe)


--

Events
- [parsed](#eventParsed)
- [render](#eventRender)
- [destroy](#eventDestroy)

### <a name="methodInit"></a>init(config)
Used for initialization of the component. The init method is called automaticly on component creation. It receives a *config* object that is either passed in the constructor with the JS syntax or captured from the DOM attributes when using the HTML syntax;
* config type : object


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
The rerender method is used for updating the component's content. When some state changes inside the component the rerender method can be called to update the DOM. Rerender internaly calls render to get the current representation of the component.
     
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
        init : function(){
        
          this.on('parsed', function(){
               var children = this.find('MyButton id=2');
          });
        },
        
       
     });
     
     `


----

Properties

--
###<a name="propParent"></a>parent
A reference to the parent component or null if the component does not have parent

###<a name="propChildren"></a>children
An array holding list of the child components of a given component

###<a name="propParentNode"></a>parentNode
A reference to the DOM element containing the component.

###<a name="propNodeContent"></a>nodeContent
The HTML between the open and close tag of the component.

###<a name="propActions"></a>actions
A map containing functions that can be used with the *action-?* attribute in the HTML syntax.



Events
--
###<a name="eventParsed"></a>parsed
Eemitted when the render content is ready and is about to be inserted in the DOM. At this stage the component`s children are discovered.

    
     `
     
     <MyComponent>
          <MyButton id="1" ></MyButton>
          <MyButton id="2" ></MyButton>
          <MyButton id="3" ></MyButton>
     </MyComponent>
     
     var MyComponent = ViewComponent.register('MyComponent, {
        init : function(){
        
          this.on('parsed', function(){
               var children = this.find('MyButton id=2');
          });
        },
        
       
     });
     
     `
     
###<a name="eventRender"></a>render
Emitted after the content is inserted in the DOM. At this stage the content can be selected and manipolated with the DOM API or with libraries like JQuery;

`

     var MyComponent = ViewComponent.register('MyComponent, {
        init : function(){
        
          this.on('render', function(){
               document.getElementById('myBtn').addEventListener('click', function(){
                    this.value = "Thank you";
               });
          });
        },
        
        render : function(){
          return '<input id="myBtn" type="button" value="press me" />';
        }
     });

`


###<a name="eventDestroy"></a>destroy
emitted when the "destroy" method is called or the component is destroyed for some other reason (For example the parent component is rerendering) 



The State Object - every component has an internal .state object that can be used to share state between components in a given subtree
The state object has 3 methods

 - <a name="stateGet"></a>.get(variableName) - returns the value of a shared variable variableName. variableName can also be a path in a object, for example 'object.subobject.varName'
 - <a name="stateSet"></a>.set(variableName, value) - sets a value for a shared variable variableName.
 - <a name="stateSubscribe"></a>.subscribe(variableName, handler) registers a callback for when a given shared variable is changed. The handler function receives the new value and the old value as arguments