---
title: "Allowing Claude's agency, and getting dizzy"
date: 2026-10-27
tags: [ai, programming, change]
published: true
chat_gpt: none
---

I'm so confused. So dizzy. Things are moving so fast...

Six weeks ago, I described in ["A shift in agency"](/2026-a-shift-in-agency/), how AI is kind of like an overeager teenager that just wants to go ahead and do everything for me. Like it's storming off. And that I don't like this shift in agency. Then just around four weeks ago, I told the teenager: Okay, well, you go ahead. Show me what you can do.

Since then, I'm just dizzy from how fast things are moving.

I started experimenting harder, to see what it feels like when I let it do more. Just to see what happens.
Since then, I have...
-  sped up our server transaction times P50 by 60% and P95 by 85%, Requests over 2s went from 4.7% to 0.3%, all in a controlled manner, through iterative small changes, always measured. (To be fair our performance numbers were pretty bad)
- I have made myself a native OS X app that handles all my tasks and pulls in my Notion tickets and GitHub PRs, in a way that I barely need to touch Notion (which I despise), I open github only to look at some diffs. And it's all delivered to me on views tailored to me, including a performance view that shows all the experiments and improvements I have done, with A/B testing measurements.
-  I have replaced effectively the main view of our app, a calendar with a better performing version: client-side rendered, heavily cached, super performant. It's making the experience for customers 10 times better.
- I have set up a remote server for my development work, where I run my Claude sessions, because my Macbook suffocated in parallel Chrome sessions and test runs.
- We have brought down CI time from 35 minutes to five minutes (and we could easily bring it down more)
- We removed one of our two parallel Tailwind versions (don't ask) by rewriting a ton of Tailwind classes across many public pages. And Claude did it in a controlled manner comparing screenshots, and comparing every single DOM element's computed CSS...
- Taking care of smaller tickets is often now a thumbs up to a Github pull request.
- And the native App I built, is becoming already old news, as I now work through pure voice chats and Claude writes my tickets, dependencies... I am quickly arriving to a place where I need my screen only to review UIs and code diffs.

All of this within four weeks.

I'm just dizzy. It is scary what you can do. It's also very exciting.

For now I'm going with DHH finishing note on AI on the [Rails World 2026 keynote](https://www.rubyevents.org/talks/opening-keynote-rails-world-2026), as much as I hate to say it, and try to be an optimist and embrace it, and see what happens. So, with much confusion and restlessness, I step into these exciting confusing times, and just hope that it won't be our doom.