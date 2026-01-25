---
title: "TIL: Python's Built-in HTTP Server"
date: 2026-01-17
tags: ["til", "python"]
type: note
---

Just discovered you can use `python -m http.server` to quickly serve files from any directory. Super useful for testing static sites locally.

```bash
cd my-project
python -m http.server 8080
```

Now available at `http://localhost:8080`.
