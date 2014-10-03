angular.module('classy-registerSelector', ['classy-core']).classy.plugin.controller
  name: 'register'

  options:
    enabled: true

  preInit: (classConstructor, classObj, module) ->
    if @options.enabled && (classObj.el || classObj.selector)
      # Register the controller using selector
      @registerSelector(module, classObj.el || classObj.selector, classConstructor)

  registerSelector: (module, selector, classConstructor) ->
    selectorControllerCount++
    controllerName = "ClassySelector#{selectorControllerCount}Controller"
    module.controller controllerName, classConstructor

    if angular.isElement(selector)
      selector.setAttribute('data-ng-controller', controllerName)
      return

    if angular.isString(selector)
      # Query the dom using jQuery if available, otherwise fallback to qSA
      els = window.jQuery?(selector) or document.querySelectorAll(selector)
    else if angular.isArray(selector)
      els = selector
    else return

    for el in els
      if angular.isElement(el)
        el.setAttribute('data-ng-controller', controllerName)