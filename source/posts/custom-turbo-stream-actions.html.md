---
title: Custom turbo stream actions
date: '2022-05-15'
language: en
---

Turbo Hotwire is neat, I really like the simplicity of Turbo frames. But after having used [CableReady](http://cableready.stimulusreflex.com) the turbo streams feel a bit limiting. I was surprised, when I could not find any gem/package that enhances turbo streams to create custom turbo actions.

Let's say if you want to redirect to a new page after some job is done, 
or you want to reset a form, 
there is no way to do that with a turbo stream action. With CableReady you could do 
`cable_ready.redirect_to(url: some_url)` ([docs](http://cableready.stimulusreflex.com)).

So I was wondering how one would go about creating custom turbo stream actions.
From how DHH (the original creator of Rails) has discussed turbo streams, it is unlikely that turbo will support more actions, there is a
[pending PR](https://github.com/hotwired/turbo/pull/479) but not much has moved.

So what can we do today?

## Stimulus controllers to the rescue

We can mimic the pattern turbo streams use with StimulusJS. StimulusJS has a lifecycle method called connect, that is executed when a new element with a stimulus controller is added to the DOM.

For the redirect example, we can write something like this:

```js

import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
	  // take a value as an argument where to redirect
    static values = { url: String } 
    connect() {
    	// perform wanted behavior
	    Turbo.visit(this.urlValue)
	    // clean up after action is executed
      this.element.remove()
    }
}
```

So the following html added anywhere in the body would perform a redirect:

```html
<template data-controller="redirect" data-redirect-url-value="<%= your_redirect_url %>"></template>
```

So with a turbo stream we can attach this to the body:

```erb
  <%= turbo_stream.append_all "body" do %>
  	<template data-controller="redirect" data-redirect-url-value="<%= your_redirect_url %>"></template>
  <% end %>
```

And the browser will redirect, given this turbo stream response. BTW: We use `append_all` so we can append to the body, withouth having to rely on the presence of an element with a certain id.

## Better developer experience

It's not the most elegant solution, but it works and has only little overhead. We can improve the developer
experience by writing a helper to allow something like:

```erb
<%= turbo_stream_action :redirect, url: "http://www.rstuder.ch" %>
```

So we can write a helper that creates a turbo stream tag that will append to the body and 
convert a hash of values to values for a stimulus controller:

```ruby
module TurboStreamHelper
  def turbo_stream_action(action, **values)
    controller_name = action.to_s.dasherize

    data_attrs = {
      "data-controller" => controller_name
    }

    data_attrs = values.each_with_object(data_attrs) do |(key, value), attrs|
      attrs["data-#{controller_name}-#{key.to_s.dasherize}-value"] = value
    end

    turbo_stream.append_all "body" do
      content_tag(:template, nil, data_attrs.merge)
    end
  end
end
```

So we got a simple API around some conventions, that gives us the power to create custom actions and invoke them with arguments 
from a turbo stream template.

## Conclusion

Turbo streams with Stimulus Controllers give us enough power to achieve custom actions. Without further dependencies. If you
use CableReady anyway, then have a look at 
[this package from the wonderful Marco Roth](https://github.com/marcoroth/cable-streams) 
that enables you to use the cable ready operations with turbo streams. 
