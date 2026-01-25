---
title: "Jacks of All Trades, Masters of One, and the Model Production Frontier!"
date: 2024-06-25
tags: ["ai", "strategy", "economics"]
type: entry
summary: "Do the right thing!"
---

**Jacks** of all trades or **masters** of ones? That’s the question. It is not a matter of "better" or "worse," but rather a matter of fit. If you need an AI that can wear many hats, a generalist might be the right choice. But if you need an expert in a specific field, a specialist is the way to go. Regardless of what you choose, there will always be a tradeoff. Resources are finite, and investing in one means forgoing the benefits of another.  

In this musing of a post, we'll explore the differences between these two types of AI models, their unique strengths and weaknesses, and the factors to consider when choosing the right tool for your specific needs. We will also examine the trade-off (aka opportunity cost) through the lens of the Production Possibilities Frontier (PPF), which you could use as a framework to simplify decision-making.  We'll also discuss the potential for interoperability between these models and look ahead at the future of AI towards the end.

Let’s start!

The GPTs, the LLamas, the Geminis, etc. Represented by a pentagon in the above figure encompassing all the desired traits of AI models: **speed, performance, versatility, cost efficiency, and accuracy.** Like "Jacks of all trades", these models offer a range of capabilities but may not excel in any specific area. They are versatile and adaptable, making them suitable for tasks like content generation, drafting emails, writing articles, and creating social media posts. Other use cases include, most of which are not in a **critical path (where determinism or accuracy is a great deal)** :

  * **Translation** : converting text between languages

  * **Summarization** : condensing lengthy documents into key points

  * **Chatbots** : answering customer queries or providing information

However, they may be outperformed by specialized models in tasks that require specialization in a domain of expertise. 

# Specialized Models

Represented by three smaller pentagons in the figure above, each focusing on a **specific domain.** In the figure above, I use**law and code** as examples of specializations. Each specialized model excels in its respective domain, achieving higher accuracy, speed, or other relevant metrics.

These models are very good at what they do: 

  * **Legal** : Analyzing contracts, predicting case outcomes, performing legal research

  * **Code** : Generating code snippets, debugging software, automating code reviews

  * **Or even** **Medical** : Diagnosing diseases, analyzing medical images, predicting patient outcomes

Compared to "Jacks of all trades", they are experts in their field but may lack the **versatility** of the Jacks.

# The Trade-Offs

So, should you hire a **Jack of all trades** or **a master of one**? That all depends on your needs, the use case, and most importantly the opportunity cost!

## The Use-Case

Here are some thoughts to get you started: 

  * If your use case/application needs **versatility** , such as the ability to handle a wide variety of tasks or input types (with sub-par accuracy), general-purpose models might be a better choice. Examples of general-purpose models include GPT-3, T5, and BERT. These models can be used for a variety of tasks, such as text generation, translation, question answering, and summarization.

  * IF your use-case/application needs **expertise** in a specific area? A specialized model could be more suitable.

Is that all? Nope! You need to think about opportunity costs. 

## Opportunity Cost & The Production Frontier

In addition to the property/feature (e.g., versatility)  that a general-purpose model would provide you, there are always costs associated, be it opportunity costs or accounting costs. Let’s cover the opportunity cost as it is usually more encompassing and discuss trade-offs.

[![](https://substackcdn.com/image/fetch/$s_!0xno!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c9a3d4c-b8a3-4676-a41a-337f4dfe55d5_1600x946.png)](https://substackcdn.com/image/fetch/$s_!0xno!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c9a3d4c-b8a3-4676-a41a-337f4dfe55d5_1600x946.png)

While writing this, I thought we could map to a well-defined concept in economics called the **[Production possibilities frontier (PPF)](https://www.investopedia.com/terms/p/productionpossibilityfrontier.asp)**. The idea is simple, each company's resources (compute/memory/even people/...) are limited/finite, and their applications, brands, and customers differ. These variations shape decisions on how to best make use of available resources.  Where should we allocate resources to best serve the company's goals/customers/use-case? To be more specific to our post here, this question arises when we consider investing in different types of models, such as **general-purpose models** and **specialized models**. The question represents the concept of opportunity cost, when choosing one you are giving away resources that you could otherwise used to invest and grow another. 

In deciding, you will make the trade-offs to achieve **Allocation Efficiency** tailored to your company and use-cases**,**  **that is, the specific choice along the production possibilities frontier** that will generate the best bang for the buck for **your company** to serve **your customers** , and that is no easy choice. 

In the chart above, the**red curve** represents the high**opportunity cost** of diverting resources from one type of model to another. The steepness of the curve shows that investing in **general-purpose** ($$$) models will prevent you from producing more specialized modes that could have been better for your business. The question is do you know how much better? Are you looking for versatility? Do you understand your use cases well enough to opt for other properties like speed/performance, and why?

The orange curve represents a lower opportunity cost, signifying larger access to resources, which is a smaller trade-off in the grand scheme of things. If we map to our [AI market landscape](https://thetechnomist.com/p/ai-market-dynamics-open-vs-closed), we will see that companies with massive investments can focus on building and serving more general-purpose models while the creatives (smaller niche companies) are usually focusing on building for specific use cases (e.g., law, music, etc.), more details on this in a [previous post](https://thetechnomist.com/p/history-ai-and-non-consumption-part-2e9). 

[![](https://substackcdn.com/image/fetch/$s_!S_Hf!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5a71af4c-9c13-409c-b42a-bba96382953e_1600x1317.png)](https://substackcdn.com/image/fetch/$s_!S_Hf!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5a71af4c-9c13-409c-b42a-bba96382953e_1600x1317.png)

You can use the production frontier as a framework for making the right decision on where to invest your available resources. There is no silver bullet here, you know your value proposition better than anyone else, so do the right thing!

# Hybrids?

It’s not black and white though most of the time, you could choose to mix and match LLMs and Small Language Models (SLMs). A **LLM** can be your orchestrator, calling out to SLMs as _**agents**_ responsible for realizing a task, the LLM could be your planner of tasks, it could “hire” an **SLM** for a job. Additionally, two **SLMs** could pair-up to produce some greater (1+1 =11). 

That all will be a factor of your company. Designing AI applications is like tailoring a suite, buy a one size fit all, and you’d forgo a much needed impact, invest in understanding your 

# Looking to the Future

If we are trying to model how the mind works (it's called “artificial” intelligence, after all), it's logical to draw inspiration from how**“we”** work.  It’s rare to meet a know-it-all-all human in real life, so specialization is what we end up doing. We go to university, we study something, we work towards being good at that something, and then we make a living out of it. If we need to borrow knowledge, we go to **experts** in that domain. Sick? Go to the **doctor**. Facing legal issues? Hire a **lawyer**. Want to build an application? Hire a **developer**. 

There are cases for Jacks of all trades, though. For example, in medicine, general practitioners do well to signal issues and point to specialists as necessary. Breadth could also be important in tech. Being a product manager myself, I consider product management a general-purpose role (it can be debated, but not on this post 🙂), given the diversity of daily communication we have to go through (docs, legal, engineering, design, etc.). 

Looking at trends and also the maturity of the domain, there is a growing interest in specialized AI models, as they offer uniquer properties that might serve a use-case way better than the Jacks. Specialization will become more relevant as AI applications become more integrated into our daily lives, requiring more domain specific knowledge to solve for concrete problems. Also, SLMs will make more sense at the **edge** where resource scarcity is a given.  That said, general-purpose models will probably continue to play an important role in research and development, helping push the boundaries of what’s possible, some like to call that **Artifical General Intelligence (AGI)** , others call it **Super** (duper) **intelligence** , the discoveries there will also help build better-specialized models. We will also see hybrids, where general-purpose models are fine-tuned and adapted to specific domains, or built from scratch to serve a purpose but team up for the greater good. 

Thanks for reading The Technomist! Subscribe for free to receive new posts and support my work.

That’s it! If you want to collaborate, co-write, or chat, reach out via **subscriber chat  **or simply on **[LinkedIn](https://www.linkedin.com/in/adelzaalouk/)**. I look forward to hearing from you!
