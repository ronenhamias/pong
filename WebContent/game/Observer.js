var createMediator = function () {
    var events = {};
    return {
        subscribe: function (eventName, callback) {
            events[eventName] = events[eventName] || [];
            events[eventName].push(callback);
        },
        publish: function (eventName) {
            var i, callbacks = events[eventName], args;
            if (callbacks) {
                args = Array.prototype.slice.call(arguments, 1);
                for (i = 0; i < callbacks.length; i++) {
                    callbacks[i].apply(null, args);
                }
            }
        }
    };
};   

var createObservable = function (properties) {
    var notifier = createMediator(), createObservableProperty, observable;
    createObservableProperty = function (propName, value) {
        return function (newValue) {
            var oldValue;
            if (typeof newValue !== 'undefined' &&
                value !== newValue) {
                oldValue = value;
                value = newValue;
                notifier.publish(propName, oldValue, value);
            }
            return value;
        };
    };
    observable = {
        register: function (propName, value) {
            this[propName] = createObservableProperty(propName, value);
            this.observableProperties.push(propName);
        },
        observe: function (propName, observer) {
            notifier.subscribe(propName, observer);
        },
        observableProperties: []
    };
    for (propName in properties) {
        observable.register(propName, properties[propName]);
    }
    return observable;
};