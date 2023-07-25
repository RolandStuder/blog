---
title: 'More expressive APIs with View Components'
date: '2023-07-26'
tags: [view-components, phlex, ruby, rails]
draft: false
chat-gpt: revision
---

[View components](https://viewcomponent.org) offer two primary ways to interact with the component: passing arguments to the initializer and using slots:

```ruby
render SomeComponent.new(some_params) do |component|
  component.with_some_slot(some_other_params) { "My slot content" }
end
```

Having worked with [Phlex (the better way to build views in Ruby)](/phlex-is-fun), I came to appreciate calling methods directly on the component. While the slot API offers a lot and is versatile, it can sometimes feel like you have to work around it rather than with it.

Let's consider a `BreadCrumbsComponent` as an example. Traditionally, one might pass in all the data using an array of hashes, like this:


```ruby
BreadCrumbsComponent.new([
  {label: "Home", url: root_path},
  {label: "Settings", url: settings_path},
  {label: "Notifications", url: settings_notifications_path}
])
```

However, I prefer a more expressive API like this:


```ruby
BreadCrumbsComponent.new do |bread|
  bread.crumb "Home", root_path
  bread.crumb "Settings", settings_path
  bread.crumb "Notifications", settings_notifications_path
end
```

## Solution with lambda slots

To achieve the desired API using the ViewComponent gem, we can utilize [lambda slots](https://viewcomponent.org/guide/slots.html#lambda-slots):

```ruby
class BreadCrumbsComponent < ViewComponent::Base
  renders_many :crumbs, -> (label, url) { @paths << {label: label, url: url} }
end
```

With a lambda slot, you can create a similar API, though it forces you to use specific method naming, as you will need to call `c.with_crumb("Home", root_path)` in the template.


```ruby
BreadCrumbsComponent.new do |c| 
  c.with_crumb "Home", root_path
end
```

However, there is an issue here. When iterating through the `@paths` supposedly set by the slot calls, you will notice that it doesn't work as expected. The `with_crumb` method did not have any effect. 
Why? ViewComponent only calls the block if you make a call to the accessor method for those slots, in this case `crumbs`, which is what you do when in your template you are calling `crumbs.each …`. This means that even if you don't render the slots, you still need to call the accessor method for it, a hint that we are somewhat abusing slots in this scenario.


## Better solution

My preferred approach would be to directly call an instance method on the component, like this:

```ruby
class BreadCrumbsComponent < ViewComponent::Base
  def crumb(label, url)
    @paths << {label: label, url: url}
  end
end
```

Now this should work seamlessly:

```ruby
BreadCrumbsComponent.new do |bread|
  bread.crumb "Home", root_path
end
```

However the same caveat applied. The block is not called.

To address this issue, I explored how I could call the block myself. 
The [block is stored](https://github.com/ViewComponent/view_component/blob/3487283035bbcb868e46f93fcfb6abadfeed650a/lib/view_component/base.rb#L105) 
in `@__vc_render_in_block`, a *very private looking* instance variable.

Then I realized that a call to `content` would invoke the block. 
The solution is to add a  `before_render` [lifecycle method](https://viewcomponent.org/guide/lifecycle.html).
This calls the block and like this the `crumb` method calls on the component will be performed as expected. So our component ruby file can look like this:


```ruby
class BreadcrumbsComponent < ViewComponent::Base
  attr_reader :paths

  def before_render
    content # ensures that block is called
  end

  def initialize(&block)
    @paths = []
  end

  def crumb(label, url)
    @paths << {label: label, url: url}
  end
end
```

For further use, it would be a good idea to extract this into a module like `ViewComponent::CallBlock` (or a better named module), and to then simply include it.

While some may argue that passing this data directly might be a cleaner approach since it is essentially data, I wanted to explore if I could achieve this particular API with a view component.

In conclusion: With a small tweak you can, directly calling instance methods on the component to shape your component. This way you can offer a very expressive and straightforward API.
