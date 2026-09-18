# Personal blog of Roland Studer

to run locally
* `bundle install`
* `bundle exec middleman server`
## Tracks

Music pieces live in `source/tracks/<slug>/` (see the `tracks` blog in `config.rb`).
With `page: true` in the front matter a piece gets a full-page experience from its own
`_page.erb`, `page.css` and `page.js`. Scripts for turning a MIDI export into key
animations are in `tools/` (see `tools/README.md`).
