---
title: "If Everyone Can Code, Do We Still Need Product Managers?"
date: 2026-02-16
tags: ["product management", "ai", "vibe coding", "builder model"]
type: entry
summary: "The builder model is appealing and mostly wrong. Faster building means more need for someone deciding what to build, not less."
cover: "images/builder-pms.png"
links:
  - url: "https://www.lennysnewsletter.com/p/why-linkedin-is-replacing-pms"
    title: "Why LinkedIn is Replacing PMs"
    via: "Lenny's Newsletter"
  - url: "https://officechai.com/ai/vibe-coding-is-the-new-product-management-training-and-tuning-models-is-the-new-coding-naval-ravikant/"
    title: "Vibe Coding is the New Product Management - Naval Ravikant"
    via: "Office Chai"
  - url: "https://medium.com/is-that-product-management/the-era-of-the-builder-product-manager-4407fe54d2b4"
    title: "The Era of the Builder Product Manager"
    via: "Medium"
  - url: "https://www.atlassian.com/blog/artificial-intelligence/how-ai-turns-product-managers-back-into-builders"
    title: "How AI Turns Product Managers Back Into Builders"
    via: "Atlassian"
  - url: "https://cacm.acm.org/blogcacm/the-vibe-coding-imperative-for-product-managers/"
    title: "The Vibe Coding Imperative for Product Managers"
    via: "ACM"
  - url: "https://bryceyork.com/vibe-coding-prototypes/"
    title: "Vibe Coding Prototypes"
    via: "Bryce York"
  - url: "https://www.technologyreview.com/2025/12/15/1128352/rise-of-ai-coding-developers-2026/"
    title: "Rise of AI Coding Developers"
    via: "MIT Technology Review"
  - url: "https://www.bcg.com/publications/2025/ai-is-outpacing-your-workforce-strategy-are-you-ready"
    title: "AI Is Outpacing Your Workforce Strategy"
    via: "BCG"
  - url: "https://productschool.com/blog/artificial-intelligence/will-ai-replace-product-managers"
    title: "Will AI Replace Product Managers?"
    via: "Product School"
quotes:
  - text: "Vibe coding is the new product management."
    source: "Naval Ravikant"
    sourceUrl: "https://officechai.com/ai/vibe-coding-is-the-new-product-management-training-and-tuning-models-is-the-new-coding-naval-ravikant/"
---

![](images/builder-pms.png)

Something changed in the last year that I don't think we've fully processed yet.

PMs (regardless of the technical level) can wire-up full prototypes, not a Figma file, a working prototype with real API calls. PMs open-up pull requests, engineers review, clean it up, and ship! The whole cycle, from idea to production could take less than three days. A year ago, that same process would have started with a spec, sat in a backlog for two sprints, and gone through three rounds of "that's not what I meant." (yes that still happens but these are process bottle-necks and AI won't help here, a topic for another post :))

I started to see this happening everywhere. PMs are vibe-coding prototypes in Cursor. Designers are pushing CSS changes directly. Marketing people are building internal dashboards with Replit. The tools have gotten good enough that "I can't code" is no longer a permanent identity. It's a choice.

And this is starting to change how companies think about roles. LinkedIn's CPO [killed their APM program](https://www.lennysnewsletter.com/p/why-linkedin-is-replacing-pms) and replaced it with "full-stack builder" roles. Naval Ravikant says:

> "Vibe coding is the new product management."
>
> — Naval Ravikant

The question people keep asking, sometimes quietly, sometimes in all-hands meetings, is whether we still need a dedicated product management role at all.

The thesis goes like this: if the barrier to building software has collapsed, why keep a role whose main job was translating between "what customers want" and "what engineers build"? Why not just have everyone do both? Ship code in the morning, talk to customers in the afternoon, split the time evenly.

This idea has a name now. People are calling it the "builder model": dissolve the traditional PM, designer, and engineer boundaries. Everyone writes code, everyone talks to customers, everyone ships. No handoffs, no translators, no waiting on someone else to turn your idea into software. Some versions of this are modest (PMs should prototype more). Others are radical (the PM role itself is obsolete, just hire builders). [The Era of the Builder Product Manager](https://medium.com/is-that-product-management/the-era-of-the-builder-product-manager-4407fe54d2b4) captures the spirit: the old way of being a PM is dying, and the future belongs to people who can get their hands dirty.

I find the builder model appealing and mostly wrong. Here's why.

## The translation layer is compressing. That's real.

I don't want to dismiss what's changing. The gap between "I have an idea" and "I have a working prototype" used to be weeks. Now it's hours. Tools like Cursor, Replit, and Claude Code let someone with product intuition but no engineering background spin up something functional in an afternoon. [Atlassian wrote about](https://www.atlassian.com/blog/artificial-intelligence/how-ai-turns-product-managers-back-into-builders) how AI is turning PMs back into builders. The [ACM published a piece](https://cacm.acm.org/blogcacm/the-vibe-coding-imperative-for-product-managers/) calling vibe coding an imperative for product managers.

This matters. When a PM can show a working demo instead of writing a 10-page spec, conversations with engineering get better. Fewer misunderstandings. Faster iteration. That's a genuine improvement.

But prototyping is not the same as building.

## "Everyone can code" is not "everyone can build"

There's a gap between a vibe-coded prototype and production software that AI hasn't closed. Bryce York [made this point well](https://bryceyork.com/vibe-coding-prototypes/): vibe-coded output is isolated from production codebases. Engineers have to re-implement from scratch. That's not a handoff; it's a translation, and translation costs time (and I can say this because I have been on both side, so anecdotally, I know that's a fact).

The numbers back this up. A [study by METR](https://www.technologyreview.com/2025/12/15/1128352/rise-of-ai-coding-developers-2026/) found that:

> Experienced developers using AI tools believed they were 20% faster. Objective measurement showed they were actually 19% slower.
>
> — METR Study

Think about that for a second: developers felt faster and were measurably slower. Stack Overflow's 2025 Developer Survey found that trust in AI coding tools fell for the first time, even as adoption kept climbing.

I keep coming back to this distinction: making a demo work is engineering on easy mode. Making it work reliably, securely, at scale, for years, with other people's code touching it, that's still hard. And that's where the actual engineering skill lives.

## The builder model misdiagnoses the PM bottleneck

Here's where that builder thesis starts to fall apart for me. The argument starts from a real observation: PMs spend 60-70% of their time in meetings and have little time to innovate. The proposed solution is to give them coding ability so they can ship things directly.

But this solves the wrong problem. Those meetings aren't wasted time that coding could replace. Most of them exist because someone has to:

- Align stakeholders who want conflicting things
- Say no to 80% of feature requests without making enemies
- Synthesize messy, contradictory customer signals into a strategy
- Navigate internal politics to unblock engineering work
- Make prioritization decisions with incomplete information

All of these are (not so easy) judgment calls. None of them get easier because a PM can write code. Giving PMs coding ability without reducing their coordination load just adds another job on top of an already-overloaded role. Now you're asking them to attend six hours of meetings AND ship code. That's how you burn people out.

## Even distribution is a fantasy

The builder model assumes people can split time evenly across coding, customer conversations, strategy, and shipping. I think this ignores how human cognition actually works.

Deep coding requires flow state, uninterrupted blocks of two to three hours to do anything meaningful. Customer discovery is a different kind of work entirely: empathy, preparation, follow-through. Strategy means stepping back and thinking about what not to build. And then there are the meetings, which are pure context-switching.

Asking one person to do all four "evenly" means they do all four at a mediocre level. I've watched engineers who get pulled into too many customer calls lose their technical edge. I've watched PMs who try to code too much lose track of their customers. There's a reason specialization exists. It's not bureaucracy. People produce better work when they can stay in one mode long enough to actually think.

## Faster building means more need for someone deciding what to build

This is the argument most builder-model advocates skip over.

When shipping is cheap, you get more things shipped. More features, more experiments, more prototypes. Someone needs to decide which of those things should actually exist.

> With everyone building faster, there is now more product work to do, because someone needs to think about whether we should build all those things.
>
> — Bryce York

Without that filter, you get feature bloat, slop, inconsistent UX, and a product that tries to do everything for everyone and does nothing well. Cheap building makes the person who says "no, not that" more important, not less. That has always been the PM's actual job (and AI believe it or not is letting engineer get into that mindset as well).

## Where the builder model actually works

So is the builder model "wrong"? Not really, but It works in specific contexts:

Early-stage startups with fewer than 15 people. Developer tools where the builder is the customer. Internal tools where scope is limited and stakes are low. Consumer apps where one person can hold the entire problem in their head.

In these contexts, the overhead of having separate PM and engineering roles isn't worth it. A small team of builders who talk to users and ship code can outperform a larger team with handoff layers.

But scale that up. Try it with a healthcare SaaS product where someone needs to understand clinical workflows and regulatory requirements. Try it with an enterprise platform where 50 customers all want different things and the PM's job is figuring out which five to actually build. The person doing that work should not be spending half their time coding. They should be spending it with clinicians, or reading through support tickets, or arguing about roadmap priorities.

## What I think actually happens

I don't think the builder model replaces PM. I think what actually happens is less tidy:

Teams get smaller. A pod of two or three people does what used to require eight. The [BCG workforce report](https://www.bcg.com/publications/2025/ai-is-outpacing-your-workforce-strategy-are-you-ready) describes this shift as already underway across the industry.

PMs prototype more, but as communication tools. A PM vibe-codes a working demo to show engineering "this is what I mean." That replaces the spec, not the engineer.

Junior PM roles (could) disappear (yea that's a problem!). Entry-level PM work (writing specs, organizing feedback, tracking competitors) [gets automated](https://productschool.com/blog/artificial-intelligence/will-ai-replace-product-managers) and we need to rescope that role's job. Senior PMs who can do strategy, politics, and customer insight survive (till we figure out how to automate humans entirely, AGI or whatever we call it, automation all the way, also a topic for another post). There are fewer of them and they matter more.

The "what to build" question becomes the scarce "skill". As building gets cheaper, judgment is what separates good teams from bad ones (understanding pain points, discovery work, etc, becomes even more valuable). What to build, what to kill, what to say no to. AI can't automate those calls because they depend on knowing your customers and your constraints better than anyone else does.

Engineering shifts toward *systems work*. Engineers spend less time on CRUD features and more on architecture, performance, security, and reliability. The parts AI still gets wrong.

## The real question

I think we're asking the wrong question. "Should PMs code?" is less interesting than "how do we stop PMs from spending 70% of their time in meetings so they can actually think?"

Most PM meetings exist because organizations have communication problems (yea we are hacks for bad process which seems like an non-NP problem :D), not because PMs have too much free time. Better async tools, smaller teams, and clearer ownership structures would do more for PM productivity than giving them Cursor access.

The companies that do well with this won't be the ones where everyone does everything. They'll be the ones with small teams where each person has a clear job, and AI takes the friction out of working together. Roles don't dissolve. They just stop requiring three meetings to coordinate.

That's less romantic than "everyone's a builder." But I think it's closer to what actually works.
