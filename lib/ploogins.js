/**
 * REGISTER JS module as jQuery Plugin
 * @author https://github.com/op1ekun
 * @author https://github.com/krzyzak00
 */
(function($){

    /**
     * Use either Function.name (FF, Chrome, Opera)
     * or parse stringified function (IE)
     * 
     * @param {Function} func   javascript function
     * @returns {String}        function's name
     */
    function getFunctionName(func) {
        if (Function.name || Function.prototype.name) {
            return func.name;
        }

        return func.toString().match(/^function\s+(\w+)\s*\(/)[1];
    }

    /**
     * just wrap jQuery plugin registration
     * if we want to keep chaining intact we need to take care about that in plugin methods
     *  
     * @param {Function} plugin	 constructor of a class that will be registered as a plugin 
     * @param {String} name		 optional plugin name, if not given, plugin.name will be used (default)		 
     */
    function register(plugin, name) {
        name = name || getFunctionName(plugin);

        // opts are used only when new plugin object is created
        // the instance, saved in element, will be used later  
        $.fn[name] = function() {
            var $selector		= this;

            if ($selector.length === 0) {
                throw new Error("Cannot instantiate plugin for an empty selector");
            }

            // for plugin logic
            var instances   = [];
            var args		= arguments;

            // TODO: can we move this outside of scope?
            var instancesCollection = $([]);

            $selector.each(function(index, elem) {
                var $singleElem = $(elem);
                var data        = $singleElem.data(name);

                // one element has only one instance of single plugin
                if (!data || !(data instanceof plugin)) {
                    var newInstance         = Object.create(plugin.prototype);
                    // augment instance of plugin with jQuery selector object
                    newInstance.selector    = $singleElem;
                    // augment instance with specified name (constructor or custom)
                    newInstance.name        = name;
                    plugin.apply(newInstance, args);

                    $singleElem.data(name, newInstance);
                }

                instances.push($singleElem.data(name));
            });

            var instancesCnt = instances.length;

            for (var pluginMethod in instances[0]) {
                // loop through instance's methods
                if (typeof(instances[0][pluginMethod]) !== 'function') {
                    continue;
                }

                instancesCollection[pluginMethod] = (function(pluginMethod) {

                    return function() {
                        var ret = [];
                        
                        /**
                         * NOTE: this is questionable
                         * when we work with collection what should we return?
                         * selector gives us jQuery chaining but suppreses method output
                         * so we can't chain plugin methods (do we want this at all?)
                         * @author https://github.com/krzyzak00 
                         */

                        /**
                         * still seems like the best option that gives a developer the most of control
                         * @author https://github.com/op1ekun
                         */
                        for (var i = 0, len = instancesCnt; i < len; i++) {
                            // apply to have the same access to the arguments as it was in the original method
                            ret[i] = instances[i][pluginMethod].apply(instances[i], arguments);
                        }

                        /**
                         * for now return method output when we deal with single element
                         * or selector for collection
                         * @author https://github.com/krzyzak00
                         */

                        /**
                         * ...but for a single element we can still return this.selector :)
                         * it depends on what You want to do
                         * @author https://github.com/op1ekun 
                         */
                        return instancesCnt === 1 ? ret[0] : $selector;
                    };

                }(pluginMethod));
            }

            return instancesCollection;
        };
    }
    
    $.extend(true, window, {
        ploogins	: {
            register	: register
        }
    });
}(jQuery));
