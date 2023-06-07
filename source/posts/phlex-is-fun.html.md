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

[Phlex](https://www.phlex.fun) is an incredibly refreshing gem created by [Joel Drapper](https://github.com/joeldrapper). It introduces a remarkable way to build views in pure Ruby, as exemplified below:


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

Initially, you may wonder: Why? Why would you do that when HTML is already perfectly readable? Using Ruby here seems odd, detached from the underlying HTML I want to write.


However, let's examine a typical partial, such as the one from the .
[rubygems.org search show page](https://github.com/rubygems/rubygems.org/blob/5092832ce44d07b24a834f74afa9408e339d1ebf/app/views/searches/show.html.erb)

The specific details aren't crucial; I'm only presenting an excerpt. Take note of the nested conditionals within.


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

In this case, we find a significant amount of view logic nested within the HTML structure. To comprehend this template fully, one must examine both the HTML and the embedded Ruby code.

With Phlex, however, we can fundamentally transform how we perceive and write these views. We can easily isolate the logic from the HTML nesting, resulting in something like this:


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

The `template` method clearly displays the actual view logic of the full template. The appropriate instance methods provide the HTML. For me, Phlex isn't really about the HTML; in a way it is about everything else.

**We can write ruby and Phlex provides us the html tag methods we need.**

We have the freedom to choose the most suitable level of abstraction and refactor as we see fit. We have the elegance of Ruby at our disposal.

I am genuinely enthusiastic about Phlex. It has completely transformed how I approach views, paving the way for elegant abstractions [this one for forms](https://fly.io/ruby-dispatch/component-driven-development-on-rails-with-phlex/#a-form-component-that-automatically-permits-strong-parameters).

Working with your views as enjoyable as writing other ruby code.


