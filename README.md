##plOOgins

OOP for your jQuery plugins.

### Features

- allows You to write true OOP code to use as your jQuery plugins
- stores a plugin instance in jQuery.data for every selected element, once instantiated the plugin will remain there for further use
- unlike original jQuery, plugin methods work for all selected elements (not only for the first one)
- but You decide if You want to provide chaining or not

### HOWTO

See also [examples](https://github.com/op1ekun/plOOgins/tree/master/examples) and [tests](https://github.com/op1ekun/plOOgins/tree/master/t) for detailed use cases.

#### Common use case (with chaining)

    ploogins.register(YourPluginName);
    
    var plug = $('.someClass').YourPluginName();
    
    plug.someMethod().css('color', 'red');
    
    
### BIG Thanks

https://github.com/krzyzak00 - for borrowing his inheritance mechanism and helping with bugfixes

https://github.com/Sahadar - for providing good ideas

### License

Licensed under the [MIT](https://github.com/op1ekun/plOOgins/blob/master/LICENSE.md) license.

    
