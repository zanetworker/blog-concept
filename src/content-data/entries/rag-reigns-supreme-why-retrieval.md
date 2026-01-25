---
title: "RAG Reigns Supreme: Why Retrieval Still Rules!"
date: 2025-03-15
tags: ["tech"]
type: entry
summary: "RAG is dead, Long-Live RAG"
---

**Introduction**

The AI landscape is constantly shifting, in ~3 years we are at “[manus](https://manus.im/)” level ([standing on the shoulders giants of course](https://thetechnomist.com/p/history-ai-and-non-consumption-part)). That said, each year, there is the unavoidable question, “Do we still need _**Retreival Augemented Generation (RAG)**_?” The answer (still in 2025) is “Absolutely, what are you talking about?!.

But why? The key here is that the definition of RAG _evolves_ with time! In this post, we will explore RAG's _modern_ origins, how RAG is being _used and implemented_ , its most prominent optimizations, and finally answer the core question: "Do we still need RAG?"

  * **Retriever** : This component is responsible for taking an input sequence (query) and retrieving relevant text documents from a non-parametric memory. The retriever consists of two main parts:

    * **Query Encoder (q(x))** : This is a model that creates a dense vector representation of an input query.

    * **Document Index (d(z))** : This is a **dense vector index of text passages** (documents). Each document is represented by a vector. The document encoder and index usually remain unchanged during fine-tuning.

  * **Generator** : This component takes the original input sequence _**x**_ and the retrieved document(s) _**z**_ as context and generates the target sequence****_**y**_.

### 🧳 Use-case: Customer Support at a Tech Company

Imagine a tech company like Slack deploying an AI-powered support bot. The bot needs to answer queries about the latest features, pricing updates, and troubleshooting steps, i.e., Information that changes frequently and isn’t fully captured in an LLM’s training data. With RAG, the bot retrieves the most recent documentation and support tickets from an internal knowledge base, ensuring responses are accurate and up-to-date, even for features released last week.

## RAG and Finetuning: A Good Match

Today, there's sometimes confusion around the terms _**fine-tuning**_ and _**RAG**_. Where **Fine-tuning** _usually_ refers to adapting a pre-trained LLM (the generator) to a specific task. This is done by adjusting the LLM's internal parameters (weights) – essentially, retraining parts of the LLM on a new dataset. RAG, on the other hand, usually refers to improving how information is _retrieved_ and presented _to_ the LLM, often without changing the LLM's core parameters.

However, the original definition of RAG in the [2020 paper](https://arxiv.org/abs/2005.11401) was broader. It envisioned a _system_ where both the “retriever” component _and_ the “generator” component (the model) were fine-tuned _together_ aka 'end-to-end' fine-tuning.

> _The core of RAG is a general-purpose fine-tuning approach where both the retriever and the generator are trained jointly and end-to-end on downstream NLP tasks. This means that the**parameters of the retriever** (specifically the query encoder) **and** the generator are adjusted based on the **task-specific data**_

According to the **[original paper](https://arxiv.org/abs/2005.11401),** RAG is a “general fine-tuning recipe”, “It combines a pre-trained LLM with a retriever that accesses an external knowledge source. The _Fine-tuning_ in the original paper puts the emphasis on the **system (retriever + generator),** which**fine-tuned togethe** r so the retriever learns to find documents helpful for the LLM.

Today, _fine-tuning_  often refers _  to_ adaptations of a pre-trained LLM (**not the system**) to a specific task by adjusting its internal parameters (weights), while RAG emphasizes optimizations on the retrieval flow, the store, re-arranging the results, often independent from the generator.

Why did we regress? Not sure! 

Tweaking just the retrieval parameters is oftentimes called “naive RAG”, and while this can be useful, the real power comes from **further** optimizing the retrieval process. This is where _**retrievers**_ finetuning enters the picture, specifically **the finetuning of encoders/embeddings models.**

Finetuning an embedding model on in-domain data (e.g., a company’s internal documents) improves retrieval accuracy, and don’t just believe the 2020 paper (which puts the emphasis on tuning retrievers + generators). A recent [Databricks blog post](https://www.databricks.com/blog/improving-retrieval-and-rag-embedding-model-finetuning) titled _"Improving Retrieval and RAG with Embedding Model Finetuning"_ provides reasonable evidence of this, showing substantial gains in retrieval metrics (like Recall@10) on datasets like **FinanceBench** and **ManufactQA** after finetuning.

**The takeaways?**

  * **Better Embeddings = Better Retrieval:** Finetuned embeddings capture the nuances of specific data, leading to more relevant search results.

  * **Better Retrieval = Better RAG** : More relevant context enables the LLM to generate accurate, grounded responses, reducing hallucinations.

  * **Finetuning Embedding Models Can Outperform Reranking:** In many cases, finetuned embeddings match or exceed reranking models, simplifying the RAG pipeline.

**The gotchas?**

Finetuning embedding models is dataset-dependent: it worked [well for some (e.g., FinanceBench) but not all (e.g., Databricks DocsQA](https://www.databricks.com/blog/improving-retrieval-and-rag-embedding-model-finetuning)). I.e., don’t assume finetuning embeddings will always solve your problems. You need to identify the true bottleneck in your system (retrieval, generation, or something else) and target your efforts accordingly.

Identify your “good enough” and remain there if it gets the job done, or risk diminishing returns from unnecessary spending. Moreover, along with fine-tuning the embedding model, adjusting the generator model (the LLM) can yield further improvements. However, this shouldn’t be your first move, see:

[![](https://substackcdn.com/image/fetch/$s_!UuRv!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1f435d49-11d9-4d30-9482-55c26569de89_1600x715.png)](https://substackcdn.com/image/fetch/$s_!UuRv!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1f435d49-11d9-4d30-9482-55c26569de89_1600x715.png)

### 🧳 Use Case: Legal Research for a Law Firm

A law firm needs an AI tool to assist with case law research. Legal documents are dense with jargon and context-specific terms like "tort" or "estoppel" that generic embeddings might misinterpret. By finetuning an embedding model on a corpus of legal briefs, statutes, and case law, the firm’s RAG system retrieves highly relevant precedents for queries like "What are the latest rulings on non-compete clauses in California?" The result? Faster, more accurate research that keeps lawyers ahead of the curve.

## Long-Context Models: A Powerful Tool, But Not a Replacement Retrieval/RAG

The rise of LLMs with longer context windows has led some to speculate that RAG might become obsolete. If an LLM can process an entire document, or multiple documents, in its context window, we don’t need to bother with retrieval, right, right?? Wrong!

A _recent (close to the date of this writing)_ Snowflake blog post,_["Long-Context Isn’t All You Need: How Retrieval& Chunking Impact Finance RAG"](https://www.snowflake.com/en/engineering-blog/impact-retrieval-chunking-finance-rag/)_ provides a counterpoint. Their research on financial filings shows that retrieval and effective chunking remain essential, even with long-context models. Here’s why:

  * **Context Confusion:** Dumping large amounts of text into an LLM’s context window can overwhelm it with irrelevant information, making it hard to pinpoint what’s crucial for the query. Retrieval acts as a "focusing mechanism."

  * **The Art of Chunking:** How documents are divided into chunks impacts retrieval effectiveness. Moderate chunk sizes, combined with retrieving more chunks, often yield the best results (compared to retrieving large chunks), enhanced by adding LLM-generated**global document context.**

  * **Retrieval Quality Trumps Generative Power (Sometimes):** A**well-tuned retrieval pipelin** e with smart chunking can enable a **smaller LLM** to nearly match a larger model (take note here, if you ever want to consume smaller models for Q&A, knowledge retrieval, consider this).

  * **Efficiency and Scalability** : Processing vast text in a single pass is computationally expensive. Optimized RAG offers a more efficient, scalable/cost-efficient solution.

### 🧳 Use Case: Financial Analysis at an Investment Bank

An investment bank uses an AI system to analyze quarterly earnings reports from multiple companies. A long-context LLM could ingest entire filings, _but irrelevant sections (e.g., boilerplate disclaimers) might dilute its focus._ With RAG, the system retrieves only the most relevant chunks, say, revenue breakdowns or risk factors, using a **chunking strategy tailored to SEC filings**. This allows a smaller, finetuned model to deliver precise insights, saving compute costs while matching the accuracy of larger models.

## The Rise of Agentic RAG: Beyond Simple Retrieval

Standard RAG involves a single retrieval step before generation. But Agentic RAG, or Retrieval-Augmented Generation with Agents, takes it further. An agent—an LLM-powered component capable of reasoning, planning, and acting, can:

  * **Interact with Multiple Tools** : It chooses the best tool for a query, like a vector database, web search, API, or internal knowledge base.

  * **Perform Multi-Step Retrieval:** It manages complex, multi-turn retrieval processes, refining its strategy as it gathers information.

  * **Reformulate Queries:** If initial results are lacking, it rephrases the query and tries again.

  * **Validate Retrieved Information:** It assesses the quality and relevance of context before generation, reducing hallucinations.

  * **Integrate with External Systems:** It can send emails, access calendars, or perform calculations via APIs.

I liked the analogy provided in this post by weaviate:

_Think of it this way: Common (vanilla) RAG is like being at the library (before smartphones existed) to answer a specific question. Agentic RAG, on the other hand, is like having a smartphone in your hand with a**web browser, a calculator, your emails, etc.**_

The [Weaviate blog pos](https://weaviate.io/blog/what-is-agentic-rag)t likens standard RAG to a library (access to information) and Agentic RAG to a smartphone (access plus processing and action). Surveys on Agentic RAG highlight its dynamic retrieval management and adaptability for complex tasks.

### 🧳 Use Case: Healthcare Decision Support

A hospital deploys an AI assistant to help doctors diagnose rare diseases. A patient’s query: "What’s causing my persistent fever and joint pain?" would require more than a single lookup. An Agentic RAG system searches medical journals, cross-references the patient’s electronic health record via an API, and queries a drug database for side effects. It reformulates the query if initial results are inconclusive, validates findings against recent studies, and suggests a differential diagnosis—all in real time.

In the context of agents, you can think of RAG as a single-step look-up for the agent, where the single step is just doing retrieval/look-up on a static base once. On the other hand, agentic RAG involves multiple steps, the emphasis here is on retrieving the right information to solve for the problem. I.e., its not a one-off

[![](https://substackcdn.com/image/fetch/$s_!3rtH!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3f7358b4-8bcf-4219-bf90-3f630aa5308d_1600x938.png)](https://substackcdn.com/image/fetch/$s_!3rtH!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3f7358b4-8bcf-4219-bf90-3f630aa5308d_1600x938.png)

### 🤔 When to Use Standard RAG vs. Agentic RAG

  * **Standard RAG is sufficient when:**

    * You have a single, well-defined knowledge source (e.g., a company wiki).

    * Queries are simple (e.g., "What’s our return policy?").

    * **Cost and latency are critical.**

    * **Use Case - Standard RAG in E-Commerce:** An online retailer uses standard RAG for a chatbot answering _"What’s the warranty on this laptop?"_ The bot retrieves the answer from a product catalog, a single, structured source, keeping responses fast and cheap.

  * **Agentic RAG is important when:**

    * Multiple, diverse sources are needed (e.g., web, internal docs, APIs).

    * Queries are complex (e.g., "Plan a marketing campaign based on competitor analysis").

    * Iterative retrieval and validation are required.

    * **Integration with external tools is essential.**

    * **Use Case - Agentic RAG in Supply Chain Management:** A logistics firm needs an AI to optimize shipping routes. The agent queries weather _APIs, traffic data, and warehouse inventories, iteratively refining its plan based on real-time constraint_ s, then schedules deliveries via an external system. Standard RAG couldn’t handle this multi-step complexity.

## Conclusion: RAG’s Enduring Legacy

RAG (more importantly, retrieval optimization) is not a passing trend. It’s a fundamental architecture for building AI systems that access and reason over information. While LLMs evolve, the need for external knowledge persists (be it static or dynamic).

[![](https://substackcdn.com/image/fetch/$s_!Y9jB!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc93c8b05-cfc0-4ecc-a16a-d9c12e99a1fb_616x400.png)](https://substackcdn.com/image/fetch/$s_!Y9jB!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc93c8b05-cfc0-4ecc-a16a-d9c12e99a1fb_616x400.png)

To summarize, here is why RAG remains essential, even in 2025 and _beyond_ :

  * **RAG is more than "Naive RAG":** The original definition of RAG emphasized end-to-end fine-tuning of**both the retriever and the generator.** We somehow lost sight of that and kept focusing on retrieval, separately from generation (i.e., fixing the generator LLM mode, aka “naive” RAG). While "naive RAG" (just optimizing retrieval parameters) can be a good starting point, the true power of RAG lies in [optimizing the entire system](https://thetechnomist.com/p/beyond-llms-compounds-systems-agents). This includes fine-tuning embedding models for specific domains, employing sophisticated chunking strategies, and even leveraging re-ranking techniques.

  * **Fine-tuning Matters:** Fine-tuning embedding models on in-domain data significantly boosts retrieval accuracy, leading to more relevant context for the LLM. This, in turn, improves response quality and reduces hallucinations. The benefits of fine-tuning are not universal, however, and careful evaluation is necessary to determine its effectiveness for a given dataset and task.

  * **Long-Context Models are Not a Silver Bullet:** While long-context LLMs can process larger amounts of text, they don't eliminate the need for RAG. Retrieval acts as a crucial "focusing mechanism," preventing the LLM from being overwhelmed by irrelevant information. Strategic chunking and optimized retrieval can even enable smaller, more efficient LLMs to match the performance of larger models on certain tasks.

  * **Agentic RAG Extends RAG's Capabilities:** Agentic RAG elevates RAG beyond simple retrieval. By incorporating AI agents, RAG systems can dynamically manage multi-step retrieval processes, interact with various tools (databases, APIs, web search), reformulate queries, validate retrieved information, and even take actions. This makes RAG suitable for complex, real-world scenarios that require more than a single information lookup.

  * **Choosing the Right RAG Approach:** Standard RAG is often sufficient for simpler tasks with well-defined knowledge sources. Agentic RAG shines in situations requiring complex reasoning, multi-source integration, and interaction with external systems. The choice depends on the specific application's needs and constraints.

Thanks for reading The Technomist! This post is public so feel free to share it.

[Share](https://thetechnomist.com/p/rag-reigns-supreme-why-retrieval?utm_source=substack&utm_medium=email&utm_content=share&action=share)

That’s it! If you want to collaborate, co-write, or chat, reach out via **subscriber chat** or simply on **[LinkedIn](https://www.linkedin.com/in/adelzaalouk/)**. I look forward to hearing from you!
