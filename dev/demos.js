function onEndRecording(event) {
    const currentRecording = event.target.recording;
    const link = document.createElement('a');
    const data = `data:text/json;charset=utf-8,${
        encodeURIComponent( JSON.stringify(currentRecording)
        )}`;
    link.setAttribute('download', `${event.target.tagName}-${Date.now()}.json`);
    link.setAttribute('href', data);
    link.innerText = 'Download Recording';
    document.body.appendChild(link);
}