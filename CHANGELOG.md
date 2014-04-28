# Changelog

## 0.1
* Inital Version

## 0.1.1
* Fixes in javascript version and a few code cleanups

## 0.2 (1/Feb/2014)
* Now supports and prefers standalone `@inject`, so you can inject seperately from the `@register` method.
* Old `@register` syntax is still supported

## 0.2.1 (9/Feb/2014)
* Added shortcut to `module.classyController`, you can now use `module.cC` if you prefer.

## 0.3 (31/Mar/2014)
* Coffeescript `class extends` syntax is no longer supported
* classyController now maps to classyController.create
* The previous `JS` API (classyController.create) is now the universal API
* Create a classy controller with app.classyController(controllerName, classObj)
* Moved version numbers to pre-1.0 because API stability is not important for the moment and test coverage isn't as good as I'd like it to be.

## 0.4 (6/Apr/2014)
* Namespace is now `module.classy.controller`, this would be consistent with other classy helpers (e.g. `module.classy.service`) but you can still use module.cC or module.classyController if you prefer
* Added options (`addFnsToScope`, `watchObject`, `_scopeName` and `_watchKeywords`)
* Options can be changed at the module level
```javascript
app.classy.options.controller = {
    addFnsToScope: false
};
```
* ... or at the class level using the `__options` property

## 0.4.1 (27/Apr/2014)
* Added shortcut for `this.$scope`. You can now reference the $scope with `this.$`, although `this.$scope` still works fine