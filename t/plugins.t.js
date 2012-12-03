(function($){
    var module = QUnit.module;
    
    module('plugins module', {
        setup       : function () {
            this.plugins    = window.plugins;
                
            function TestObject() {
                // public method that can be inherited by calling TestObject constructor
                this.publicMethod = function () {
                    this.selector.html('publicMethod returns jQuery object with id ' + this.selector.attr('data-id'));
                    return this.selector;
                }
            }
            
            // prototype method that can be overridden
            TestObject.prototype.prototypeMethod = function () {
                console.log('prototype selector', this.selector);
                
                this.selector.html('prototypeMethod returns jQuery object with id ' + this.selector.attr('data-id'));
                return this.selector;
            }
            
            function AnotherTestObject() {
                TestObject.call(this);
            }
            
            AnotherTestObject.prototype.prototypeMethod = function () {
                this._super();                    
                this.selector.css("color", "red");
                return this.selector;    
            }
            
            extend(AnotherTestObject, TestObject);
                
            this.plugins.register(AnotherTestObject);
        },
        teardown    : function () {
            $('.plugin').each(function (index, elem) {
                // console.log($(elem).data('AnotherTestObject'));
                
                $(elem).data('AnotherTestObject', undefined);
            });
        }
    });

    test('smoke tests', function () {
        ok(typeof this.plugins === 'object', 'plugins module is present');
        ok(this.plugins.register instanceof Function, 'register method is present');
    });
    
    test('public method for a single element (.two)', function () {
        var plug = $('.two').AnotherTestObject();
        plug.publicMethod();
        
        equal($('.two').html(), 
            'publicMethod returns jQuery object with id 234',
            'content correct for id ' + $('.two').attr('data-id'));        
    });
    
    test('public method for a many elements (.plugin)', function () {
        expect(3);
        
        var plug = $('.plugin').AnotherTestObject();
        plug.publicMethod();
        
        $('.plugin').each(function (index, elem) {
            equal(elem.innerHTML, 
                'publicMethod returns jQuery object with id ' + $(elem).attr('data-id'), 
                'content correct for id ' + $(elem).attr('data-id'));
        });
    });    
    
    test('proto method for a single element (.three)', function () {
        var plug = $('.three').AnotherTestObject();
        plug.prototypeMethod();
        
        equal($('.three').html(), 
            'prototypeMethod returns jQuery object with id 345',
            'content correct for id ' + $('.two').attr('data-id'));
            
        equal($('.three').css('color'),
            'rgb(255, 0, 0)',
            'color correct for id ' + $('.three').attr('data-id'));     
    });
    
    test('proto method for many elements (.plugin)', function () {
        expect(6);
        
        var plug = $('.plugin').AnotherTestObject();
        
        console.log(plug);
        
        plug.prototypeMethod();
        
        console.log($('.plugin'));
        
        $('.plugin').each(function (index, elem) {
            equal(elem.innerHTML, 
                'prototypeMethod returns jQuery object with id ' + $(elem).attr('data-id'), 
                'content correct for id ' + $(elem).attr('data-id'));
        });
        
        $('.plugin').each(function (index, elem) {
            equal($(elem).css('color'),
                'rgb(255, 0, 0)',
                'color correct for id ' + $(elem).attr('data-id'));    
        });
    });
}(jQuery));