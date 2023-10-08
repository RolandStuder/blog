---
title: "RailsWorld 2023: Hotwire Edition"
date: '2023-10-07'
tags: [railsworld, conference, ruby, rails, turbo, hotwire]
chat_gpt: revision
---

The very first [RailsWorld](https://rubyonrails.org/world) conference, organized by the [Rails Foundation](https://rubyonrails.org/foundation), has concluded at the beautiful venue of Beurs van Berlage in Amsterdam, Netherlands. Approximately 700 attendees joined in to look at the future of Rails.

## RailsWorld 2023 was in many ways a "Hotwire" edition

![notes about turbo](https://cdn.masto.host/rubysocial/media_attachments/files/111/182/182/644/465/180/original/592ed6de7c1008e8.png)

The opening keynote and six talks primarily revolved around Hotwire, or you could count it as seven if you include Jason Charnes' talk, "Don't call it a comeback." The prevailing message seemed to be: "Yes, while the Rails API/SPA approach exists, but the sane path forward is Hotwire." It was repeatedly underscored that Rails remains a one-person framework. Rails ~~was~~ **is** empowering and revolutionary.

## Morphing and broadcasted refreshes come to Turbo

Turbo Drive, which currently replaces the HTML body by default, becomes more powerful. Soon Turbo will use morphing to make only minimal changes to the DOM, enhancing user experiences significantly. With this change, you can expect:
- Seamless preservation of scroll position
- Elimination of flickering
- Application of smooth CSS transitions

Turbo also implements the concept of server-side-triggered refreshes, allowing you to broadcast instructions to refresh a view following a model change, or directly from a controller or job.

You can find a demo video and more information here:
https://github.com/hotwired/turbo/pull/1019

Morphing and the concept to do refreshes after broadcast are hardly new. [Stimulus Reflex](https://docs.stimulusreflex.com) has employed morphing to update the page for years, and [CableReady::Updatable](https://cableready.stimulusreflex.com/guide/updatable.html), which allows listening to model requests for refreshes, has also been around for a while. But I am excited to see these concepts being adopted in Turbo and becoming more mainstream.

BTW: Be sure to check out and contribute to the Hotwire community hub at [hotwire.io](https://hotwire.io).


## Most impactful talk wasn't technical

![Notes about shape up](https://cdn.masto.host/rubysocial/media_attachments/files/111/192/507/293/553/209/original/657e235a091dcb72.png)


Ryan Singer's talk on "Shaping up in the real world" hit the mark. It addressed precisely the areas where I currently face challenges in our design and development process, leaving me with some homework to do.


## Great community

The community was a delight! I can't even count how many people I connected with, and it was just great to meet people whom I had previously only interacted with online. Also got to meet a lot of those people who significantly contribute to the Rails ecosystem. Everyone I said hi to was more than willing to spare time and nerd out and share experiences. I was also thrilled to connect with Philip, who shares my enthusiasm for Phlex. He provided me with some exciting ideas for creating an even more crazy yet cohesive form object with [Phlex](https://www.phlex.fun).


## Would I go again?

I attended because it was in Europe, offering proximity, and also providing an opportunity to meet my coworker living in Amsterdam. We have numerous great conferences here in Europe, so there's no need for long flights and the stress of adjusting to different time zones. Personally, a crowd of 700 people was a bit too much for me. I am going to try smaller gatherings in the future.

I'd also like to give a shout-out to Pelle, my coworker, for being an excellent host (though he might want to step up his game in the restaurant recommendation department ;-) ).
