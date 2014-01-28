window.app = app = {}

app.currentLanguage = "coffeescript"
app.otherlanguage = 
  coffeescript: 'javascript'
  javascript: 'coffeescript'

app.switchLanguage = (language) ->
  if language then language = language.toLowerCase()
  else language = app.otherlanguage[app.currentLanguage]

  app.currentLanguage = language

  elClass = (className, action, modifyClass) ->
    elements = document.getElementsByClassName(className)
    for el in elements
        el.classList[action](modifyClass)


  elClass("#{app.otherlanguage[language]}-code", 'add', 'hide')
  elClass("#{language}-code", 'remove', 'hide')

document.getElementById('select-language').onchange = (event) ->
  app.switchLanguage(event.target.value)

document.getElementById('toggle-language').onclick= (event) ->
  event.preventDefault()
  app.switchLanguage()
