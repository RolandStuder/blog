---
title: About service objects…
tags: [patterns, ruby, rails, concerns]
published: false
date: 2023-12-12
chat_gpt: none
---

It's a long standing debate, some love service objects, some hate them. Thought to be honest I haven't really read about people regretting using service objects, I have yet to read a blog article that says: "We used service objects and it was horrible."

And yet somehow I don't like to reach for them as the default. I think it's just the simplicity of having a method call like `order.place` instead of doing: `OrderPlacer.new(order).call`.

So let us walk through an example with some options let's say, we start with an intialized order and we want a process that does the following:

- charges the tokenized credit card
- updates the order state to `:pending`
- sends out confirmation emails to both merchant and customer

A fairly typical example and one I have seen and suffered as it was implemented by callbacks.

## Callback implementation

A callback implementation would look something like this:

```ruby
class Order
  before_save charge_tokenized_credit_card, if: :reseved?
  before_save :booked!, if: :fully_payed?
  after_commit :send_confirmation_emails, if: :just_booked?
end
```

Something like that would be the solution things mostly based on callbacks. It's drawbacks are obvious:

- It's hard to understand the order of things, the order of callback declarations may not actually be the order of execution.
- A lot of conditionals
- It's just generally hard to read, especially considering that this class will be filled with a ton of callbacks if we handle everything this way, making it almost impossible to see what is going on, this will get worse, if we include mutating other models, that may have their own callbacks.


