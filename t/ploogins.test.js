(function($){
    var module = QUnit.module;

    module('ploogins module', {
        setup       : function () {
            this.ploogins   = window.ploogins;
            this.instance;

            function TestObject() {
                var args = arguments;

                // just a test method to check if arguments were correctly passed
                this.getArgs = function () {
                    return arguments.length ? arguments : args;
                }

                // public method that can be inherited by calling TestObject constructor
                this.publicMethod = function () {
                    this.selector.html('publicMethod returns jQuery object with id ' + this.selector.attr('data-id'));
                    return this.selector;
                }
            }

            // prototype method that can be overridden
            TestObject.prototype.prototypeMethod = function () {
                this.selector.html('prototypeMethod returns jQuery object with id ' + this.selector.attr('data-id'));
                return this.selector;
            }

            // Destroys plugin instance, but doesn't unregister plugin
            TestObject.prototype.destroy = function () {
                // by default remove all events attached to selected elements
                this.selector.off();

                // according to .removeData documentation I have decided to set null 
                // to avoid removing ALL THE DATA if name wasn't passed to .removeData
                this.selector.data(this.name, null);
            }

            function AnotherTestObject() {
                TestObject.apply(this, arguments);
            }

            AnotherTestObject.prototype.prototypeMethod = function () {
                this._super();

                this.selector.css("color", "red");
                return this.selector;
            }

            // Destroys plugin instance, but doesn't unregister plugin
            AnotherTestObject.prototype.destroy = function () {
                this._super();
            }

            extend(AnotherTestObject, TestObject);

            this.anotherConstructor = AnotherTestObject;

            this.ploogins.register(AnotherTestObject);
        },
        teardown    : function () {
            this.instance.destroy();
        }
    });

    test('smoke tests', function () {
        ok(typeof this.ploogins === 'object', 'ploogins module is present');
        ok(this.ploogins.register instanceof Function, 'register method is present');
        this.instance   = $('.plugin').AnotherTestObject();
    });

    test('register plugin under custom name', function () {
        expect(3);

        this.ploogins.register(this.anotherConstructor, 'customName');
        this.instance = $('.plugin').customName();

        $('.plugin').each(function (index, elem) {
            ok($(elem).data('customName'), 'instance ' + (index+1) + ' present');
        });
    });

    test('public method for a single element (.two)', function () {
        this.instance   = $('.two').AnotherTestObject();
        this.instance.publicMethod();

        equal($('.two').html(),
            'publicMethod returns jQuery object with id 234',
            'content correct for id ' + $('.two').attr('data-id'));
    });

    test('public method for a many elements (.plugin)', function () {
        expect(3);

        this.instance   = $('.plugin').AnotherTestObject();
        this.instance.publicMethod();

        $('.plugin').each(function (index, elem) {
            equal(elem.innerHTML,
                'publicMethod returns jQuery object with id ' + $(elem).attr('data-id'),
                'content correct for id ' + $(elem).attr('data-id'));
        });
    });

    test('proto method for a single element (.three)', function () {
        this.instance   = $('.three').AnotherTestObject();
        this.instance.prototypeMethod();

        equal($('.three').html(),
            'prototypeMethod returns jQuery object with id 345',
            'content correct for id ' + $('.two').attr('data-id'));

        equal($('.three').css('color'),
            'rgb(255, 0, 0)',
            'color correct for id ' + $('.three').attr('data-id'));
    });

    test('proto method for many elements (.plugin)', function () {
        expect(6);

        this.instance   = $('.plugin').AnotherTestObject();
        this.instance.prototypeMethod();

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

    test('pass arguments to plugin constructor', function () {
        this.instance   = $('.one').AnotherTestObject('one', 'two', 'three');

        deepEqual(this.instance.getArgs(), { '0' : 'one', '1' : 'two', '2' : 'three' }, 'arguments passed correctly');
    });

    test('pass arguments to plugin method', function () {
        this.instance   = $('.two').AnotherTestObject();

        deepEqual(this.instance.getArgs('one', 'two'), { '0' : 'one', '1' : 'two' }, 'arguments passed correctly');
    });

    test('detroy method', function () {
        expect(3);
        
        this.instance   = $('.plugin').AnotherTestObject();

        this.instance.destroy();

        $('.plugin').each(function (index, elem) {
            ok(!$(elem).data('AnotherTestObject'), 'instance ' + (index+1) + ' destroyed');
        });

    });

}(jQuery));
