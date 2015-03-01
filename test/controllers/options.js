angular.module('options-classy', ['classy']).classy.options.controller = {
  bindData: {
    addToScope: false,
    addToClass: false
  },
  bindMethods: {
    addToScope: false,
    addToClass: false
  }
};

angular.module('options-classy').classy.controller({
  name: 'optionsOne',
  inject: ['$scope'],

  data: {
    foo: '"foo"',
    bar: '"bar"'
  },

  init: function() {
    this.baz = 'baz';
    this.$.baz = 'baz';
  },

  methods: {
    fooMethod: function() {
      return;
    },
    barMethod: function() {
      return;
    }
  }
});

angular.module('options-classy').classy.controller({
  name: 'optionsTwo',
  // Override module options
  __options: {
    'bindData': {
      addToScope: true,
      addToClass: false
    },
    'bindMethods': {
      addToScope: false,
      addToClass: true
    }
  },
  inject: ['$scope'],

  data: {
    foo: '"foo"',
    bar: '"bar"'
  },

  init: function() {
    this.baz = 'baz';
    this.$.baz = 'baz';
  },

  methods: {
    fooMethod: function() {
      return;
    },
    barMethod: function() {
      return;
    }
  }
});


angular.module('options-classy-shorthand', ['classy']).classy.options.controller = {
  addToScope: false,
  addToClass: false
};

angular.module('options-classy-shorthand').classy.controller({
  name: 'optionsOne',
  inject: ['$scope'],

  data: {
    foo: '"foo"',
    bar: '"bar"'
  },

  init: function() {
    this.baz = 'baz';
    this.$.baz = 'baz';
  },

  methods: {
    fooMethod: function() {
      return;
    },
    barMethod: function() {
      return;
    }
  }
});

angular.module('options-classy-shorthand').classy.controller({
  name: 'optionsTwo',
  // Override module options
  __options: {
    addToScope: true,
    addToClass: false
  },
  inject: ['$scope'],

  data: {
    foo: '"foo"',
    bar: '"bar"'
  },

  init: function() {
    this.baz = 'baz';
    this.$.baz = 'baz';
  },

  methods: {
    fooMethod: function() {
      return;
    },
    barMethod: function() {
      return;
    }
  }
});
