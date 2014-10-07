(function() {
  var currentLanguage, el, otherlanguage, switchLanguage, timeSince, _i, _len, _ref;

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
    var htmlStr, plugin, pluginNode, plugins, sortedPlugins, tdString, tr, _j, _len1, _ref1, _ref2, _ref3, _results;
    htmlStr = '';
    plugins = json != null ? (_ref1 = json.query) != null ? (_ref2 = _ref1.results) != null ? (_ref3 = _ref2.json) != null ? _ref3.json : void 0 : void 0 : void 0 : void 0;
    if (plugins.length) {
      sortedPlugins = plugins.sort(function(a, b) {
        return b.stars - a.stars;
      });
      pluginNode = document.getElementById('plugin-list');
      _results = [];
      for (_j = 0, _len1 = sortedPlugins.length; _j < _len1; _j++) {
        plugin = sortedPlugins[_j];
        tr = document.createElement('tr');
        tdString = "<td><a href=\"" + plugin.website + "\" target=\"_blank\">" + plugin.name + "</a><br>" + plugin.description + "</td><td>" + plugin.owner + "</td><td>" + (timeSince(plugin.updated)) + " ago</td>";
        tr.innerHTML = tdString;
        _results.push(pluginNode.appendChild(tr));
      }
      return _results;
    }
  };

}).call(this);
