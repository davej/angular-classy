app.classy.controller({
  name: 'MyCtrl',
  inject: {
    $scope: '$',
    filterFilter: 'filter',
    $location: '.'
  },
  init: function() {
    // Check if dependencies are defined
    console.log(this.$); // ✔ ChildScope {}
    console.log(this.$scope); // ✘ undefined
    console.log(this.$location); // ✔ LocationHashbangUrl {}

    // Use a dependency
    console.log(this.filter(
      this.$.todos,
      { completed: true }
    )); // [{"title":"Learn Angular","completed":true}]
  }
});