angular.module('classy.watch', ['classy.core']).classy.plugin.controller
  name: 'watch'

  options:
    enabled: true
    _watchKeywords:
      normal: []
      objectEquality: ['{object}', '{deep}']
      collection: ['{collection}', '{shallow}']

  isActive: (klass, deps) ->
    if @options.enabled and angular.isObject(klass.watch)
      if !deps.$scope
        throw new Error "You need to inject `$scope` to use the watch object"
        return false

      return true

  watchFns:
    normal: (klass, expression, fn, deps) ->
        deps.$scope.$watch(expression, angular.bind(klass, fn))
    objectEquality: (klass, expression, fn, deps) ->
        deps.$scope.$watch(expression, angular.bind(klass, fn), true)
    collection: (klass, expression, fn, deps) ->
        deps.$scope.$watchCollection(expression, angular.bind(klass, fn))

  postInit: (klass, deps, module) ->
    if !@isActive(klass, deps) then return

    watchKeywords = @options._watchKeywords

    for expression, fn of klass.watch
      if angular.isString(fn) then fn = klass[fn]
      if angular.isString(expression) and angular.isFunction(fn)
        watchRegistered = false

        # Search for keywords that identify it is a non-standard watch
        for watchType, watchFn of @watchFns
          if watchRegistered then break
          for keyword in watchKeywords[watchType]
            if expression.indexOf(keyword) isnt -1
              watchFn(klass, expression.replace(keyword, ''), fn, deps)
              watchRegistered = true
              break

        # If no keywords have been found then register it as a normal watch
        if !watchRegistered then this.watchFns.normal(klass, expression, fn, deps)
