---
title: Delegated Types are an alternative to Single Table Inheritance
date: '2022-07-07'
language: en
---

[Delegated types](https://api.rubyonrails.org/classes/ActiveRecord/DelegatedType.html) got quite a lot of attention when DHH was [tweeting about it](https://twitter.com/dhh/status/1323936556424564736)
But from what I heard from conversations with many people, 
I believe they have been poorly understood. 
By me in particular. 
Too often they are mentioned as flavour around polymorphic associations. 

While one could look at delegated types as convenience methods around polymorphic associations,
DHHs intention was a quite different one.

## The API does not make sense for convenience around polymorphic associations

So let's have a look at what delegated types provide:

Given a model that has a polymophic association with some other models, 
we can declare delegated types as such. 
I will itentionally start with "misguided" example

```ruby
class Recommendation < ApplicationRecord
  delegated_type :recommendable, types: %w[ Wine Winery ]
end
```

So a recommendation that can be for a wine or a winery. 
Now we have access to methods like these:

```ruby
Recommendation.wines        # => Recommendation.where(recommendable_type: "Wine")
@recommendation#wine?       # => true when recommendable == "Message"
@recommendation#wine        # => returns the wine record, when recommendable_type == "Wine", otherwise nil
Recommendation.wineries     # => Recommendation.where(entryable_type: "Comment")
```

Nice stuff. 
However this kinda confusing, let's look at one example:

What does `Recommendation.wines`  return? 
Since the method is called `wines`, I woud expect to get the wine records back. 
But that is not what happens.
I get the`recommendation` records that are **for wines**, instead.

I found this API very confusing. 
So much so, that I proposed in a [pull request](https://github.com/rails/rails/pull/41506) 
to add aliases for some of the methods.
Allowing calls like `Recommendation.for_wines`,
which makes it more obvious that this is returning recommendation records, 
rather than wine records.

## So what is going on here? Why is this so confusing?

I often wondered about the name, and talking with other people about the PR I realized something.
I missunderstood the intention behind delegated types.

An extract from the [documentation](https://api.rubyonrails.org/classes/ActiveRecord/DelegatedType.html) on delegated types:

```
You can get around the pagination problem by using single-table inheritance, b
ut now you're forced into a single mega table with all the attributes from all subclasses. 
No matter how divergent. If a Message has a subject, but the comment does not, 
well, now the comment does anyway! 
So STI works best when there's little divergence between the subclasses and their attributes.
```

Actually if you read the entire docs, 
it fully introduces delegated types not as convenience around polymorphic associations. 
They are presented as as an alternative to single table inheritance or multiple tables.

So if you have objects that you want to list / query together,
delegated types are a good option.

So if you look at it that way
the API and the name `DelegatedType` start to makea lot more sense. 
While `Recommendation.wines` will return records of the `reccomendations` table,
it is because we declared wrongly that a recommendation for a wine **is of type Wine**, its delegated type **is** wine.

**This will make way more sense, once I show the more reasonable example:**

## A fitting example

```ruby
class Product
	delegated_type :purchasable, types: %w[Wine Bundle Voucher]
end
```

So let's say we build some kind of shop where we sell wine, bundles of wines, but also vouchers.
We really want to be able to query them from one table, and paginate them, but they vary widely in terms of attributes, so STI (single table inheritance) is not a great solution.

This is where delegated types come in. We can have the shared attributes of the products table, like product_number, price, stock, published…
But we can also have any attributes we need on the specific table: Maybe a Voucher has an expiration, a bundle will have multiple wines as an assocation…

**So with delegated types we consider the `wine` record to be the "joined row" of the
`products` table and the `wines` table.**

Whatever we need to know from the product `wine` we either get from the product record or its delegated type, hence the name…

```ruby
class Product < ApplicationRecord
  delegated_type :purchasable, types: %w[Wine Bundle Voucher]
  delegate :display_name, to: :purchasable
end

class Wine < ApplicationRecord
  def display_name
    name + vintage
  end
end

class Bundle < ApplicationRecord
  has_many :wines
  
  def display_name
    "#{name} (#{wines.count} wines)"
  end
end

class Voucher
  def display_name
  	"#{amount}$ Voucher"
  end
end
```

So you will have some aspects on the Product, and more specific aspects on the delegated types. 
You can leverage OOP polymorphism and be way more flexible than you are with STI.

So delegated types can be a powerful tool, when you want something to live on one table, so it is easily queryable
and sometimes more importantly you can make use of pagination with it.


