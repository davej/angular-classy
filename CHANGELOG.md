# Changelog

## 1.0
* Inital Version

## 1.0.1
* Fixes in javascript version and a few code cleanups

## 1.1
* Now supports and prefers standalone `@inject`, so you can inject seperately from the `@register` method.
* Old `@register` syntax is still supported

## 1.1.1
* Added shortcut to `module.classyController`, you can now use `module.cC` if you prefer.

## 2.0
* Coffeescript `class extends` syntax is no longer supported
* classyController now maps to classyController.create
* The previous `JS` API (classyController.create) is now the universal API
* Create a classy controller with app.classyController(controllerName, classObj)