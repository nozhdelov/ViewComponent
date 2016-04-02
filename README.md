## **What is ViewComponent**
----------
ViewComponent  is a small lightweight library for creating component based UIs.

The main principles ViewComponent is built on are as follows : 

 1. Creating reusable UI components that encapsulate structure design and behavior
 2. Using those components in a few different ways depending on the context
 3. Nesting those components to create more complex ones
 4. Heavy  drinking


[API Reference](https://github.com/nozhdelov/ViewComponent/blob/master/docs.md)

**Declaring component**

  

     var MyComponent = ViewComponent.register('MyComponent, {
        myName : 'Ivan',
    	init : function(config){
    	    this.myName = config.name;
    	},
    	render : function(){
    	    return '<p>Hi, my name is ' + this.myName + '.</p>';
    	}
    });

 - **init** method (*optional*) - use it for whatever Initialization is needed .... the config map will be passed from the constructor on creation.
 - **render** method - should return some kind of visual representation of the component. Supported types are : 
	 - HTML string
	 - DOM Element
	 - DOM Fragment
	 - Promise for whatever of the above 

**Events**	 
 - **parsed**  - emitted when the render content is ready and is about to be inserted in the DOM. At this stage the component`s children are discovered.
 - **render**  - emitted after the content is inserted in the DOM
 - **destroy** - emitted when the "destroy" method is called or the component is destroyed for some other reason (For example the parent component is rerendering) 
 
 
Every component is actualy an event emitter so it can emit all kinds of custom evetns.
 


**Using component**

***JS Syntax***


    var MyComponent = ViewComponent.register('MyComponent, {
        myName : 0,
    	init : function(config){
    	    this.myName = config.name;
    	},
    	render : function(){
    	    return '<p>Hi, my name is ' + this.myName + '.</p>';
    	}
    });
    component.appendTo(someDomNode);



***HTML Syntax***

    <div>
    	<MyComponent name="John Smith" ></MyComponent>
    </div>



**Components hierarchy and nesting**

Components can be nested in one another forming a hierarchical structure similar to the DOM. Unlike the DOM however the components do not have any horizontal relations with each other but only keep child-parent like relations.

    <MyComponent>
    	<mySubComponent></mySubComponent>
    </MyComponent>

----------


**The Actions object**

Every component can optionally implement an actions map that is used for finding functions when using *action-** attributes with the HTML syntax

    <myComponent action-click="doSomeStuff" action-change="doSomeOtherStuff" ></myComponent>
In this example the doSomeStuff method will be searched in the components actions object. If not found there the search will propagate to its parents until the method is found or a component without parent is reached. Arguments can be passed to the function by using the "|" after the function name. For example :

    <myComponent action-click="doSomeStuff|1,'John Smith', 3" action-change="doSomeOtherStuff" ></myComponent>

----------
**Query selectors**

Every component can search its descendants by a given criteria using the "find" method 

     ` var MyComponent = ViewComponent.register('MyComponent, {
        myName : 0,
    	init : function(config){
    	    this.myName = config.name;
    	},
    	render : function(){
    	    return '<MyHeadingComponent><p>Hi, my name is ' + this.myName + '.</p></MyHeadingComponent>';
    	}
        
        this.on('parsed', function(){
            var headings = this.find('MyHeadingComponent');
            headings[0].doSomeStuff();
        }.bind(this));

    });`




----------
**Plugins**

ViewComponent has a simple plugin system, which gives access to some of the internals of the library

To create a plugen use the ViewComponent.registerPlugin method. It takes as arguments a name and a object that contains some callbacks;
These callbacks will be executed at different stages of the life cycle of every component.
Posible callbacks are : 

- **componentRegister** - Executed when the component is registered. Receives the component name as an argument.
- **init** - Executed when the plugin is registered. Can be used for plugin initialization.
- **componentRender** - Executed just before the content of the component is inserted into the DOM and can be used to manipulate that content. Receives the component itself as an argument.
- **componentStartScan** - Executed when the component content is about to be scanned for other components. Receives the component itself as an argument.
- **componentEndScan** - Executed when the component content is scanned for other components. Receives the component itself as an argument.
- **componentCreate** - Executed when the component is created. May be used to extend the newly created object with properties and methods. Receives the component itself as an argument.
- **scanNode** - Executed when the DOM scanner passes through every DOM node in search of component nodes. Receives the DOM node as an argument.


----------
**Inheritance**

Components can inherit properties methods and actions from one another.
To make one component inherit another simply pass the ancestor constructor as a third argument of the register function 

    `var ancestor = ViewComponent.register('my-component', {

	init : function(conf){
	    this.firstName = conf.firstName;
	    this.familyName = conf.familyName;
	},

	fullName : function(){
	    return this.firstName + ' ' + this.familyName;
	}
    });

    var inherited = ViewComponent.register('my-inherited-component', {
    
	fullName : functon(){
	    return this.familyName + ', ' + this.firstName;
        }
    
    }, ancestor);`