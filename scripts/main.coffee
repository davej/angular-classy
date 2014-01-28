currentLanguage = "coffeescript"
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

document.getElementById('toggle-language').onclick= (event) ->
  event.preventDefault()
  switchLanguage()
