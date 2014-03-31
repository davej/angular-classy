(function() {
  var currentLanguage, otherlanguage, switchLanguage;

  currentLanguage = "javascript";

  otherlanguage = {
    coffeescript: 'javascript',
    javascript: 'coffeescript'
  };

  switchLanguage = function(language) {
    var elClass;
    if (language) {
      language = language.toLowerCase();
    } else {
      language = otherlanguage[currentLanguage];
    }
    currentLanguage = language;
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
    elClass("" + otherlanguage[language] + "-code", 'add', 'hide');
    return elClass("" + language + "-code", 'remove', 'hide');
  };

  document.getElementById('select-language').onchange = function(event) {
    return switchLanguage(event.target.value);
  };

}).call(this);
