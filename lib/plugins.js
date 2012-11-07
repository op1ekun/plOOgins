// REGISTER JS module as jQuery Plugin
(function($){
        
    // this will need a polyfill for Function.name
    // just wrap jQuery plugin registration
    // sempro plugins constructors DO NOT return jQuery object
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
            // FIXME?
            var instances   = [];
            var args = arguments;
            
            self.each(function(index, elem) {
                
                var $singleElem = $(elem),
                    data = $singleElem.data(plugin.name);
                
                // one element has only one instance of single plugin
                if (!data || !(data instanceof plugin)) {
                    
                    // augment instance of plugin with jQuery selector object
                    var newInstance = Object.create(plugin.prototype);
                    newInstance.selector = $singleElem;
                    plugin.apply(newInstance, args);
                    
                    $singleElem.data(plugin.name, newInstance);
                }
                
                instances.push($singleElem.data(plugin.name));
            });
            
            console.log("instance", instances.length, instances);
            
            // return single instance
            if (instances.length === 1) {
                return instances[0];
            }
            // or instances collection
            else {
                // LOOP trough keys (every )
                for (var i in instances[0]) {
                    // take care only about functions
                    if (instances[0][i] instanceof Function &&
                        !(collection[i] instanceof Function)) {
                        console.log("INITIALIZE PLUGIN COLLECTION METHOD FOR", i);
                        // (one instance method per selected element)
                        collection[i]   = (function(i){
                            // closure
                            return function(opts) {
                                for (var j = 0, k = instances.length; j < k; j++) {
                                    instances[j][i](opts);    
                                }
                                
                                // return jQuery object to allow chaining
                                return self;
                            };
                        // pass to the function scope  
                        }(i));
                    }    
                }
                
                return collection;
            }
        };
    }
    
    $.extend(true, window, {
        plugins    : {
            register : register
        }
    });           
}(jQuery));