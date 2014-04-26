(function() {
  var currentLanguage, el, otherlanguage, switchLanguage, _i, _len, _ref;

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

  document.getElementById("bitcoin-qrcode-link").onclick = function(event) {
    event.preventDefault();
    return document.getElementById("bitcoin-qrcode").className = '';
  };

  _ref = document.getElementsByClassName('toggle-section');
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    el = _ref[_i];
    el.onclick = function(event) {
      var target;
      event.preventDefault();
      target = event.target.parentNode.nextSibling;
      while (target && target.nodeType !== 1) {
        target = target.nextSibling;
      }
      return target.classList.toggle('hide-this');
    };
  }

}).call(this);
