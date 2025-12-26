---
title: "The basecamp / 37signals way of programming rails"
date: 2025-12-26
tags: [rails, dev]
published: true
---

37signals has a new product Fizzy. I don't care much for the product, a kanban board. But the amazing thing is that all the [code is open source](https://github.com/basecamp/fizzy). And Jorge Manrubia has made two videos where he goes through the codebase and answers questions. 

- Video 1: [How we architect Rails apps at 37signals: a Fizzy tour](https://www.youtube.com/watch?v=dvPXFnX60cg)
- Video 2: [Addressing assorted Rails questions about Fizzy: testing, fixtures, AI, the view layer, and more.](https://www.youtube.com/watch?v=QNqmAxxKzp4)

I found it most enlightening how they think about the models directory, and how they think about complex operations where many people reach for service objects. Highly recommend checking out these videos and the code base.