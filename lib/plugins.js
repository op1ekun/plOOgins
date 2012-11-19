// REGISTER JS module as jQuery Plugin
(function($){
        
    // this will need a polyfill for Function.name
    // just wrap jQuery plugin registration
    // if we want to keep chaining intact we need to take care about that in plugin methods
    function register(plugin) {
        //TODO one more level of nesting required
        //add plugins level
        var collection  = {};
        
        // opts are used only when new plugin object is created
        // later the instance saved in element will be used
        $.fn[plugin.name] = function() {
            var self        = this;
            
            // for plugin logic
            var instances   = [];
            var args        = arguments;
            
            self.each(function(index, elem) {
                
                var $singleElem = $(elem);
                var data        = $singleElem.data(plugin.name);
                
                // one element has only one instance of single plugin
                if (!data || !(data instanceof plugin)) {
                    
                    // augment instance of plugin with jQuery selector object
                    var newInstance         = Object.create(plugin.prototype);
                    newInstance.selector    = $singleElem;
                    plugin.apply(newInstance, args);
                    
                    $singleElem.data(plugin.name, newInstance);
                }
                
                instances.push($singleElem.data(plugin.name));
            });
            
            // return single instance
            if (instances.length === 1) {
                return instances[0];
            }
            // or instances collection
            else {
                if (!collection[plugin.name]) {
                    collection[plugin.name] = {};
                }
                
                // LOOP trough keys of the first plugin instance 
                // (every plugin instance is the same)
                for (var i in instances[0]) {
                    // take care only about functions
                    if (instances[0][i] instanceof Function &&
                        !(collection[plugin.name][i] instanceof Function)) {
                        // (one instance method per selected element)
                        collection[plugin.name][i]   = (function(i){
                            // closure
                            return function(args) {
                                for (var j = 0, k = instances.length; j < k; j++) {
                                    instances[j][i](args);    
                                }
                                
                                // return jQuery object to allow chaining
                                return self;
                            };
                        // pass to the function scope  
                        }(i));
                    }    
                }
                
                return collection[plugin.name];
            }
        };
    }
    
    $.extend(true, window, {
        plugins    : {
            register : register
        }
    });           
}(jQuery));