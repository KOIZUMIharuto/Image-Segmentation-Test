import DeviceDetector from "https://cdn.skypack.dev/device-detector-js@2.2.10";

testSupport([
  {client: 'Chrome'},
]);

function testSupport(supportedDevices) {
  const deviceDetector = new DeviceDetector();
  const detectedDevice = deviceDetector.parse(navigator.userAgent);

  let isSupported = false;
  for (const device of supportedDevices) {
    if (device.client !== undefined) {
      const re = new RegExp(`^${device.client}$`);
      if (!re.test(detectedDevice.client.name)) {
        continue;
      }
    }
    if (device.os !== undefined) {
      const re = new RegExp(`^${device.os}$`);
      if (!re.test(detectedDevice.os.name)) {
        continue;
      }
    }
    isSupported = true;
    break;
  }
  if (!isSupported) {
    alert(`This demo, running on ${detectedDevice.client.name}/${detectedDevice.os.name}, ` +
          `is not well supported at this time, continue at your own risk.`);
  }
}

const controls = window;
const mpSelfieSegmentation = window;

const examples = {
  images: [],
  videos: [],
};

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const controlsElement = document.getElementsByClassName('control-panel')[0];
const canvasCtx = canvasElement.getContext('2d');

const fpsControl = new controls.FPS();

const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

let activeEffect = 'mask';
function onResults(results) {
  document.body.classList.add('loaded');

  fpsControl.tick();

  canvasCtx.save();

  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.drawImage(
    results.segmentationMask, 0, 0, canvasElement.width,
    canvasElement.height
  );

  if (activeEffect === 'mask' || activeEffect === 'both') {
    canvasCtx.globalCompositeOperation = 'source-in';
    canvasCtx.fillStyle = '#00FF007F';
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
  } else {
    canvasCtx.globalCompositeOperation = 'source-out';
    canvasCtx.fillStyle = '#0000FF7F';
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
  }

  canvasCtx.globalCompositeOperation = 'destination-atop';
  canvasCtx.drawImage(
    results.image, 0, 0, canvasElement.width, canvasElement.height
  );

  canvasCtx.restore();
}

const selfieSegmentation = new SelfieSegmentation({ locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`;
}});
selfieSegmentation.onResults(onResults);

new controls
  .ControlPanel(controlsElement, {
    selfieMode: true,
    modelSelection: 1,
    effect: 'mask',
  })
  .add([
    new controls.StaticText({ title: 'MediaPipe Selfie Segmentation' }),
    fpsControl,
    new controls.Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
    new controls.SourcePicker({
      onSourceChanged: () => {
        selfieSegmentation.reset();
      },
      onFrame: async (input, size) => {
        const aspect = size.height / size.width;
        let width, height;
        if (window.innerWidth > window.innerHeight) {
          height = window.innerHeight;
          width = height / aspect;
        } else {
          width = window.innerWidth;
          height = width * aspect;
        }
        canvasElement.width = width;
        canvasElement.height = height;
        await selfieSegmentation.send({ image: input });
      },
      examples: examples
    }),
    new controls.Slider({
      title: 'Model Selection',
      field: 'modelSelection',
      discrete: ['General', 'Landscape'],
    }),
    new controls.Slider({
      title: 'Effect',
      field: 'effect',
      discrete: { 'background': 'Background', 'mask': 'Foreground' },
    }),
  ])
  .on(x => {
    const options = x;
    videoElement.classList.toggle('selfie', options.selfieMode);
    activeEffect = x['effect'];
    selfieSegmentation.setOptions(options);
  });
