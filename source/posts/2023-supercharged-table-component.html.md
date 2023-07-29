---
title: 'Supercharged table component built with ViewComponent'
date: '2023-07-29'
tags: [view-components, phlex, ruby, rails]
draft: true
chat-gpt: none
---

When searching for examples for table components built with the view component gems, I was surprised to come up empty. Some asking around showed me examples that worked like this:

```erb
<%= render Table.new do |table| %>
  <%= table.with_header { "Name" } %>
  <%= table.with_header { "Description" } %>
  <% @products.each do |product| %>
    <%= table.with_row do |row| %>
      <%= row.with_cell { link_to product.name, product } %>
      <%= row.with_cell { product.description } %>
    <% end %>
  <% end %>
<% end %>
```

This is pragmatic, but when it comes to tables I like to think of it in terms of columns. So let us try to supercharge our table component and to enable something like this:

```erb
<%= render TableComponent.new(data: @products) do |table| %>
  table.column("Name") { |product| link_to product.name, product }
  table.column("Description") { |product| truncate(product.description) } 
<% end %>
```

### The table component

So here we go:

```ruby
class TableComponent < ViewComponent::Base
  attr_reader :columns
  def initialize(data:)
    @data = data
    @columns = []
  end

  def column(label, &block§)
    @columns << Column.new(label, &block)
  end  

  private

  # without calling content, the view component will never call the block, so @column remains emtpy
  def before_render
    content 
  end

  class Column # a value object to hold the column definition
    attr_reader :label, :td_block

    def initialize(label, &block)
      @label = label
      @td_block = td_block
    end
  end
end  
```

The erb file for it, to keep things simple we ommit `thead`, `tbody` or any styling or additional classes:

```erb
<table>
  <% @columns.each do |column| %>
    <th><%= column.label %></th>
  <% end %>
  <% @rows.each do |row| %>
    <tr>
      <% @columns.each do |column| %>
        <td>
          <%= view_context.capture(row, &column.td_block) %>
          <%# the capture ensures, that we do not only return the return of the block, but all the html from the block, see below %>
        </td>
      <% end %>
    </tr>
  <% end %>
</table>
```

You may notice three peculiarities here, that I should explain:

### Why not use slots?

The main challenge is that the the view components gem is that there is no official way to render a table cell multiple times but with different data every time. Meaning you can't pass that while rendering a slot like this:

```erb
<%= @rows.each do |row| %>
  <%= column(row) %>
<% end %>
```

There is just no way to pass arbitrary data from the component (in our example the rows of the table) to a slot while you are rendering it, on top of that whatever a component renders as `content` is cached in an instance variable. So we will do it without using slots, and instead handle column definitions ourselves.

### Using `before_render` to make sure the block is called

When you use the `TableComponent` like this, and don't call `content` at some point.

```erb
<%= render TableComponent.new(data: @products) do |table| %>
  table.column("Name") { |product| link_to product.name, product }
<% end %>
```

Then the view component gem never actually calls the block, so the `column` method calls never happen. We use the `before_render` lifecycle method to do that.

### What is this `view_context.capture(row, &column.td_block)` doing?

If in erb you define a column like this:

```erb
<%= render TableComponent.new(data: @products) do |table| %>
  <%= table.column("Name") do |product| %>
    <div><%= link_to product.name, product } %></div>
    <div><%= truncate(product.description)%></div>
  <% end %>
<% end %>
```

What the block actually returns, is only the last string, which is `</div>`, if in our component template we would only do `column.td_block.call(row)` it would only capture this last `</div>`, therefore we need to capture the block in the `view_context`, and whatever we pass to `view_context_capture` as arguments will be passed into the block.

So there you have it, an easy to use but very flexible table component.

But this is just the beginning, one can create create more methods to handle special requirements and create title columns, image columns, columns with action links. 

```erb
<%= render TableComponent.new(data: @products) do |table| %>
  table.image_column :image, :featured_image
  table.title_column "Name", &:name
  table.column("Description", &:description)
  table.actions_column(:edit, :destroy)
<% end %>
```

You have the beginning of an abstraction here, that can be nicely extended. Stay tuned for more!