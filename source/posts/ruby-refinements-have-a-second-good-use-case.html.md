---
title: "Ruby refinements have a second good use case."
tags: [ruby]
date: 2020-11-16
---
According to Bradley [Refinements have one good use case](http://www.soulcutter.com/articles/ruby-refinements-have-one-good-use-case.html): Conversion Wrappers. I humbly present the second one.

---


Monkey patching in Ruby is a simple as:

```ruby
class String
  def red
    "\e[#31m#{self}\e[0m"
  end
end
```

But what if you don't to pollute the `String`-class for users of your Gem? In the worst case you might actually overwrite a monkey patch provided by the developer. We faced this when we wanted to provide coloring of strings for our logger in [StimulusReflex](https://docs.stimulusreflex.com/). We wanted our users to be able to write a configuration proc like this:

```ruby
config.logging = proc { "#{timestamp.cyan} #{reflex_id.red}" }
```

## Enter `refine`

With refinements we were able to monkey patch only where explicitly called for it:

```ruby
module Colorize
  refine String do
    def red
      "\e[#31m#{self}\e[0m"
    end
  end
end
```

Now you can activate this monkey patch in whatever class you need it:

```ruby
class Logger
  using Colorize
  def error
    "Ooops".red
  end
end
```

# A complication

Procs are a convenient solution, however they get the binding/context of where they are defined, not of where they are called. Just calling the proc in our `Logger`class will not make use of the `colorize`-refinement, actually no method of the `Logger`class is available to the proc, because it was defined in a completely different context (in an initializer of the gem user).

So we made use of [instance_eval](https://apidock.com/ruby/Object/instance_eval)

```ruby
class Logger
  using Colorize
  def log
    puts instance_eval(&config.logging)
  end
end
```

See the commit for [adding colorize](https://github.com/hopsoft/stimulus_reflex/pull/337/commits/ef5e8d0047962740dd5e48919e1c5d3571172d9a) and [using instance_eval](https://github.com/hopsoft/stimulus_reflex/pull/337/commits/0e301d63951eb1910983ddb7c9a934d7d1225e58)

---

Originally posted on [dev.to](https://dev.to/rolandstuder/ruby-refinements-have-a-second-good-use-case-42jk)