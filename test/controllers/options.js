angular.module('options-classy', ['classy']).classy.options.component = {
  register: {
    key: 'el'
  },
  bindMethods: {
    keyName: 'fn'
  }
};

angular.module('options-classy').classy.component({
  el: 'options-one',

  fn: {
    fooMethod: function() {
      return;
    },
    barMethod: function() {
      return;
    }
  }
});

angular.module('options-classy').classy.component({
  elem: 'options-two',
  // Override module options
  __options: {
    register: {
      key: 'elem'
    },
    bindMethods: {
      key: 'funcs'
    }
  },
  inject: ['$scope'],

  init: function() {
    this.baz = 'baz';
    this.$.baz = 'baz';
  },

  funcs: {
    fooMethod: function() {
      return;
    },
    barMethod: function() {
      return;
    }
  }
});


angular.module('options-classy-shorthand', ['classy']).classy.options.component = {
  addToScope: false,
  addToClass: false
};

angular.module('options-classy-shorthand').classy.component({
  name: 'options-one',
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

angular.module('options-classy-shorthand').classy.component({
  name: 'options-two',
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
