angular.module("app", [ "classy" ])
  .classy.controllers([
    name: "BarController"
    inject: [ "$scope" ]
    init: -> @$.foo = "bar"
  ,
    name: "BazController"
    inject: [ "$scope" ]
    init: -> @$.foo = "baz"
  ]).service(
    # Service here
  ).config(
    # Config here
  )