---
title: "n8n on OpenShift: From Broken Template to AI Workflows with vLLM"
date: 2026-02-16
tags: ["openshift", "kubernetes", "n8n", "kustomize", "openshift-ai", "vllm", "llama-stack", "ai"]
type: entry
summary: "A community PR tried to add an OpenShift template to n8n. It was broken in every way that matters. Here's how to fix it, deploy with Kustomize, and wire n8n into vLLM and OpenShift AI for real AI workflows."
links:
  - url: "https://github.com/n8n-io/n8n/pull/1729"
    title: "Original OpenShift Template PR"
    via: "GitHub"
  - url: "https://docs.n8n.io/hosting/configuration/environment-variables/"
    title: "n8n Environment Variables"
    via: "n8n Docs"
  - url: "https://github.com/zanetworker/n8n-openshift"
    title: "n8n-openshift Kustomize repo"
    via: "GitHub"
  - url: "https://docs.redhat.com/en/documentation/red_hat_openshift_ai_self-managed/"
    title: "Red Hat OpenShift AI documentation"
    via: "Red Hat"
  - url: "https://docs.vllm.ai/en/stable/"
    title: "vLLM documentation"
    via: "vLLM"
  - url: "https://llama-stack.readthedocs.io/en/latest/"
    title: "Llama Stack documentation"
    via: "Meta"
---

I looked at a community PR from 2021 that tried to add an OpenShift deployment template to the n8n repo. It never got merged. The n8n maintainers closed it in 2023, saying they'd moved deployment templates into separate repos. But the template itself is interesting because it shows every mistake people make when porting a Docker Compose workflow to OpenShift.

Here's what was in the PR, what breaks on a modern cluster, and how to fix it.

## What the PR did

A contributor dropped an OpenShift Template into the n8n repo. It created four resources: a DeploymentConfig, a Service, a Route with TLS edge termination, and a PersistentVolumeClaim. You'd log into your cluster, process the template with a few parameters (URL, username, password, image, disk size), and get a running n8n instance.

On OpenShift 3.11, this probably worked fine. On a modern OCP 4.x cluster, it won't even start.

## The root problem

The container tries to run as root. The volume mount path is `/root/.n8n`, which tells you exactly what user the author expected. OpenShift doesn't allow that. The default `restricted` Security Context Constraint blocks root containers, and for good reason. You'd have to grant the `anyuid` SCC to the service account, which your cluster admin will not appreciate.

Recent n8n images run as UID 1000 (the `node` user). The mount path should be `/home/node/.n8n`. That single change fixes the SCC problem without weakening cluster security.

## DeploymentConfig is dead

The template uses `DeploymentConfig`, an OpenShift-specific resource that predates the Kubernetes `Deployment` API. Red Hat deprecated it in OCP 4.14. It still functions, but new workloads should use `apps/v1 Deployment`. The migration is straightforward: drop the OpenShift-specific fields (`test: false`, the `deploymentconfig` labels), switch the apiVersion and kind, and replace `spec.triggers` with standard image update mechanisms if you need them.

One gotcha: the Service in the template selects on `deploymentconfig: n8n-server`. Once you switch to a Deployment, that label won't exist unless you add it manually. Simpler to change the selector to `app: n8n-server`, which both resource types use.

## Credentials in plain sight

The template injects the n8n username and password as raw environment variables. Anyone with `oc get dc n8n-server -o yaml` access can read them. The fix is a Secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: n8n-credentials
type: Opaque
stringData:
  username: admin
  password: changeme
```

Then reference it from the container spec with `secretKeyRef` instead of hardcoding the values.

But there's a bigger issue. The environment variables this template sets (`N8N_BASIC_AUTH_ACTIVE`, `N8N_BASIC_AUTH_USER`, `N8N_BASIC_AUTH_PASSWORD`) were removed from n8n in version 0.200. They do nothing now. n8n switched to built-in user management, so you configure the initial admin through the web UI on first launch. The entire auth section of this template is dead code.

## The small stuff that adds up

The template has `type: Recreate` for the deployment strategy but includes `rollingParams` with surge and unavailable percentages. Recreate ignores those fields. It's not broken, but it's confusing. Pick one.

`resources: {}` means no CPU or memory requests. If your namespace has a ResourceQuota (most production namespaces do), the pod will be rejected at admission. Set actual values. For n8n, something like 256Mi memory request and 512Mi limit is a reasonable starting point.

No readiness or liveness probes. n8n exposes `/healthz`. Use it. Without probes, the Route will send traffic to the pod before n8n finishes loading, and OpenShift has no way to restart it if it deadlocks.

The timezone is hardcoded to `Europe/Hungary`, which is not a valid IANA timezone identifier. The correct one is `Europe/Budapest`. Also, the YAML wraps it in extra quotes (`'"Europe/Hungary"'`), so the actual value the container sees includes literal quote characters. It should be a template parameter with a valid default.

Every parameter has `diplayName` instead of `displayName`. Minor, but it means the OpenShift console won't show friendly labels when you fill in the form.

## What I actually built instead

I used Kustomize with a base/overlay split. The base layer has portable Kubernetes resources (Deployment, Service, PVC, ConfigMap). The OpenShift overlay adds a TLS Route and patches in the security context.

Here's the shape of the Deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: n8n
spec:
  replicas: 1
  strategy:
    type: Recreate
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        fsGroup: 1000780000
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: n8n
          image: docker.n8n.io/n8nio/n8n:latest
          ports:
            - containerPort: 5678
          envFrom:
            - configMapRef:
                name: n8n-config
          resources:
            requests:
              memory: 256Mi
              cpu: 100m
            limits:
              memory: 512Mi
              cpu: 500m
          readinessProbe:
            httpGet:
              path: /healthz
              port: 5678
            initialDelaySeconds: 15
          livenessProbe:
            httpGet:
              path: /healthz
              port: 5678
            initialDelaySeconds: 30
          securityContext:
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - ALL
          volumeMounts:
            - name: data
              mountPath: /home/node
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: n8n-data
```

The full manifests are in the [n8n-openshift repo](https://github.com/zanetworker/n8n-openshift) under `base/` and `overlays/openshift/`.

## What broke during testing (and the fixes)

I deployed this to a live OpenShift 4.x sandbox cluster. Three things failed before it worked.

**First crash: `EACCES: mkdir '/.n8n'`**. OpenShift's random UID has no home directory, so `~` resolves to `/`. n8n tried to create its data directory at the filesystem root. Fix: set `N8N_USER_FOLDER=/home/node` in the ConfigMap so n8n writes to the PVC mount instead.

**Second crash: `EACCES: mkdir '/home/node/.n8n'`**. The PVC was mounted at `/home/node/.n8n`, but the random UID couldn't create that directory because its parent `/home/node` was root-owned. Fix: mount the PVC at `/home/node` (the parent) and let n8n create the `.n8n` subdirectory inside the writable volume.

**Third crash: volume not writable**. Even with the correct mount path, the PVC's root filesystem was owned by `root:root` with 755 permissions. The random UID couldn't write. Fix: add `fsGroup` to the pod security context, using the first value from the namespace's supplemental groups range. This makes OpenShift `chgrp` the volume to the pod's group at mount time.

After those three fixes, n8n v2.7.5 booted, ran its SQLite migrations, and the health endpoint returned 200 through the Route.

## Why OpenShift and not just Kubernetes

A fair question. If the base Kustomize layer works on vanilla Kubernetes, why bother with the OpenShift overlay?

The deployment part is the easy bit. The interesting part is what you get access to once n8n is running on OpenShift, especially if your organization already runs OpenShift AI.

**Model serving is already there.** OpenShift AI ships with KServe and vLLM as first-class model serving runtimes. If your team is already serving models through RHOAI (Granite, Llama, Mistral, whatever), n8n can call those models without any additional infrastructure. The models expose OpenAI-compatible `/v1/chat/completions` endpoints on internal Service URLs. n8n talks to them over the cluster network, no ingress or public exposure required.

**GPU scheduling is handled.** OpenShift with the NVIDIA GPU Operator or AMD ROCm support handles GPU time-slicing and MIG partitioning. Your model inference pods get GPU resources through standard Kubernetes resource requests. n8n doesn't need to know anything about GPUs; it just calls an HTTP endpoint. But the fact that the model and the workflow engine live on the same cluster means lower latency and no egress costs.

**Network policy and multi-tenancy are built in.** OpenShift projects give you namespace isolation with network policies out of the box. Your n8n instance can reach your model serving endpoints but can't reach someone else's. On vanilla Kubernetes, you'd have to set this up yourself.

**TLS everywhere without thinking about it.** The Route we created gets a valid certificate from the cluster's wildcard cert. Service-to-service traffic inside the cluster uses the internal CA. No cert management on your part.

## Connecting n8n to vLLM on the same cluster

If you have a vLLM instance running on the same OpenShift cluster (either standalone or through OpenShift AI), the connection is straightforward. The model exposes an OpenAI-compatible API. n8n calls it.

There's a catch with n8n's built-in OpenAI node, though. I tested this with a LiteLLM proxy fronting a DeepSeek R1 model. The curl worked fine:

```bash
curl -X POST https://litellm-proxy.apps.example.com/v1/chat/completions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "DeepSeek-R1-Distill-Qwen-14B-W4A16",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

The response came back with reasoning content and everything. But n8n's OpenAI node returned a 404: `litellm.NotFoundError: Received Model Group=DeepSeek-R1-Distill-Qwen-14B-W4A16`. Same model name, same endpoint, different result.

The issue is that n8n's OpenAI node does its own request construction and model validation. It doesn't always play well with OpenAI-compatible proxies that aren't literally OpenAI. The fix is to skip the OpenAI node entirely and use an **HTTP Request** node:

1. Method: POST
2. URL: `https://your-vllm-or-litellm-endpoint/v1/chat/completions`
3. Authentication: Header Auth with `Authorization: Bearer <key>`
4. Body: raw JSON with model name and messages

This mirrors the curl exactly and works every time. You lose some of n8n's AI-specific node sugar (automatic message history, agent loops), but you gain reliability and control over exactly what gets sent. For most automation use cases, an HTTP Request node that you understand is better than an AI node that silently transforms your request.

## The bigger picture: n8n as an AI workflow glue layer

Running n8n on the same cluster as your model serving infrastructure opens up a specific category of automation that's awkward to build any other way.

**Workflow-triggered inference.** A webhook fires when a support ticket lands, n8n extracts the text, sends it to a Llama model for classification, routes the ticket to the right team, and posts a summary to Slack. Every step is visible in the n8n canvas. No custom Python service, no queue infrastructure, no deployment pipeline for your glue code.

**RAG pipelines with cluster-local retrieval.** If you're running a vector database (Milvus, Qdrant, pgvector) on the same cluster, n8n can orchestrate the full retrieval-augmented generation loop: receive a question, query the vector store, format the context, call the model, return the answer. All traffic stays inside the cluster.

**Model evaluation and monitoring.** Schedule n8n workflows to periodically send test prompts to your models and check the responses. Compare outputs across model versions. Log the results to a spreadsheet or database. This is the kind of operational task that's too small for a dedicated MLOps platform but too important to do manually.

**LLaMA Stack integration.** If you're running Meta's [Llama Stack](https://llama-stack.readthedocs.io/en/latest/) on OpenShift, it exposes REST APIs for inference, safety, memory, and agent orchestration. n8n can call these endpoints the same way it calls vLLM. Use the safety API to check inputs before sending them to the model. Use the memory API to maintain conversation context across workflow executions. Llama Stack's agent API can even handle multi-turn tool-calling loops, with n8n acting as the trigger and routing layer around it.

**Multi-model routing.** With LiteLLM as a proxy (which is what OpenShift AI uses under the hood for model routing), n8n can target different models for different tasks within the same workflow. Send classification tasks to a small, fast model. Send summarization to a larger one. Send code generation to a code-specific model. Each is just a different `model` value in the HTTP Request body.

## What this looks like in practice

The stack, from bottom to top:

```
OpenShift cluster
  |
  +-- GPU nodes with NVIDIA Operator
  |     |
  |     +-- vLLM / KServe InferenceService (your models)
  |     +-- Llama Stack server (optional, for safety/memory/agents)
  |
  +-- CPU nodes
        |
        +-- n8n (this deployment)
        +-- LiteLLM proxy (model routing, optional)
        +-- Vector DB (RAG, optional)
        +-- PostgreSQL (n8n backend, for multi-replica)
```

n8n runs on CPU nodes. It doesn't need GPUs. It calls the model serving endpoints over the internal network. Routes expose n8n to users. Everything else stays internal.

The separation matters. n8n handles the workflow logic: when to call what, what to do with the response, where to send the output. The model servers handle inference. Neither needs to know about the other's internals. If you swap vLLM for TGI, or replace Llama 3 with Granite, n8n doesn't care. You change a URL and a model name.

## Summary of changes from the original PR

| Issue | Original | Fix |
|---|---|---|
| Resource type | DeploymentConfig | Deployment (apps/v1) |
| Container user | root (/root/.n8n) | non-root (/home/node) |
| Credentials | Plain env vars | Remove (deprecated since n8n 0.200) |
| Timezone | "Europe/Hungary" (invalid) | UTC, configurable |
| Resources | None set | Requests and limits |
| Health checks | None | readinessProbe + livenessProbe on /healthz |
| Strategy | Recreate with rollingParams | Recreate (clean) |
| Service selector | deploymentconfig label | app label |
| Template format | OpenShift Template | Kustomize base + overlay |
| Volume permissions | Assumed root | fsGroup from namespace range |

The deployment is the starting point. The real value is what happens after: connecting n8n to the AI infrastructure that's already running on your cluster, and building workflows that would otherwise require custom services, queues, and deployment pipelines. OpenShift gives you the platform. n8n gives you the wiring.
