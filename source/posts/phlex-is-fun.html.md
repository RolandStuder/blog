---
title: 'Phlex is the better way to build your views'
date: Wed, 7 Jun 2023
draft: false
pinned: false
tags:
  - phlex
  - rails
  - ruby
description: "Phlex is completely changing how I look at views and I don't wand to go back"
---

[Phlex](https://www.phlex.fun) is amazing refreshing gem created by [Joel Drapper](https://github.com/joeldrapper). It provides a way to build views in pure Ruby, like this:

```ruby
class Nav < Phlex::HTML
  def template
    nav(class: "main-nav") {
      ul {
        li { a(href: "/") { "Home" } }
        li { a(href: "/about") { "About" } }
        li { a(href: "/contact") { "Contact" } }
      }
    }
  end
end
```

Now when you see this, you might think: Why? Why would you do that, html is perfectly readable You are using ruby here, it's weird, detached from the underlying html I want to write.

But then let's look at how an actual partial often looks like the following one.
[source: rubygems.org search show page](https://github.com/rubygems/rubygems.org/blob/5092832ce44d07b24a834f74afa9408e339d1ebf/app/views/searches/show.html.erb)

The specifics are not important, I only show an extract, but notice how there are quite a few conditionals in there, nothing unusual about that.

```erb
<% @title = "search" %>
<% if @error_msg %>
  <div class="errorExplanation">
    <p><%= @error_msg %></p>
  </div>
<% end %>
<%= link_to t("advanced_search"), advanced_search_path, class: "t-link--gray t-link--has-arrow" %>
<% if @yanked_filter %>
  <% @subtitle = t('.subtitle', :query => content_tag(:em, h(params[:query]))) %>

  <% if @yanked_gem.present? %>
    ...
```

So we have a lot of view logic in there nested in the structure of the html. To fully undesrstand this template I have to look at both the html and the embedded ruby code.

Now with phlex I can fundamentally change how I look and write this view, I can isolate the logic easily from the html nesting and I could end up with something like:

```ruby
class Searches::Show < Phlex::HTML
  def template
    error_messages
    if @yanked_filter
      yanked_search
    else
      header
      aggregations
      if @gems.any?
        search_results
      else
        suggestion_results
      end
    end
  end
end
```

The template method really shows the view logic and the html is provided by appropriate instance methods. So Phlex for me really is not about the html, it's about everything else. 
**We can write ruby and Phlex provides us the html tag methods we need.**

We get to choose the appropriate abstraction level, we can refactor as we like. We have all the elegance of ruby at our disposal.

I am incredibly bullish on Phlex, it completely changed the way I think about views. It paves the way to elegant abstractions like [this](https://fly.io/ruby-dispatch/component-driven-development-on-rails-with-phlex/#a-form-component-that-automatically-permits-strong-parameters) and makes working with your views as enjoyable as writing other ruby code.
