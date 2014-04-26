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

document.getElementById("bitcoin-qrcode-link").onclick = (event) ->
  event.preventDefault()
  document.getElementById("bitcoin-qrcode").className=''

for el in document.getElementsByClassName('toggle-section')
  el.onclick = (event) ->
    event.preventDefault()
    
    target = event.target.parentNode.nextSibling
    while target and target.nodeType != 1
      target = target.nextSibling

    target.classList.toggle('hide-this')