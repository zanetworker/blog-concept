---
title: "Deploying n8n on OpenShift: What Actually Works in 2026"
date: 2026-02-16
tags: ["openshift", "kubernetes", "n8n", "kustomize", "devops"]
type: entry
summary: "A community PR from 2021 tried to add an OpenShift template to n8n. It never merged. Here's what was wrong with it, what breaks on modern clusters, and how to build a working deployment with Kustomize."
cover: "images/builder-pms.png"
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
---

![](images/builder-pms.png)

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
