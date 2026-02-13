(() => {
  const statusEl = document.getElementById("status");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const sendBtn = document.getElementById("sendBtn");
  const localPlayer = document.getElementById("localPlayer");
  const remotePlayer = document.getElementById("remotePlayer");

  let mediaRecorder = null;
  let chunks = [];
  let recordedBlob = null;

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  function pickMimeType() {
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"];
    return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || "";
  }

  async function startRecording() {
    setStatus("Requesting microphone permission…");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    chunks = [];
    recordedBlob = null;

    const mimeType = pickMimeType();
    mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());

      recordedBlob = new Blob(chunks, { type: mediaRecorder.mimeType || "audio/webm" });
      const localUrl = URL.createObjectURL(recordedBlob);
      localPlayer.src = localUrl;

      setStatus(
        `Recorded ${Math.round(recordedBlob.size / 1024)} KB\n` + `MIME: ${recordedBlob.type}\n` + `Ready to send.`,
      );

      sendBtn.disabled = false;
    };

    mediaRecorder.start();
    setStatus(`Recording… (MIME: ${mediaRecorder.mimeType || "default"})`);
    startBtn.disabled = true;
    stopBtn.disabled = false;
    sendBtn.disabled = true;
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    stopBtn.disabled = true;
    startBtn.disabled = false;
  }

  async function sendToN8n() {
    if (!recordedBlob) {
      alert("Record something first.");
      return;
    }

    setStatus("Uploading audio to server…");

    const form = new FormData();
    form.append("audio", recordedBlob, "recording.webm");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/record", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        setStatus(`Server returned HTTP ${res.status}\n\n${errorText}`);
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      setStatus(`Got response. Content-Type: ${contentType}\nDownloading audio…`);

      const outBlob = await res.blob();

      const outUrl = URL.createObjectURL(outBlob);
      remotePlayer.src = outUrl;

      setStatus(
        `Done.\n` +
          `Response bytes: ${Math.round(outBlob.size / 1024)} KB\n` +
          `Response MIME: ${outBlob.type || contentType || "unknown"}\n` +
          `Playing below.`,
      );

      remotePlayer.play().catch(() => {});
    } catch (err) {
      setStatus("Send failed:\n" + String(err));
    }
  }

  // Event listeners
  startBtn.addEventListener("click", () =>
    startRecording().catch((err) => {
      setStatus("Could not start recording:\n" + String(err));
    }),
  );
  stopBtn.addEventListener("click", stopRecording);
  sendBtn.addEventListener("click", () =>
    sendToN8n().catch((err) => {
      setStatus("Send failed:\n" + String(err));
    }),
  );

  // Initialize status
  setStatus("Ready. Click 'Start recording' to begin.");
})();
