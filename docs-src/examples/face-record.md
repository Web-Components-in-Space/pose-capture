---
layout: example.11ty.cjs
title: Pose Capture ⌲ Examples ⌲ Face Visualization & Recording
tags: example
name: Face Visualization & Recording
description: Face Visualization & Recording
---

<style>
  facelandmark-video {
    width: 640px;
    height: 480px;
  }
</style>

<script>

document.body.addEventListener('endrecording', (e) => {
  onEndRecording(e);
});

function onEndRecording(event) {
    const currentRecording = event.target.recording;
    const link = document.createElement('a');
    const data = `data:text/json;charset=utf-8,${
        encodeURIComponent( JSON.stringify(currentRecording)
        )}`;
    link.setAttribute('download', `${event.target.tagName}-${Date.now()}.json`);
    link.setAttribute('href', data);
    link.click();
}
</script>

<facelandmark-video usecamera>
    <visualization-canvas></visualization-canvas>
    <pose-playback-controls></pose-playback-controls>
</facelandmark-video>


```css
facelandmark-video {
    width: 640px;
    height: 480px;
}
```

<h3>HTML</h3>

```html
<facelandmark-video usecamera>
    <visualization-canvas></visualization-canvas>
</facelandmark-video>
```

```javascript
document.body.addEventListener('endrecording', (e) => {
    onEndRecording(e);
});

function onEndRecording(event) {
    const currentRecording = event.target.recording;
    const link = document.createElement('a');
    const data = `data:text/json;charset=utf-8,${
        encodeURIComponent( JSON.stringify(currentRecording)
        )}`;
    link.setAttribute('download', `${event.target.tagName}-${Date.now()}.json`);
    link.setAttribute('href', data);
    link.click();
}
```