(function() {
  var animate, currentLanguage, delay, delayMilliseconds, el, index, otherlanguage, switchLanguage, timeSince, _fn, _fn1, _i, _j, _len, _len1, _ref, _ref1;

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

  _ref = document.getElementsByClassName('toggle-section');
  _fn = function(el) {
    return el.onclick = function(event) {
      var target;
      console.log(event, el);
      event.preventDefault();
      target = el.parentNode.nextSibling;
      while (target && target.nodeType !== 1) {
        target = target.nextSibling;
      }
      return target.classList.toggle('hide-this');
    };
  };
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    el = _ref[_i];
    _fn(el);
  }

  animate = true;

  delayMilliseconds = 10000;

  delay = [0, 3500, 18000, 36000, 48000, 60000, 85000];

  _ref1 = document.querySelectorAll('.javascript-code section');
  _fn1 = function(el) {
    window.setTimeout(function() {
      if (animate) {
        return el.className = 'active';
      }
    }, delay[index]);
    return window.setTimeout(function() {
      return el.className = '';
    }, delay[index + 1]);
  };
  for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
    el = _ref1[index];
    _fn1(el);
  }

  document.querySelector('.code-editor').addEventListener('mouseover', function(e) {
    var _k, _len2, _ref2, _results;
    animate = false;
    _ref2 = document.querySelectorAll('.javascript-code section');
    _results = [];
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      el = _ref2[_k];
      _results.push(el.className = '');
    }
    return _results;
  });

  timeSince = function(date) {
    var interval, intervalType, seconds;
    if (typeof date !== "object") {
      date = new Date(date);
    }
    seconds = Math.floor((new Date() - date) / 1000);
    intervalType = void 0;
    interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      intervalType = "year";
    } else {
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) {
        intervalType = "month";
      } else {
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
          intervalType = "day";
        } else {
          interval = Math.floor(seconds / 3600);
          if (interval >= 1) {
            intervalType = "hour";
          } else {
            interval = Math.floor(seconds / 60);
            if (interval >= 1) {
              intervalType = "minute";
            } else {
              interval = seconds;
              intervalType = "second";
            }
          }
        }
      }
    }
    if (interval > 1 || interval === 0) {
      intervalType += "s";
    }
    return interval + " " + intervalType;
  };

  window.initClassyPluginList = function(json) {
    var htmlStr, plugin, pluginNode, plugins, tdString, tr, _k, _len2, _ref2, _ref3, _ref4, _results;
    htmlStr = '';
    plugins = json != null ? (_ref2 = json.query) != null ? (_ref3 = _ref2.results) != null ? (_ref4 = _ref3.json) != null ? _ref4.json : void 0 : void 0 : void 0 : void 0;
    if (plugins.length) {
      pluginNode = document.getElementById('plugin-list');
      _results = [];
      for (_k = 0, _len2 = plugins.length; _k < _len2; _k++) {
        plugin = plugins[_k];
        tr = document.createElement('tr');
        tdString = "<td><a href=\"" + plugin.website + "\" target=\"_blank\">" + plugin.name + "</a><br>" + plugin.description + "</td><td>" + plugin.owner + "</td><td align='center'>" + plugin.stars + "</td>";
        tr.innerHTML = tdString;
        _results.push(pluginNode.appendChild(tr));
      }
      return _results;
    }
  };

}).call(this);
