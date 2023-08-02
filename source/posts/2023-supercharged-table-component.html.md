---
title: 'Supercharged table component built with ViewComponent'
date: '2023-08-02'
tags: [view-components, phlex, ruby, rails]
chat_gpt: revision
---

When searching for examples of table components built with the ViewComponent gems, I was surprised to find none. After some inquiries, I came across examples that worked like this:


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

This approach is pragmatic, but personally, I prefer to think of tables in terms of columns. So, let's supercharge our table component to enable something like this:

```erb
<%= render TableComponent.new(data: @products) do |table| %>
  table.column("Name") { |product| link_to product.name, product }
  table.column("Description") { |product| truncate(product.description) } 
<% end %>
```

### Introducing the table component

Let's dive into the implementation:

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

  # By calling content, we ensure that the view component calls the block, and @columns get populated
  def before_render
    content 
  end

  class Column # a value object to hold the column definition
    attr_reader :label, :td_block

    def initialize(label, &block)
      @label = label
      @td_block = block
    end
  end
end  
```

The corresponding erb file keeps things simple, omitting thead, tbody, or any styling:


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

You may notice three peculiarities here that require explanation:

### Why not use slots?
The main challenge is that the ViewComponent gem does not have an official way to render a table cell multiple times with different data each time. Meaning you can't pass that while rendering a slot like this:

```erb
<%= @rows.each do |row| %>
  <%= column(row) %>
<% end %>
```

There is no way to pass arbitrary data from the component (in our example, the rows of the table) to a slot block while rendering it. Therefore, we handle column definitions ourselves instead of using slots.

### Using `before_render` to ensure the block is called

When you use the `TableComponent` like this, and don't call `content` at some point.

```erb
<%= render TableComponent.new(data: @products) do |table| %>
  table.column("Name") { |product| link_to product.name, product }
<% end %>
```

The ViewComponent gem won't actually call the block, and the column method calls won't happen. We use the `before_render` lifecycle method to ensure the block is called.

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

The block will actually return only the last string, which is `</div>`. To capture the entire block's HTML content, we use `view_context.capture(row, &column.td_block)`. This way, we ensure that all the HTML from the block is included.


So there you have it, an easy-to-use but highly flexible table component.


But this is just the beginning. You will be able to create more methods to handle special requirements and create title columns, image columns, and columns with action links.

```erb
<%= render TableComponent.new(data: @products) do |table| %>
  table.image_column :image, :featured_image
  table.title_column "Name", &:name
  table.column("Description", &:description)
  table.actions_column(:edit, :destroy)
<% end %>
```

You have the beginning of an abstraction here, that can be further extended. Stay tuned for more!