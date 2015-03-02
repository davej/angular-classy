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
  do (el) ->
    el.onclick = (event) ->
      console.log(event, el)
      event.preventDefault()

      target = el.parentNode.nextSibling
      while target and target.nodeType != 1
        target = target.nextSibling

      target.classList.toggle('hide-this')

animate = true
delayMilliseconds = 10000 # 10 seconds
delay = [0, 3500, 18000, 36000, 48000, 60000, 85000]

for el, index in document.querySelectorAll('.javascript-code section')
  do (el) ->
    window.setTimeout ->
      if animate
        el.className = 'active'
    , delay[index]

    window.setTimeout ->
      el.className = ''
    , delay[index + 1]

document.querySelector('.code-editor').addEventListener 'mouseover', (e) ->
  animate = false
  for el in document.querySelectorAll('.javascript-code section')
    el.className = ''

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
    # sortedPlugins = plugins.sort (a, b) -> b.stars - a.stars
    pluginNode = document.getElementById('plugin-list')

    for plugin in plugins # sortedPlugins
      tr = document.createElement('tr')
      tdString = "<td><a href=\"#{plugin.website}\" target=\"_blank\">#{plugin.name}</a><br>#{plugin.description}</td><td>#{plugin.owner}</td><td align='center'>#{plugin.stars}</td>"
      tr.innerHTML = tdString
      pluginNode.appendChild(tr)
