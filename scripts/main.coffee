currentLanguage = "javascript"
otherlanguage =
  coffeescript: 'javascript'
  javascript: 'coffeescript'

switchLanguage = (language) ->
  if language then language = language.toLowerCase()
  else language = otherlanguage[currentLanguage]

  currentLanguage = language

  elClass = (className, action, modifyClass) ->
    elements = document.getElementsByClassName(className)
    for el in elements
        el.classList[action](modifyClass)


  elClass("#{otherlanguage[language]}-code", 'add', 'hide')
  elClass("#{language}-code", 'remove', 'hide')

document.getElementById('select-language').onchange = (event) ->
  switchLanguage(event.target.value)

for el in document.getElementsByClassName('toggle-section')
  el.onclick = (event) ->
    event.preventDefault()
    
    target = event.target.parentNode.nextSibling
    while target and target.nodeType != 1
      target = target.nextSibling

    target.classList.toggle('hide-this')

timeSince = (date) ->
  date = new Date(date)  if typeof date isnt "object"
  seconds = Math.floor((new Date() - date) / 1000)
  intervalType = undefined
  interval = Math.floor(seconds / 31536000)
  if interval >= 1
    intervalType = "year"
  else
    interval = Math.floor(seconds / 2592000)
    if interval >= 1
      intervalType = "month"
    else
      interval = Math.floor(seconds / 86400)
      if interval >= 1
        intervalType = "day"
      else
        interval = Math.floor(seconds / 3600)
        if interval >= 1
          intervalType = "hour"
        else
          interval = Math.floor(seconds / 60)
          if interval >= 1
            intervalType = "minute"
          else
            interval = seconds
            intervalType = "second"
  intervalType += "s"  if interval > 1 or interval is 0
  interval + " " + intervalType

window.initClassyPluginList = (json) ->
  htmlStr = ''
  plugins = json?.query?.results?.json?.json
  if plugins.length
    sortedPlugins = plugins.sort (a, b) -> b.stars - a.stars
    pluginNode = document.getElementById('plugin-list')

    for plugin in sortedPlugins
      tr = document.createElement('tr')
      tdString = "<td><a href=\"#{plugin.website}\" target=\"_blank\">#{plugin.name}</a><br>#{plugin.description}</td><td>#{plugin.owner}</td><td>#{timeSince(plugin.updated)} ago</td>"
      tr.innerHTML = tdString
      pluginNode.appendChild(tr)