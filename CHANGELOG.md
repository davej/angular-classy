# Changelog

## 0.1
* Inital Version

## 0.1.1
* Fixes in javascript version and a few code cleanups

## 0.2
* Now supports and prefers standalone `@inject`, so you can inject seperately from the `@register` method.
* Old `@register` syntax is still supported

## 0.2.1
* Added shortcut to `module.classyController`, you can now use `module.cC` if you prefer.

## 0.3
* Coffeescript `class extends` syntax is no longer supported
* classyController now maps to classyController.create
* The previous `JS` API (classyController.create) is now the universal API
* Create a classy controller with app.classyController(controllerName, classObj)
* Moved version numbers to pre-1.0 because API stability is not important for the moment and test coverage isn't as good as I'd like it to be.