---
title: "Pre-training, Fine-tuning, and Kungfu!"
date: 2024-05-04
tags: ["ai", "strategy", "economics"]
type: entry
summary: "From Novice to Apprentice"
---

You are in a company meeting, and your CEO, your CTO, and your CPO start to talk about Artificial intelligence (AI), “pretraining”, “fine-tuning”, and you are unable to follow along, that’s okay. I've created a detailed **math-less** **mindmap** along with the write-up in this post to go over the main concepts and ideas. The aim here is to help you reason about those concepts better, make more informed decisions, and have productive discussions about these topics and how you can incorporate them for your use-cases. 

[![](https://substackcdn.com/image/fetch/$s_!CMHM!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5a19d373-2013-4662-80ac-6cf2559de915_4455x2893.png)](https://github.com/thetechnomist/chartedterritory/blob/main/02-pretraining-training-kungfu/pretraining_training.pdf)

_  
_  
I recommend going through the**mindmap** first, internalizing it, and then coming back and looking for answers in the long form here. With that in mind, here goes!

_The full mindmap PDF can be found[here](https://github.com/thetechnomist/chartedterritory/blob/main/02-pretraining-training-kungfu/pretraining_training.pdf)._

[Subscribe now](https://thetechnomist.com/subscribe?)

# Model Pre-training

Growing up, I competed as a professional swimmer. Before the competition, a day, a week, depending on availability, I’d go to that Olympic 50-meter swimming pool and take a feel for it, even do entire training sessions there. If I could, I’d familiarize myself with the surroundings minus the crowd, the shouting, the whistles, etc. But it would give me the much-needed confidence for the next task to come, the actual race, which is a whole different game, mentally and physically.  I was practically **pretraining** for the competition 🙂

[![](https://substackcdn.com/image/fetch/$s_!UIIE!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F390beafa-c6d5-4add-870c-5576863fe5e3_1024x1024.png)](https://substackcdn.com/image/fetch/$s_!UIIE!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F390beafa-c6d5-4add-870c-5576863fe5e3_1024x1024.png)

Formally pretraining is defined as:   

> _Pre-training refers to the process of initializing a model with pre-existing knowledge before fine-tuning it on specific tasks or datasets. In the context of AI, pre-training involves leveraging large-scale datasets to train a model on general tasks, enabling it to capture essential features and patterns across various domains. ~[Lark](https://www.larksuite.com/en_us/topics/ai-glossary/pre-training) _

Pretraining helps the model perform better when it later learns tasks specific to a smaller, targeted dataset. It improves the model’s accuracy and efficiency, as it starts with a solid foundation of knowledge.

Pretraining is a necessary evil, and someone has to do it. That someone or something needs to have POWER 💪 and MONEY 💰. But once done, many can benefit from using it (**if there was an intention** for that in the first place, e.g., open source models). _Technomistically_ speaking, we would be talking about **sunk costs** and **Amortization**.

  * **Sunk Costs:** Pretraining requires a LARGE initial investment in _**computational** **resources** and **data** **acquisition**_. These costs are considered **sunk** as they cannot be recovered. However, once a model (big or small, still needs alot of resources) is trained, and compressed to represent a **virtual version (it doesn’t really “copy” the data or memorize it)** of the data it has been trained on, one can start to[ ](https://www.merriam-webster.com/dictionary/amortize)**[amortize](https://www.merriam-webster.com/dictionary/amortize)** these costs, leading to another fancy term called **[economies of scale](https://www.investopedia.com/terms/e/economiesofscale.asp)** (the initial high cost of training the model is spread out over many uses for inference).

  * **Opportunity Cost:** Mentioned in the **mindmap** above is[ Self-Supervised Learning (SSL)](https://www.ibm.com/topics/self-supervised-learning), which is basically a model trying to figure out the meaning of life by looking at ALOT of data, learning patterns between them, and generating it’s own labels (magic ✨). In doing so, SSL minimizes the need for explicitly labeling data, thus reducing both the **direct costs** of data preparation and the **opportunity costs** associated with extensive data labeling processes.

By now, you might be thinking, well, it’s great that someone did some pre-training (“ _**pre”**_ because the assumption is implicit in that it’s not yet ready for whatever you want it to do, i.e., it’s an invitation to train the model more). "I am pre-trained. Please train me _properly_ sensei”

# **Optimizations**

After pretraining a language model, it can be optimized further depending on the outcome desired. Examples of outcome optimizations are fine-tuning, prompt engineering, instruction finetuning, Retrieval augment generation (RAG), and so on. Notice that here, I intentionally said _**outcome**_ optimizations and not _**model** _optimizations. To optimize outcomes, there are invasive and noninvasive methods, similar to when you visit a doctor with a problem, the doctor presents you with options like surgery (invasive because they _modify_ something in you) or physical therapy (sometimes just reminding your body how to do things), here we also have options:   

  * **Noninvasive:** prompt engineering, tuning, and RAG (aka engineering around the model, which I personally consider a form of prompt optimization). These methods are cost-effective because they utilize existing resources to enhance output without significant expenditure. However, there is a limit to how much the model can improve with them.

  * **Invasive:** requires more training on unseen data to improve the model's ability to produce certain outcomes. Examples are fine-tuning and its variants and methods (e.g., instruction fine-tuning). Such methods involve a higher initial cost, which might be needed to surpass the “limits” of noninvasive methods in terms of**how the model performs on various tasks/benchmarks.**

[![](https://substackcdn.com/image/fetch/$s_!CXq2!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F089460d7-8d0c-4907-9d70-198c458f4ef3_1600x914.png)](https://substackcdn.com/image/fetch/$s_!CXq2!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F089460d7-8d0c-4907-9d70-198c458f4ef3_1600x914.png)

There are other optimizations, not necessarily to produce a better outcome, but to optimize how to get to the same outcome. For example, **quantization** is a form of cost/energy optimization (by mapping floating point representations to lower bits), done for training and inference. Distillation (distilling the same amount of knowledge onto a smaller model), and more. All of these take the desired outcome as a goal and work around how to get to the same outcome with the least of effort/energy/**gas.**__ I like the concept of “gas” here, borrowed from blockchain because it describes a fee without the specifics of that fee. 

> _Gas is the f**ee required to successfully conduct a transaction** or execute a contract on the Ethereum blockchain platform. ~ [How Gas Fees Work on the Ethereum Blockchain](https://www.investopedia.com/terms/g/gas-ethereum.asp#:~:text=Gas%20is%20the%20fee%20required,resources%20needed%20to%20conduct%20transactions). _

Of all the optimizations, fine-tuning is one of the hottest topics in the field these days. 

## **Full & Parameter-Efficient Fine Tuning (e.g., LoRA)**

I am jumping ahead here because we don’t need to get into the nitty gritty. After pre-training, you could go and do[ Full Parameter Fine Tuning (FPFT)](https://arxiv.org/abs/2306.09782), which would mean that you take that **pre-trained model and re-tune it to a specific task (e.g., teach it kungfu).**

**Full-parameter** here would mean that would have to:

  * Update all the weights and parameters of the Neural Network (which can be very large) frequently.

  * Go through many Hyperparameter optimization rounds to avoid side effects.

  * Run it multiple times through your data (aka, multiple Epochs)

  * …

While you are not running the training over the entire internet as a dataset, only a subset of the data (e.g., KungFu), it’s still considered “costly”.

There are ways to solve for this with[ ](https://arxiv.org/abs/2403.14608)**[Parameter Efficient Fine Tuning](https://arxiv.org/abs/2403.14608) (PEFT), which has the following benefits:**

  * Leaves pre-trained model weights fixed and only adopts a small number of task-specific parameters during fine-tuning.

  * Reduces storage memory because you are not updating the entire model parameters (there are multiple techniques, again mentioned in the mindmap).

This makes _fine-tuning_ cheaper and accessible on modest hardware. Techniques include[ Low Rank Adaptation (LoRA)](https://arxiv.org/abs/2106.09685), which decomposes larger weights matrix representations into smaller matrices with low ranks and other variants such as adaptive layers, prefix tuning, and more.

**PEFT** provides incremental cost reductions 📉 through the efficient use of hardware, which also leads to more optimized resource allocations, lower energy consumption 🍀, and enhanced overall operational efficiency.

## **Reinforcement Learning from Human Feedback (RLHF)**

As mentioned above, there are multiple ways to improve the model’s performance. Another example is **Reinforcement Learning from Human Feedback (RLHF)** which is a  _“Human in the loop”_ strategy to basically teach models “principles”, i.e., what it takes to be “helpful”, “harmless”, and so on. 

[![A futuristic illustration showing a human standing in the middle of a tribe of robots. The human, an Asian female wearing a modern explorer outfit, is surrounded by a variety of robots of different sizes and shapes, some humanoid and others more abstract. The setting is an outdoor landscape on another planet, with rocky terrain and a distant view of alien flora. The sky is a vibrant hue of purple and orange, adding a surreal touch to the scene. The interaction suggests a moment of peaceful coexistence and curiosity between the human and the robots.](https://substackcdn.com/image/fetch/$s_!o_gG!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fefcc3d70-2ae4-49be-b898-531a6571eeab_1024x1024.webp)](https://substackcdn.com/image/fetch/$s_!o_gG!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fefcc3d70-2ae4-49be-b898-531a6571eeab_1024x1024.webp)

RLHF works briefly as follows: 

  * First, humans judge a model's output. These humans review these outputs and provide feedback. This feedback could be in the form of rankings, ratings, or direct corrections. The key is that these human evaluators assess the model's responses based on desired behavior, as described above. 

  * The feedback from human evaluators is then used to fine-tune the model. This may involve training the model to predict human preferences or directly optimizing the model's parameters based on the feedback. The goal here is to **align** the model more closely with human values and expectations.

While RLHF has shown good results, it is still **expensive** (find the humans and make them do the work). Second, it is difficult to encode human values into the model (you can try). Third, the model may not generalize well to new situations. Despite these limitations, RLHF is a valuable tool for AI safety research and has the potential to contribute to the development of safer AI systems.

Incorporating RLHF entails **additional costs** due to human involvement. These **costs** must be balanced against the **marginal utility**(benefit-to-cost ratio for each human involved) derived from improved model accuracy and compliance with ethical standards, enhancing user trust and market acceptability, all of which are hard(er) to quantify but are important nevertheless.

# Conclusion & Recommendations

Models are pretrained to get a basic understanding of the world (depending on the data it fed on), and are optimized to get “better” at achieving an outcome. The outcome may vary. It could be to get better at math, or writing poetry, or better at following instructions (in English or other languages), or better at adhering to what _**aligns** _with human values and principles (causing no harm, no discrimination, ethics,...).   
  
Other outcomes could revolve around making the model more efficient cost and energy wise, faster at inference, etc. We can call those **efficiency gains**. 

With this in mind, here are some recommendations:

  * **Adapt and Fine-tune:** Use in-context learning and fine-tuning strategies to adapt to new requirements and teach your model more about the tasks/outcomes/use-cases you want it to be good at without the need for extensive retraining which helps conserve resources and allows you to respond quickly address your organization’s needs. 

  * **Invest in Parameter-Efficient Fine Tuning:** pretrained models are expensive to train. Luckily, we are seeing investments in making models open and thus available to a wider audience. The basic models are rarely useful without additional tuning, make use of existing advancements in training (e.g., LoRA which we will talk about more in a later post), which can reduce the tuning costs and improve throughput, as well as alleviate logistical challenges associated with updating AI models, making it ideal for continuous improvement cycles.

> _A comparison of training throughput (tokens per second) for the 7B model with a context length of 512 on a p4de.24xlarge node. The lower memory footprint of LoRA allows for substantially larger batch sizes, resulting in an approximate 30% boost in throughput. ~[Fine-Tuning LLMs: LoRA or Full-Parameter? An in-depth Analysis with Llama 2](https://www.anyscale.com/blog/fine-tuning-llms-lora-or-full-parameter-an-in-depth-analysis-with-llama-2) _

  * **Balance Human Input with Automated Processes:** While human feedback is crucial for ensuring model reliability and ethical alignment, it is a balancing act to weigh these benefits against the costs of human involvement and to optimize the use of automation were beneficial.

  * **Invest in Cost/Energy and Computational Optimizations:** Implementing computational optimizations such as quantization and quantized-aware training (see the mindmap) should be prioritized to reduce operational expenses (OPEX), such as energy consumption and maintenance. It will also reduce capital expenditure costs (CAPEX)  by eliminating the need for expensive and high-performance computing hardware.

[Subscribe now](https://thetechnomist.com/subscribe?)

  
That’s it! If you want to collaborate, co-write, or chat, reach out via **subscriber chat** or simply on **[LinkedIn](https://www.linkedin.com/feed/)**. I look forward to hearing from you!
