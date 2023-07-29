---
title: 'Supercharged table component built with ViewComponent'
date: '2023-07-29'
tags: [view-components, phlex, ruby, rails]
draft: true
---

```erb
<%= render TableComponent.new(data: @products) do |table| %>
  table.column("Name") { |product| link_to product.name, product }
  table.column("Description") { |product| truncate(product.description) } 
<% end %>
```

But we will not stop there and show how you can add thing like special columns and alternative mobile views.


## Supercharging with special columns

But not all columns are created equal, we may have columns that are more important, or that should enable edit or delete actions. So let us build something so we can do:

```erb
<%= render TableComponent.new(data: @products) do |table| %>
  table.image_column :image, :featured_image
  table.title_column "Name", &:name
  table.column("Description", &:description)
  table.actions_column(:edit, :destroy)
<% end %>
```

You can insert different kinds of columns into you `@columns` list, for example with something like the image column.

### Image column

To support a image column we add another instance method and add a new column class:

```ruby
class TableComponent < ViewComponent::Base
  def image_column(label, attachment_name)
    @columns << ImageColumn.new(label, attachment_name)
  end  

  class ImageColumn
    include ActionView::Helpers::AssetTagHelper

    attr_reader :label

    def initialize(label, attachment_name)
      @label = label
      @attachment_name = attachment_name
    end

    def td_block
      lambda { |entry|
        image_tag entry.public_send(@attachment_name)
      }
    end
  end
end  
```

We included the asset tags helpers and define our own lambda that gets rendered in the view. This is just to illustrate one of the many possibilities how you could make special columns.

Whether it makes sense to make a special column type of course depends on how often you need it, this is to show off the abstraction possibilities, I would only create more column types as we see a repeated need for it.

### Other w