---
layout: example.11ty.cjs
title: Pose Capture ⌲ Examples ⌲ Pose Playback
tags: example
name: Pose Recording Playback
description: Pose Recording Playback
---

<style>
  pose-player {
    width: 640px;
    height: 480px;
  }
</style>
<pose-player src="../sample.json" autoplay>
    <visualization-canvas></visualization-canvas>
</pose-player>


```css
pose-player {
    width: 640px;
    height: 480px;
}
```

<h3>HTML</h3>

```html
<pose-player src="../sample.json" autoplay>
    <visualization-canvas></visualization-canvas>
</pose-player>
```
