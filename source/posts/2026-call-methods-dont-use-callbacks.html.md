---
title: "Damn them callbacks..."
date: 2026-02-21
tags: [rails, ruby, programming]
published: false
chat_gpt: none
---

I often heard: "Don't use callbacks", and it always rang wise to me.
But for a long time I struggled to see how I could get around them,
Rails makes them a bit too easy to use and reach for.

Let's take an example: You have an order model. Let's say we have:

```ruby
class Order < ApplicationRecord
  enum :status, [:processing, :paid]
end
```

Now we want to send out an confirmation email, once the order has been paid.

```ruby
class Order < ApplicationRecord
  enum :status, [:processing, :paid]
  after_commit :send_confirmation_email, if: -> { status_previously_changed? && paid? }
end
```

Well this already smells, the `if` is kinda hard to read. And that is with this one callback, and this is one of many callbacks to come. A lot has to happen, once an order is paid for. Now of course this is not the full story, actually a payment has to happen for the order to become paid.

Let's see how this shapes up, if we instead make an explicit method for this:

```ruby
class Order < ApplicationRecord
	def pay
		transaction do
			return unless execute_payment
			paid!
		end
		send_confirmation_email_later
		update_inventory
		reserve_product
end
```

This is much clearer. No side effects. And fewer suprises. Of course this forces you to actually use these methods.
If there is another path that sets the payment status, then it won't trigger the email. But I think that is a good thing.

And in reality there is are often multiple things happening, multiple callback that might get triggered, so having a dedicated method is just so much easier to reason
about than a random number of callbacks, especially if the callbacks mutate data and therfore might need to be executed in a certain order.
Then your only hope to disentalge things are if you have proper tests.

This approach also works amazing with validation contexts:

```ruby
module Campaign::Launchable
  extend ActiveSupport::Concern

  included do
    with_options on: :launch do
    	validates_presence_of :name
    	validate :at_least_three_tiers
  	end
  end

  def launch(params = {})
  	assign_attributes(params.merge(enabled: true, enabled_at: Time.current))
    save(context: :launch)
  end
end
```

In the controller you call `@campaign.launch(campaign_params)` and you can treat it like a regular update to the model.
This keeps things super simple in the controller with a nice API.


```ruby
module BlogPost::Publishable
  extend ActiveSupport::Concern

  included do
    validates :title, :body, presence: true, on: :publish
  end

  def publish
    assign_attributes(published_at: Time.current)
    save(context: :publish)
  end

  def published?
    published_at.present?
  end
end
```

```ruby
class BlogPostsController < ApplicationController
	def update
		if params[:commit] == "publish"
			if @blogs_post.publish()

	end

