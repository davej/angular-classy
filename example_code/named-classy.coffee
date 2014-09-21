app.classy.controller
  name: 'MyCtrl'
  inject:
    $scope: '$'
    filterFilter: 'filter'
    $location: '.'

  init: ->
    # Check if dependencies are defined
    console.log @$ # ✔ ChildScope {}
    console.log @$scope # ✘ undefined
    console.log @$location # ✔ LocationHashbangUrl {}

    # Use a dependency
    console.log @filter(@$.todos, completed: true)
    # -> [{"title":"Learn Angular","completed":true}]