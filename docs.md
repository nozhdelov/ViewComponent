## **Fuck it .... I will start with the docs** ##
----------

**What is ViewComponent**

ViewComponent a.k.a KW.ViewComponent is what would've happened if React fucked Ember and then a freakish baby was born.... and then it was dropped on its head.

The main principles ViewComponent is built on are as follows : 

 1. Creating reusable UI components that encapsulate structure design and behavior
 2. Using those components in a few different ways depending on the context
 3. Nesting those components to create more complex ones
 4. Heavy  drinking

(this is for the first day of writing)

**Declaring component**

  

     var MyComponent = ViewComponent.register('MyComponent, {
    	init : function(config){},
    	render : function(){},
    	onBeforeRender : function(){},
    	onAfterRender : function(){}
    });

 - **init** method (*optional*) - use it for whatever Initialization is needed .... the config map will be passed from the constructor on creation.
 - **render** method - should return some kind of visual representation of the component. Supported types are : 
	 - HTML string
	 - DOM Element
	 - DOM Fragment
	 - Promise for whatever of the above (Yes this means you can load preprocessed HTML from the server )
	 
 - **onBeforeRender** (*optional*)  method - called when the render content is ready and is about to be inserted in the DOM
 - **onAfterRender** (*optional*)  method - called after the content is inserted in the DOM
 


**Using component**

***JS Syntax***


    var component = new ViewComponent.MyComponent({
    	someValue : 5,
    	action : function(){
    		alert(this.someValue);
    	}
    });
    component.appendTo(someDomNode);



***HTML Syntax***

    <div>
    	<MyComponent someValue="5" ></MyComponent>
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
In this example the doSomeStuff method will be searched in the components actions object. If not found there the search will propagate to its parents until the method is found or a component without parent is reached.



----------
**Some nasty stuff I  did not mention**

 1. Some of this things don't actually work (I've only been writing this shit for 1 day)
 2. When using the HTML syntax all attributes names are internally converted to lower case (no work-around at least for now ..... PS what would Lutsi say about the DOM)


