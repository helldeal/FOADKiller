import { extractTextFromImage } from "./ocr";

async function main() {
  const app = document.getElementById("app")!;
  app.innerHTML = `
    <h2>OCR Local + ChatGPT (sans serveur)</h2>
    <button id="list">Lister les sources</button>
    <select id="sources"></select>
    <button id="capture">Capturer + Analyser</button>
    <input id="question" placeholder="Pose ta question ici" style="width:60%"/>
    <pre id="result"></pre>
  `;

  const listBtn = document.getElementById("list")!;
  const sourcesSelect = document.getElementById("sources") as HTMLSelectElement;
  const captureBtn = document.getElementById("capture")!;
  const resultPre = document.getElementById("result")!;
  const questionInput = document.getElementById("question") as HTMLInputElement;

  listBtn.addEventListener("click", async () => {
    const sources = await (window as any).electronAPI.listSources();
    sourcesSelect.innerHTML = sources
      .map((s: any) => `<option value="${s.id}">${s.name}</option>`)
      .join("");
  });

  captureBtn.addEventListener("click", async () => {
    const sourceId = sourcesSelect.value;
    if (!sourceId) {
      alert("Sélectionnez une source d'abord.");
      return;
    }

    const constraints = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          maxWidth: 1920,
          maxHeight: 1080,
        },
      },
    };

    try {
      // @ts-ignore
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");

      const text = await extractTextFromImage(dataUrl);
      const question = questionInput.value || "Décris ce texte.";

      const response = await (window as any).electronAPI.askGPT({
        text,
        question,
      });
      resultPre.textContent = JSON.stringify(response, null, 2);

      stream.getTracks().forEach((t) => t.stop());
    } catch (err: any) {
      console.error(err);
      alert("Erreur: " + err.message);
    }
  });
}

main();
