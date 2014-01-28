(function() {
  var app;

  window.app = app = {};

  app.currentLanguage = "coffeescript";

  app.otherlanguage = {
    coffeescript: 'javascript',
    javascript: 'coffeescript'
  };

  app.switchLanguage = function(language) {
    var elClass;
    if (language) {
      language = language.toLowerCase();
    } else {
      language = app.otherlanguage[app.currentLanguage];
    }
    app.currentLanguage = language;
    elClass = function(className, action, modifyClass) {
      var el, elements, _i, _len, _results;
      elements = document.getElementsByClassName(className);
      _results = [];
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        el = elements[_i];
        _results.push(el.classList[action](modifyClass));
      }
      return _results;
    };
    elClass("" + app.otherlanguage[language] + "-code", 'add', 'hide');
    return elClass("" + language + "-code", 'remove', 'hide');
  };

  document.getElementById('select-language').onchange = function(event) {
    return app.switchLanguage(event.target.value);
  };

  document.getElementById('toggle-language').onclick = function(event) {
    event.preventDefault();
    return app.switchLanguage();
  };

}).call(this);
