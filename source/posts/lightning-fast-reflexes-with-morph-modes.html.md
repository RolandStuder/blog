---
title: "Lightning fast reactive action with Stimulus Reflex partial morphs"
date: "2020-09-22"
tags: [rails, stimulus_reflex]
---

[Stimulus reflex](https://docs.stimulusreflex.com/) is an awesome way to build reactive single-page-like applications with Ruby on Rails, with minimal Javascript.

The newest update v 3.3.0 introduces [partial morphs](https://docs.stimulusreflex.com/morph-modes#selector-morphs), that don't go through the controller action anymore, and it allows us to make reflexes lightning fast.

## How does a reflex action work? (simplified)

* You **trigger a reflex** on the client (by data attribute, or in a stimulus method).
* Your **server side `Reflex` executes**, where you can trigger jobs, set instance variables, do db-stuff.
* Then the **original controller action is performed**, but with the newly set instance variables and any updated state of the database.
* The page on the **client updates** with morphdom over a websocket connection.

So this gives us a lot of convenience as we reuse all the logic of the original controller action that rendered a page initially.
However this convenience also means that every reflex can only be about as fast as the controller action it performs.

## Introducing `morph :selector`

This release will introduce [different morph modes](https://docs.stimulusreflex.com/morph-modes#introducing-morph-modes)
that allow you to skip the controller action and instead render a partial, a view_component or a string, that you then morph into the page.

## Let us look at an example:

In my application I have a timeline with 21 days where I can add orders to those days. Executing the controller action and rendering takes around 180ms,
which is not horrible, but definitely not great.

![Timeline with orders](https://dev-to-uploads.s3.amazonaws.com/i/sv9alzxhk77va2lf32jm.png)

To delete an item in the timeline we can have a simple reflex:

`timeline_reflex.rb`
```ruby
def delete
  ScheduledOrder.destroy(element.dataset[:scheduled-order-id])
end
```
which is triggered from  a simple button with the right data attributes

```erb
<button data-reflex="click->My::TimelineReflex#delete" data-scheduled-order-id="<%= order.id %>">
```

So simple, so slim, so convenient.

But every delete reflex action, will include those 180ms to execute the controller action, meh.

## Speeding up with with partial morph.

Now we can leverage only doing a partial update.

`timeline_reflex.rb`:

```ruby
def delete
  # we delete
  ScheduledOrder.destroy(element.dataset[:order_id])
  
  # we get all the data we need to render the component
  @date = element.dataset[:date]
  @pauses = current_user.pauses
  @scheduled_orders = current_user.scheduled_orders.where(date: @date)
  
  # we call morph with a selector and pass the rendered component into it.
  morph "##{day_dom_id}", ApplicationController.render(My::TimelineDayComponent.new(day: @date, scheduled_orders: @scheduled_orders, pauses: @pauses))
end
```

Now instead of doing all the controller action stuff, and rendering 21 days components. We just render one day component.
So our time to execute the reflex action goes down from 180ms to about 30ms. **30 milliseconds!**

With partial morphs we get SPA-speed interactions, without ever having to handle client side state. I love it!

---

Originally posted on [dev.to](https://dev.to/rolandstuder/lightning-fast-reactive-action-with-stimulus-reflex-partial-morphs-2fg5)
