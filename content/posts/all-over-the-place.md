+++
title = "All over the place..."
date = "2019-06-10"
draft = false
pinned = false
description = "CORS, SimpleForm, Materialize.css, Rails Associations und vieles mehr aufs Mal ist vielleicht zu viel."
+++
In einer Woche habe ich viel gelernt:

## CORS

Nein, man kann nicht mal einen `get` request an eine fremde Domain schicken, ausser man setzt auf dem Server, der die Website ausliefert die entsprechenden CORS Headers mit.

Erst dank `vue-resource` habe ich es [so](https://stackoverflow.com/a/39052894/2037537) geschaft, das mit `jsonp` zu lösen.

Aber das Session Grid auf [Open Data Forum Microsite](https://opendataforum.netlify.com/), wird jetzt automatisch aus dem Google Sheet aktualisiert.

## Reales Projekt gesucht!

Ich wünsche mir ein reales Projekt, das ich mit Rails gut umsetzen kann, etwas wo ich dran bleiben kann und es auch sauber lösen kann. Ich denke, das ist lernreicher als irgendwelche vorgeschlagenen Übungsprobleme, weil ich die Problemdefinitionen selbst machen muss.

Aktuell zur Auswahl stehen
* Innovationsprojekt (geheim)
* Tool Finanztransparenz: Teile deine Zahlen als Freelancer oder Unternehmer
* Tool Anmeldeservice für Event
* Sichtbarmachung von Skills und Rollen im Effinger

## Übungsprojekt Erfahrungen

Aktuell konnte ich an einem Innovationsprojekt (geheim!) üben, es dort habe ich sofort erlebt, dass ich ja liefern will, und ich damit unschönes und unfertiges stehen lasse. Das ist die grosse Herausforderung...

Was ist erfahren habe:

* Grundprinzipien wie Routing / Controller verhängen, verstehe ich jetzt gut.
* Einführung vieler Gems aufs Mal ohne Erfahrung ist eher ein Risiko (`simple_form`, `sass-materialize`, `materialize-form` oder so ähnlich). Zum Teil haben die Gems nicht das Erwartete geboten, dann hatte ich auch Probleme beim Versuch ein Select mit Stimulus.js zu verhängen.
* `$(this).closest('form').submit()` funktioniert nicht, wenn man eine Format `:js` response geben will. Habe dann einen Submit-Button versteckt und mit `click()` submitted (Don't judge).
* Für Formulare mit `remote: true`, braucht es auch `authenticity_token: true` und wenn ich eine `format.js` response will, muss man noch `format: :js` fürs form als Option mitgeben.
* Für Associtions gibt es in `simpleform`-Gem einfache Helpers, aber ich verstehe noch nicht so gut, wie `selects` generiert werden, da fühle ich mich nicht sattelfest mit `f.select`, `collection_select`, `options_for_select` (vor allem wenn ich ja will, dass die aktuellen Values im Edit Form erscheinen.

## All over the place

So kam es mir letzte Woche vor, ich muss aufpassen, dass ich mich nicht verzettle, bewusst entscheiden, was ist zum Lernen, was ist zum Liefern… Andererseits habe ich gespürt, dass mich von allem was ich mir zu Lernen überlegt habe, klar das Programmieren am meisten packt.
