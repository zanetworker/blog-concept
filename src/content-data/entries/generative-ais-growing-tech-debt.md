---
title: "Generative AI's Growing Tech Debt: Managing the Ripple Effect"
date: 2024-10-20
tags: ["products", "ai"]
type: entry
summary: "Prepare for the Next Wave of (Generative) AI"
---

Generative AI systems, LLMs, and multi-modal models are evolving fast, what’s clear is that we are moving beyond **static predictive model** s and more towards more dynamic models and systems. Along that path, there are new challenges, emerging personas, and a greater need to adapt. 

  * **Data Management:** predictive models are typically trained on structured, labeled datasets, focusing on historical data to predict future outcomes. Generative models use **larger, more diverse datasets** , often **unstructured** , to learn patterns and generate novel content. Managing this data for **quality, bias, and provenance presents a greater challenge.**

  * **Model Training (and fine-tuning):** predictive training optimizes specific metrics like accuracy or precision.  The process is generally more straightforward and less computationally intensive than generative models. Training **L** LMs (emphasis on **L**) needs more computational resources and longer training pipelines. Continuous learning, fine-tuning, and techniques like Reinforcement Learning from Human Feedback (RLHF) are often necessary (see [this post](https://thetechnomist.com/p/pre-training-fine-tuning-and-kungfu) for more details).

  * **Deployment:**   predictive model deployment typically involves integrating the model into an existing application or system for real-time or batch predictions. Deploying LLMs at scale adds more challenges, be it low-latency inference, high availability, or managing fluctuating workloads, which requires specialized infrastructure (compute, storage, and networking) and inference **optimization** techniques.

With more components in generative AI (especially with retrieval involved)  comes more changes. Changes in one area, such **as the training data or model architecture,** can trigger cascading effects across the entire system, impacting everything from retrieval effectiveness to monitoring metrics (Change one thing, changes everything or **CACE** ++).  

# A _Longer_ AI Lifecycle

More components lead to a _**denser** _lifecycle. Each step in the lifecycle encompasses more steps. Let’s explore those a bit:

[![](https://substackcdn.com/image/fetch/$s_!bH3c!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe146ecc9-ca06-4bae-bce0-da8259d500a0_1600x950.png)](https://substackcdn.com/image/fetch/$s_!bH3c!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe146ecc9-ca06-4bae-bce0-da8259d500a0_1600x950.png)

## Data-centric tasks:

Generative AI introduces new stages and expands existing ones to handle the unique data requirements of complex AI systems.

  * **Synthetic Data Generation (SDG):** Traditional ML primarily focuses on cleaning and transforming real-world data. Generative AI adds the step of **generating synthetic data** (SDG) to augment existing datasets, especially in cases with limited or sensitive data (usually necessarily for training foundational models).

  * **Data Collection & Management:** Traditional ML pipelines typically deal with structured data and simpler data management processes. Generative AI requires managing diverse data sources like synthetic data, embeddings, and external knowledge bases, demanding more sophisticated data management strategies. 

  * **Embedding Management:**   Traditional ML relies heavily on manual feature engineering. Generative AI introduces embedding management as a core component, using techniques like pre-trained language models (e.g., BERT) to generate vector representations of data. Storing these embeddings in specialized (vector) databases enables semantic similarity searches and allows models to understand relationships between data points, moving beyond manual feature creation.

## Model-Centric tasks:

Generative AI introduces new approaches to model training and customization to cater to the advanced capabilities of modern AI systems.

  * **Model Training:** While traditional ML trains task-specific models on static datasets, Generative AI leverages the power of transfer learning by pretraining foundation models on massive datasets and then fine-tuning them for specific tasks. For instance, instead of training a chatbot from scratch, developers can fine-tune a pre-trained GPT-4 language model on a dataset of customer service conversations to achieve better conversational abilities.

  * **Model Customization & Alignment:** Traditional ML typically evaluates model performance on held-out data. Generative AI emphasizes continuous fine-tuning and alignment with human feedback, ensuring models remain relevant and adapt to evolving data and user needs. 

## AI System Deployment & Orchestration tasks:

Generative AI tackles the challenges of deploying and managing AI systems with multiple interdependent components. Traditional ML primarily deploys single models with fixed logic. Generative AI focuses on deploying and managing [compound AI systems](https://thetechnomist.com/p/beyond-llms-compounds-systems-agents) with multiple interacting components, including LLMs, other AI models, agents, and APIs. This requires special orchestration and integration techniques. 

## Safety & Monitoring tasks:

Generative AI models are unpredictable, which gives rise to the need for new strategies for ensuring **responsible AI (guardrails for outputs)** and maintaining high performance in compound systems:

  * **Guardrails Implementation:** Traditional ML focuses on monitoring model performance for degradation. Generative AI extends this by implementing guardrails and **safety** mechanisms that prevent unsafe, biased, or inaccurate outputs (especially when there is no transparency on how models were trained and to account for model emergent behavior). This involves incorporating ethical considerations and regulatory compliance into the development process. 

  * **Real-Time Retrieval Integration:** While traditional ML models rely solely on training data, Generative AI applications more often rely on retrieval integration, allowing AI systems to access external knowledge bases during inference. This ensures the system can provide up-to-date responses and adapt to new information without requiring full retraining. Examples include a customer support chatbot retrieving the latest product specifications from a knowledge base during a conversation or a legal research tool retrieving relevant case law from a legal database in real-time.

  * **Monitoring & Feedback:** Traditional ML monitors basic performance metrics. Generative AI expands monitoring to include human interactions, model outputs, and retrieval performance for comprehensive system evaluation and improvement. Human feedback plays a crucial role in ensuring responsible AI. This could involve collecting user feedback on the helpfulness of a chatbot's responses, analyzing conversation logs to identify patterns of misunderstanding, and using this feedback to improve the chatbot's training data and fine-tune its language model.

  * **Prompt Tuning and Optimization:** Model behavior is usually fixed after training in traditional ML. Generative AI introduces the concept of **prompt engineering** , tuning, and optimization, which is particularly relevant for LLMs. This involves refining model behavior by optimizing the initial prompts provided to the model based on real-world feedback, enabling continuous adaptation without requiring full retraining. That said, I doubt prompt engineering is a long-term solution (see [this post](https://thetechnomist.com/p/the-transient-nature-of-prompt-engineering?utm_source=activity_item) for more details)

The denser AI lifecycle introduces more optimization knobs and more questions to be answered. How much data should be synthesized?  How elaborate should the guardrails be?  Organizations must weigh the marginal benefits of each additional unit of effort (e.g., another data point, a more refined prompt) against the marginal costs.

# Emerging Roles & Disciplines Beyond MLOps

More components lead to new roles and disciplines.  Machine Learning Operations (MLOps) has provided a solid foundation for operationalizing traditional machine learning models, but it falls short of addressing the challenges posed by generative AI systems. This entices the creation of new operational disciplines like **LLMOps** and **GenAIOps** , and the rise of new personas such as the **"AI engineer”,**  responsible for tweaking the many knobs of AI applications to ensure that applications meet their specific use case requirements. 

[![](https://substackcdn.com/image/fetch/$s_!tUn6!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5a693a96-9002-45a8-9dd4-99edb48cb0c2_1600x374.png)](https://substackcdn.com/image/fetch/$s_!tUn6!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5a693a96-9002-45a8-9dd4-99edb48cb0c2_1600x374.png)

But before discussing AI engineering, let’s try to understand the distinctions between various “ops” disciplines, starting with MLOps. 

  * **MLOps:** Focuses on the end-to-end lifecycle of traditional machine learning models, including data preparation, model training, evaluation, deployment, and monitoring. MLOps emphasizes automation, reproducibility, and scalability for **individual models.  **

  * **LLMOps:** can be thought of as a branch of MLOps that deals specifically with the operational challenges of **LLMs**. LLMOps address aspects like **prompt engineering,** fine-tuning, model alignment, and managing the unique infrastructure requirements of LLMs. 

  * **GenAIOps:** Broader than LLMOps, GenAIOps encompasses the operationalization of all generative AI models, including LLMs, image generation models, and others. It focuses on managing the complexities of training, deploying, and monitoring generative AI systems.GenAIOps addresses the challenges of deploying and scaling generative models, which often require specialized hardware (e.g., GPUs) and efficient resource allocation.

  * **RagOps:**   Focuses specifically on the operational aspects of Retrieval Augmented Generation (RAG) systems, which combine LLMs with external knowledge sources to improve accuracy and grounding. RagOps addresses challenges like knowledge base management, retrieval model optimization, and ensuring consistency between the **LLM and the retrieved information.  **

[![](https://substackcdn.com/image/fetch/$s_!Enqf!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F18b0a6f1-f67a-49d7-ac8d-b72dafe5fe1e_1600x693.png)](https://substackcdn.com/image/fetch/$s_!Enqf!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F18b0a6f1-f67a-49d7-ac8d-b72dafe5fe1e_1600x693.png)

  * **AI Engineering:** This represents the next stage in the evolution of AI operations. AI Engineering entails managing the entire lifecycle of compound AI systems that may include LLMs, other AI models (including generative models), retrieval mechanisms (like those used in RAG), external knowledge bases, and human-in-the-loop components. AI Engineering emphasizes system-level considerations, including orchestration, integration, safety, and continuous learning. 

[![](https://substackcdn.com/image/fetch/$s_!Bqsc!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3b2eced3-2526-484a-b748-c5d870c0b6a9_1600x775.png)](https://substackcdn.com/image/fetch/$s_!Bqsc!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3b2eced3-2526-484a-b748-c5d870c0b6a9_1600x775.png)

# Navigating the New Found Challenges of Generative AI

Generative AI, particularly LLMs and multi-modal models, are reshaping the tech landscape and introducing new use cases.  We are moving beyond static predictive models to a dynamic world where AI can generate novel content, engage in conversations, and even drive decision-making processes.  This transition, however, is not “free”. 

The complexity of those generative AI systems increases the [technical debt of traditional AI,](https://papers.neurips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems.pdf) introducing new layers of complexity related to data management, model training, deployment, safety, guardrails, and more.  Organizations looking to capitalize on the promise of generative AI should approach this paradigm with a broader perspective, acknowledging both the opportunities and the costs and complexities involved.

One of the not-so-obvious changes is the **expansion of the AI lifecycle** , be it around the data, the model, or the deployment machinery. Each of these expanded stages introduces new "knobs" to tune and optimize, creating more overhead for AI practitioners. This overhead also gives rise to specialized roles and personas like the **AI engineer** , who is now responsible for managing this complexity.

Before we close out, here are some thoughts to approach this new shift: 

**Think Big Picture:**   Before jumping on the generative AI bandwagon, consider a cost-benefit analysis to account for the hidden costs associated with new requirements such as data management (e.g., SDG),  specialized infrastructure, and the need for new talent (or skills, i.e., bigger training budges). Be willing to adapt or abandon existing infrastructure that is no longer suitable for generative AI to unlock new capabilities faster.

**Build the right abstractions (and Platforms):** Consider building customizable AI platforms that can reduce the generative AI tech debt and reduce time to value when building AI applications (usually through well-defined abstractions, interfaces, and APIs). Here are some quick ideas:

  * **Built-in prompt management:** Prompts are artifacts. Make it easier to experiment with new prompts, share versions and distribute them. 

  * **Automating training:** Implement automated workflows for data preparation, hyperparameter optimization, and model selection. Includes pre-trained models.

  * **Simplify Evals:** provide a dashboard with performance metrics, reporting, and alerting for new models.

  * **Simplify Deployment:** provide APIs to automate  AI system deployment to various environments (with pre-built templates).

  * **Surface alerts and monitoring dashboards:** make it easier to instrument AI applications for monitoring and logging, and simplify the configuration alerts.

  * **Build responsibly:** integrate security policies, add access control, and audit knobs.

  * **Tailor to the needs:** Prioritize **value** and **tailor the platform to the specific needs** of different user personas. For example, you can start by offering tiered access and functionalities. 

**Cultivate a Culture of Continuous Learning:** Generative AI is constantly evolving.  Invest in training and development for your employees, encourage knowledge sharing, and stay informed about the latest advancements to ensure your organization remains at the forefront of this transformative technology.

By far, _**Generative A**_**I** is the fastest-evolving technology I have encountered in my professional life. It's not merely a new tool, it’s a paradigm shift that is forcing organizations to reassess their approach to existing use-cases. It also encourages them to consider how AI can accelerate their business by discovering new workflows, and use-cases.

For more on building AI products, read my previous post on how to model value through the _**adapted**_**whole-product framework** : 

Thanks for reading The Technomist! Subscribe for free to receive new posts and support my work.

That’s it! If you want to collaborate, co-write, or chat, reach out via **subscriber chat  **or simply on **[LinkedIn](https://www.linkedin.com/in/adelzaalouk/)**. I look forward to hearing from you!
