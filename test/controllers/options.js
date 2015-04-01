angular.module('options-classy', ['classy']).classy.options.component = {
  register: {
    key: 'el'
  },
  bindMethods: {
    keyName: 'fn'
  }
};

angular.module('options-classy').classy.component({
  selector: 'options-one-ignore', // Should be ignored
  el: 'options-one',
  methods: {
    bazMethod: function() {} // Should be ignored
  },
  fn: {
    fooMethod: function() {},
    barMethod: function() {}
  }
});

angular.module('options-classy').classy.component({
  el: 'options-two-ignore', // Should be ignored
  elem: 'options-two',
  // Override module options
  __options: {
    register: {
      key: 'elem'
    },
    bindMethods: {
      keyName: 'funcs'
    }
  },
  inject: ['$scope'],

  init: function() {
    this.$scope.baz = 'baz';
  },

  fn: {
    bazMethod: function() {}
  },

  funcs: {
    fabMethod: function() {},
    barMethod: function() {}
  }
});


angular.module('options-classy-shorthand', ['classy']).classy.options.component = {
  enabled: false
};

angular.module('options-classy-shorthand').classy.component({
  elem: 'options-one',

  init: function() {
    this.baz = 'baz';
  },

  methods: {
    fooMethod: function() {},
    barMethod: function() {}
  }
});

angular.module('options-classy-shorthand').classy.component({
  elem: 'options-two',
  // Override module options
  __options: {
    enabled: true
  },

  init: function() {
    this.baz = 'baz';
  },

  methods: {
    fooMethod: function() {},
    barMethod: function() {}
  }
});
