/**
 * REGISTER JS module as jQuery Plugin
 * @author https://github.com/op1ekun
 * @author https://github.com/krzyzak00
 */
(function($){
    
	/**
     * just wrap jQuery plugin registration
     * if we want to keep chaining intact we need to take care about that in plugin methods
     *  
	 * @param {Function} plugin	 constructor of a class that will be registered as a plugin 
	 * @param {String} name		 optional plugin name, if not given plugin.name will be used (default)		 
	 */
	function register(plugin, name) {
		name = name ? name : plugin.name;
		
		// opts are used only when new plugin object is created
		// later the instance saved in element will be used
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
				var data		= $singleElem.data(name);
				
				// one element has only one instance of single plugin
				if (!data || !(data instanceof plugin)) {
					
					// augment instance of plugin with jQuery selector object
					var newInstance		 = Object.create(plugin.prototype);
					newInstance.selector	= $singleElem;
					plugin.apply(newInstance, args);
					
					$singleElem.data(name, newInstance);
				}
				
				instances.push($singleElem.data(name));
			});
			
			var instancesCnt = instances.length;
			
			for (var pluginMethod in instances[0]) {
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
						 * still seems like a best option that gives a developer the most of control
						 * @author https://github.com/op1ekun
						 */
						for (var i = 0, len = instancesCnt; i < len; i++) {
							ret[i] = instances[i][pluginMethod].apply(instances[i], arguments) 
						}
						
						/**
						 * for now return method output when we deal with single element
						 * or selector for collection
						 * @author https://github.com/krzyzak00
						 */
						
						/**
						 * ...but for a single element we can still return this.selector :)
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