---
title: "Standardizing AI Value? The Tech and Economics Behind Anthropic's MCP"
date: 2025-03-30
tags: ["ai", "tech", "economics"]
type: entry
summary: "Decoding MCP's Technology, Market Impact, and Potential as a Foundational AI Standard."
---

Anthropic's Model Context Protocol (MCP) is garnering attention. Some see it as a long-lasting standard, others see it as a protocol for agents or even "the next HTTP." Is this hype justified, or will MCP become an overblown trend? In this post, we will examine MCP's core concepts and benefits. We will also debate its potential, practicality, and economics.

  * **Prompts (User-Controlled):** These are predefined templates for common interactions initiated by the _user_. Think of slash commands in a text editor, IDE, or Slack **(e.g., /summarize to summarize a pull request, /translate to translate selected text, /code-review to review code/PRs/…).** Prompts provide a consistent and user-friendly way to interact with specific services, ensuring well-formed input for the language model. They are essentially **user-invoked** “tools”.

  * **Resources (Application-Controlled):** Resources represent _data_ exposed by the server to the client application. Unlike tools, which are actions, resources are information. Importantly, the _application_ (not the model) determines how to utilize this data. This could involve displaying an image, attaching a file to a message, providing contextual information to the user, or using the data in subsequent computations. Resources can be static (like a file) or dynamic (like data fetched from an API that changes over time). **This can also be used with prompts, for example, when invoking prompts or tools from the CLI, resource URIs could be passed as parameters or arguments**

  * **Tools (Model-Controlled):** This is where the AI model's agency comes into play. A server exposes a set of _tools_ , and functions that perform specific actions (or call one or more APIs). These could range from reading and writing files to querying databases, accessing APIs, or even controlling external devices. The thing to note here is that the _language model_ that is **used by** the**client application** is what decides _when, what, and how_ to invoke these tools based on the task at hand. 

I personally have not seen that much use of resources and prompts; most of the excitement has been around tools (exceptions do exist, though, just not as common). 

For more details on the building blocks, see the protocol [specification](https://spec.modelcontextprotocol.io/specification/2024-11-05/) and check out this talk: [Building Agents with Model Context Protocol - Full Workshop with Mahesh Murag of Anthropic](https://www.youtube.com/watch?v=kQmXtrmQ5Zg&t=4680s&ab_channel=AIEngineer)

## Communication Modes

In addition to the trifecta above, MCP can operate in different modes:

[![](https://substackcdn.com/image/fetch/$s_!nDXK!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F56eeb243-52a0-4e73-8bda-418dfccd8f13_619x326.png)](https://substackcdn.com/image/fetch/$s_!nDXK!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F56eeb243-52a0-4e73-8bda-418dfccd8f13_619x326.png)

  * **STDIO:** Good for quick starts and onboarding. Here, the client often spawns the server as a subprocess, piping JSON-RPC messages via STDIO.

  * **HTTP + Server-Sent Events (SSE) [**_**Older**_**comms]:** Used two separate channels: regular HTTP POSTs (Client->Server) and a dedicated SSE stream (Server->Client). Required stateful servers for the SSE part. This had some drawbacks, including incompatibility with serverless, resource-intensive(ness), and didn’t really get adopted that much, also MCP allows for hierarchical servers relationships, which complicates things, especially with SSE

  * **Streamable HTTP [**_**[Newer](https://github.com/modelcontextprotocol/specification/pull/206)**_**[comms](https://github.com/modelcontextprotocol/specification/pull/206)]:** No more "always-on" connections to remote HTTP servers. Uses a single endpoint. Leverages standard HTTP POST. The server chooses whether to reply with a single JSON response or upgrade the POST response itself into an SSE stream. Also allows a separate GET for a dedicated SSE stream if needed. More flexible, supports stateless servers, and adds resum-ability.

[![](https://substackcdn.com/image/fetch/$s_!utmT!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9026f132-1f6d-4ef7-b6ae-749a787583c4_1222x843.png)](https://substackcdn.com/image/fetch/$s_!utmT!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9026f132-1f6d-4ef7-b6ae-749a787583c4_1222x843.png)

Now, debate exists regarding the trade-offs between MCP's complexity and its **utility** across the different communication modes. Remote MCP, particularly when implemented over HTTP, is frequently perceived as _complex_ due to added layers like JSON-RPC wrappers, especially when compared to traditional REST APIs defined by OpenAPI specifications (Why not JUST OpenAPI, man?). However, some argue this complexity is justified by enabling a reasonably powerful paradigm:_**“users dynamically adding tools and context sources to AI applications at runtime**_ ”, much like browser extensions, going beyond static, developer-defined integrations. In contrast to remote and its perceived complexity, _**local MCP via stdio**_ , commonly used for _**inner-loop**_ developer tools (e.g., requiring filesystem access or command execution), is generally viewed as more straightforward and practical for its purpose, making it the more prevalent implementation observed **so far.**

[![](https://substackcdn.com/image/fetch/$s_!0SOa!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Feacb4215-7fd1-453a-b21d-5ad9fba1b5e5_1461x913.png)](https://substackcdn.com/image/fetch/$s_!0SOa!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Feacb4215-7fd1-453a-b21d-5ad9fba1b5e5_1461x913.png)

## The Value Proposition: A Win-Win-Win-Win Scenario

MCP offers some tangible benefits to a wide range of users:

  * **WIN 1 | Application Developers:** The most immediate benefit is the elimination of custom integrations. Once an application is MCP-compatible (i.e., an application becomes a client), it can connect to _any_ MCP server with zero additional coding. This reduces development time and effort, allowing developers to focus on the core functionality of their applications rather than the plumbing of integrations.

  * **WIN 2 | Tool and API Providers:** By building an MCP server once, tool and API providers can expose their services to a broad ecosystem of MCP-compatible applications. This provides a standardized "on-ramp" for AI, increasing their reach and potential user base. It's a way to "AI-enable" their existing services with minimal overhead.

  * **WIN 3 | End Users:** The ultimate beneficiaries are the end users, who gain access to more powerful, context-rich, and personalized AI applications. These applications can understand and act upon their data and the real world in ways that were previously impossible or required significant manual intervention. Take [Zapier MCP actions](https://zapier.com/mcp), for example. For a non-technical consumer, you’d just point to Zapier, and magically be able to “chat” with all available integrations. I chose Zapier because while MCP standardized tool interactions through a protocol, Zapier had standardized access to “integrations/tools” with no/low-code, and now they MCPed all their integrations via _Actions_.

  * **WIN 4 | Enterprises:** MCP offers a clear way to separate concerns and streamline internal development workflows. Teams responsible for managing infrastructure (e.g., vector databases, CRM systems, internal APIs) can expose these resources as MCP servers. Now, other teams can consume these services with _natural language_ without needing to build custom integrations or understand the underlying implementation details.

## Agents ♥️ MCP

Perhaps the most useful incarnation of MCP lies in its role as a foundational protocol for AI agents to use tools. An agent, in this context, can be thought of as an ["augmented LLM](https://www.anthropic.com/engineering/building-effective-agents#:~:text=Building%20block%3A%20The%20augmented%20LLM)", a language model that is enhanced with the ability to interact with retrieval systems (for accessing information), tools (for taking actions), and memory (for storing and retrieving information). MCP provides a standardized interface for these interactions. Here is the Agents equation:

_**Agents = Model + Augmentation(Tools + retrieval + memory) + Loop**_

More importantly, MCP enables agents to _dynamically_ discover and utilize new tools and data sources, even after they have been initialized. This means an agent can "learn" new capabilities by connecting to new MCP servers, without requiring any changes to its core code. This alone is a big win, but it comes with trade-offs, for example, MCP servers overwhelming the Agent’s LLM context and rendering it [“kaput”.](https://www.merriam-webster.com/dictionary/kaput)

Most of the known “agent” frameworks had started to bring MCP client supportability in as a framework-native feature, most prominently, Open-AI **[bought in](https://openai.github.io/openai-agents-python/mcp/)** , and this more or less settles it!

[![](https://substackcdn.com/image/fetch/$s_!bALe!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8721009c-3009-484b-9eb5-6a39d8dd9580_654x275.png)](https://substackcdn.com/image/fetch/$s_!bALe!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8721009c-3009-484b-9eb5-6a39d8dd9580_654x275.png)

And looks like Google will be biting soon as well:

[![](https://substackcdn.com/image/fetch/$s_!Fe-R!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1946efef-71d5-4932-8f57-fde88367cfc2_652x203.png)](https://substackcdn.com/image/fetch/$s_!Fe-R!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1946efef-71d5-4932-8f57-fde88367cfc2_652x203.png)

Another seemingly powerful concept is _**composability**_. Any application or agent can be _both_ an MCP client and an MCP server. This allows for the creation of layered, multi-agent systems where specialized agents can interact with each other and with external services in complex workflows. Composability makes hierarchies possible, but the downside is that it makes everything else a _**tad**_ harder. For example, security (credentials propagating downstream), debuggability (the load shifts on building that on the server application, so it must be very well instrumented), latency/performance (the length of the hierarchy/chain of client/servers can be unpredictable, so unless there is a fixed tested n-depth, performance can’t be guaranteed).

## Standard OR “Overhyped Marketing Fluff”

**Short answer:**[ OpenAI’s](https://openai.github.io/openai-agents-python/mcp/) adoption of MCP in its agent SDK solidified its stance towards being a standard rather than just “**Fluff** ”. Langchain’s twitter poll did as well 🙂

[![](https://substackcdn.com/image/fetch/$s_!cK5D!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F90bbd753-0b25-44d1-b722-da5b8a012c64_655x613.png)](https://substackcdn.com/image/fetch/$s_!cK5D!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F90bbd753-0b25-44d1-b722-da5b8a012c64_655x613.png)

I recently came across [this post](https://blog.langchain.dev/mcp-fad-or-fixture/) from Harrison Chase (CEO of LangChain) and Nuno Campos (lead of LangGraph), where they debate the practicality and usefulness of MCP for developers AND the rest of the crowd. Let’s get into the details.

### Optimism and Skepticism Striking the Right Balance

In the post, **Nuno** expresses some doubts about MCP's utility**beyond very basic tool replacement**. He argues that effective tool use in most production agents requires _**tailoring**_ of the agent's **system message** and **architecture** to those specific tools (MCP “just” ships the tool, no questions asked, no customizations done, unless you’d go and modify the server’s code base and the prompts). He argues that even **with tailored agents and tools** , models often fail to call the correct tool (true story on my side, getting LLMs to work well with tools depends on LLM’s parameter size, quality, and many other factors).

I tried to depict this a bit below, it’s like going around with a Swiss army knife, not really knowing when you’d use any of the tools in there, but in times of need, they sorta/kinda do the job! Compare that with walking with a bag of tools (scissors, can opener, the handyman you are!) all around. A Swiss knife is lighter, and it DOES the job (though poorly, and takes a lot of time). On the other hand, having the _perfect_ tool for the job saves time but adds the overhead of optimizing the time and place (you never know!)

[![](https://substackcdn.com/image/fetch/$s_!r_kl!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa3f3e89e-24f9-4ea6-8176-7c96a6f0b0ab_1600x949.png)](https://substackcdn.com/image/fetch/$s_!r_kl!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa3f3e89e-24f9-4ea6-8176-7c96a6f0b0ab_1600x949.png)

**Harrison,** on the other hand,**** positions MCP as particularly valuable when you want to integrate tools with an **AI agent whose underlying logic you** _**cannot**_**directly control**. This opens the door for**non-developers** to extend the capabilities of their existing AI tooling/clients/agents (e.g., Claude or Cursor) with custom integrations and tools. He put the emphasis here on non-technical users to build agents without needing to code the agent's core logic (no-code/low-code), plug this MCP server and be on your to doing something productive.

### Utility for Non-Developers AND Developers

While MCP might not be predictably reliable/predictable (you never how well those tools are tested). For non-developers, they could be just enough to **get the job done**. In a previous post, we discussed [non-consumption and the different types of innovation](https://thetechnomist.com/p/history-ai-and-non-consumption-part-2e9). **Nonconsumption** occurs when potential customers are shut out from existing solutions due to barriers like cost, access, complexity, or, crucially, in this context, required technical skill.

Many tools, locked behind APIs requiring code, remain inaccessible to those who could benefit from them but lack programming abilities. LLMs began tackling this by democratizing access to information through a **natural language interface**. MCP takes it a step further by potentially democratizing action and integrations, allowing a non-developer to plug or even just use existing integrations via an MCP server (abstracting access to their AI client, it bridges the skill gap and turns previously inaccessible tool functionalities into consumable services via a natural language interface). Some examples:

  * A **marketing manager** using Claude could connect an MCP server for their company's Google Analytics account. Without writing code, they could ask Claude, "Summarize the top 5 traffic sources for our latest campaign landing page based on GA data," a task previously requiring manual navigation or analyst support.

  * A **project manager** using Cursor could integrate an MCP server for their team's Jira instance. They could then ask Cursor, **"List all open 'bug' tickets assigned to me in the 'Backend' project and summarize their description** " accessing project data directly within their coding-assistance tool.

  * A **small business owner** could use an AI assistant connected to an MCP server wrapping their simple customer database (perhaps even a managed Airtable or Google Sheet). They could ask, "Find customers who purchased Product X in the last 6 months but haven't purchased Product Y."

That said, for developers getting started, not really sure what tools are the right ones for the job, experimenting with existing integrations built by someone else and exposed via the MCP server abstraction might not be a terrible idea. Optimization can come later, but as a starting point, for identifying the use-case, and understanding the landscape, it can be quite useful, and who knows, maybe **it’s just good enough 🙂**

## MCP’s Creator Economy & Network Effects

If you have not noticed, there are thousands of MCP servers out there (and there is no stopping), MCP triggered a new creator economy around AI integrations. Developers are building, sharing (in the open), and sometimes even monetizing MCP servers via marketplaces, subscriptions, or sponsorships, creating valuable assets like premium servers for niche/complex tools to generate revenue (like app stores).

MCP’s ecosystem will have Clients (with MCP integrated within like Cursor), Servers (for almost anything has an API), and infrastructure services and **platforms** , i.e., where to host **those servers for scale, security,** and who hosts them for me.

The diversity will give birth to new network effects. As more developers and organizations adopt MCP, the number of MCP servers and connectors between AI models and external tools will keep growing. Each new server (e.g., for Slack, GitHub, or a niche blockchain tool) adds net-new value to the ecosystem by expanding the range of tools that MCP-compatible AI clients can access. For example, if a developer builds an MCP server for a CRM, every MCP _user_ gains the ability to integrate their AI with Salesforce without additional effort.**I.e., the more participants, the more useful it becomes (“direct network effect”).**

[![](https://substackcdn.com/image/fetch/$s_!1GyV!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F07d6cbd9-72aa-4040-8170-be67dfb873ba_1600x1205.png)](https://substackcdn.com/image/fetch/$s_!1GyV!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F07d6cbd9-72aa-4040-8170-be67dfb873ba_1600x1205.png)

Additionally, as major companies integrate MCP, as seen with OpenAI, Block, Apollo, and Microsoft’s Copilot Studio, the protocol will keep gaining credibility and reach. This draws in smaller firms and developers, creating an "indirect network effect." For instance, if Google or AWS builds MCP servers **(servers as complements)** for their platforms, the protocol’s utility skyrockets, pulling in more users and developers to leverage those integrations and funneling more use of the platform other services **(“Indirect network effect”).**

On the macro level, MCP provides AI with superpowers by streamlining access to tools and integrations. This drives more and more automation enhancing productivity across various industries and amplifying aggregate economic value.

HOWEVER, this all does not come for free. For MCP to be considered more than just “hype” by enterprises, many will need to invest in learning about how AI systems work and how to implement them reliably. Legacy systems, fragmentation risk, and security concerns (requiring robust permissions) are hurdles, that could potentially slow uptake for those enterprises.

## The Future

MCP's long-term impact depends on reaching critical mass, which will depend on how easy/pragmatic it is to adopt for enterprise use-cases. If widely adopted, it could redefine the AI ecosystem, shifting focus from integration plumbing to faster and more accessible innovation. The future is full of surprises and questions:

  * **How to differentiate?**

    * The focus may shift from “the best API design” to “the best _collection of discoverable tools”_ for agents

    * **More Specialization?** The separation of concerns inherent in MCP (client, server, tools, resources) could lead to specialization among developers. Some might focus on**building robust and reliable MCP servers (back to software engineering)** , while others concentrate on creating user-friendly AI applications (back to good design principles).

  * **How will pricing structures change?** Dynamic, market-driven tool adoption based on agent assessment of speed, cost, and relevance could emerge, favoring modular, high-performing tools over merely popular ones. Also, servers-as-a-service, subscriptions (MCP would add more value, potentially justifying subscription amounts), Usage-Based Pricing (Pay-as-You-Go), outcome-based pricing (MCP makes that more tangible, e.g., pay for a code commit), and other modes of monetization will start to emerge.

  * **How to design APIs with Tools?** Tools and APIs are not 1:1 mapping, a tool can combine multiple API calls (e.g., draft_and_send_email vs. just send_email).

  * **How and Where to host MCP servers?** real-time load balancing across MCP servers, scale, etc (same old same, or is it 🙂)

  * ..

Thanks for reading The Technomist! Share to spread te word!

[Share](https://thetechnomist.com/p/standardizing-ai-value-the-tech-and?utm_source=substack&utm_medium=email&utm_content=share&action=share)

That’s it! If you want to collaborate, co-write, or chat, reach out via **subscriber chat** or simply on **[LinkedIn](https://www.linkedin.com/in/adelzaalouk/)**. I look forward to hearing from you!
