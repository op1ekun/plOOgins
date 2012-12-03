/**
 * REGISTER JS module as jQuery Plugin
 * @author op1ekun
 */
(function($){
    var collection  = {};
        
    // this will need a polyfill for Function.name
    // just wrap jQuery plugin registration
    // if we want to keep chaining intact we need to take care about that in plugin methods
    /**
     * 
     * @param {Function} plugin     constructor of a class that will be registered as a plugin 
     * @param {String} name         optional plugin name, if not given plugin.name will be used (default)         
     */
    function register(plugin, name) {
        name = name ? name : plugin.name;
        
        // opts are used only when new plugin object is created
        // later the instance saved in element will be used
        $.fn[name] = function() {
            var $selector        = this;
            
            if ($selector.length === 0) {
                throw new Error("Cannot instantiate plugin for an empty selector");
            }
            
            // for plugin logic
            var instances   = [];
            var args        = arguments;
            
            $selector.each(function(index, elem) {
                var $singleElem = $(elem);
                var data        = $singleElem.data(name);
                
                // one element has only one instance of single plugin
                if (!data || !(data instanceof plugin)) {
                    
                    // augment instance of plugin with jQuery selector object
                    var newInstance         = Object.create(plugin.prototype);
                    newInstance.selector    = $singleElem;
                    plugin.apply(newInstance, args);
                    
                    $singleElem.data(name, newInstance);
                }
                
                instances.push($singleElem.data(name));
            });
            
            // return single instance
            if (instances.length === 1) {
                return instances[0];
            }
            // or instances collection
            else {
                if (!collection[name]) {
                    collection[name] = {};
                }
                
                // LOOP trough keys of the first plugin instance 
                // (because every plugin instance is the same)
                for (var key in instances[0]) {
                    // take care only about functions
                    // from both constructor and prototype
                    if (instances[0][key] instanceof Function &&
                        !(collection[name][key] instanceof Function)) {
                        // (one instance method per selected element)
                        collection[name][key]   = (function(key){
                            return function() {
                                var args = arguments;
                                
                                for (var i = 0, k = instances.length; i < k; i++) {
                                    // instances[i] (a single instance)
                                    // instances[i][key] (a single method of the instance) 
                                    
                                    instances[i][key](args);
                                    // console.log('INSTANCES SELECTOR', instances[i].selector);
                                    // instances[i][key].apply(instances[i].selector, args);    
                                }
                                
                                // return jQuery selector to allow chaining
                                return $selector;
                            };
                        }(key));
                    }    
                }
                
                // return literal
                return collection[name];
            }
        };
    }
    
    $.extend(true, window, {
        ploogins    : {
            register    : register
        }
    });           
}(jQuery));