import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg()

const load = async () => {
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
  ffmpeg.on('log', ({ message }) => {
      console.log(message);
  });
  // toBlobURL is used to bypass CORS issue, urls with the same
  // domain can be used directly.
  await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
  });
  console.log("DONE")
}
load()


export default function captureStreamFromCanvasWasm(canvasNode: HTMLCanvasElement) {
  const stream = canvasNode.captureStream(60);
  const recorder = new MediaRecorder(stream);

  recorder.addEventListener("dataavailable", finishCapturing);

  recorder.start();

  return () => recorder.stop();
  // returning recorder.stop and calling it outside of this function
  // cause error "Uncaught TypeError: Illegal invocation"
}


function finishCapturing(e: MediaRecorderEventMap["dataavailable"]) {
  var videoData = [e.data];
  // var blob = new Blob(videoData, { type: "video/mp4" });
  // var blob = new Blob(videoData, { type: "application/pdf" });
  var blob = new Blob(videoData, { type: "video/webm" });
  var blobURL = URL.createObjectURL(blob);
  download(blobURL)
  // transcode(blobURL)
}

// 'https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm'
async function transcode(url: string) {
  await ffmpeg.writeFile('input.webm', await fetchFile(url));
  await ffmpeg.exec(['-i', 'input.webm', 'output.mp4']);
  const data = await ffmpeg.readFile('output.mp4') as Uint8Array;
  const mp4Url =
      URL.createObjectURL(new Blob([data.buffer], {type: 'video/mp4'}));
  download(mp4Url)
}

function download(url: string) {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";
  a.href = url;
  a.download = "maybe_this_name";
  a.click();
  // window.URL.revokeObjectURL(blobURL);
}