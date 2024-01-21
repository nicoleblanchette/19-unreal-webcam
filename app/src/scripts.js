const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');
const snapshot = document.querySelector('#take-photo')
const greenScreen = document.querySelector('#greenscreen')
const redShift = document.querySelector('#redshift')
const glitch = document.querySelector('#glitch')

let toggleRed = false
let toggleGreenScreen = false
let toggleGlitch = false

const glitcher = (pixels) => {
  for (let i = 0; i < pixels.data.length; i+=4) {
    pixels.data[i + 101] = pixels.data[i + 0]; // RED
    pixels.data[i - 30] = pixels.data[i + 1]; // GREEN
    // set green to +75 to break it
    pixels.data[i + 50] = pixels.data[i + 2]; // Blue
  }
  return pixels;
}

const greenScreener = (pixels) => {
  const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });
 
  for (let i = 0; i < pixels.data.length; i += 4) {
    let red = pixels.data[i + 0];
    let green = pixels.data[i + 1];
    let blue = pixels.data[i + 2];
    let alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}

const redShifter = (pixels) => {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 100; // RED
    pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
  }
  return pixels;
};


const getVideo = () => {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      console.log(localMediaStream)
      // video.src = window.URL.createObjectURL(localMediaStream)
      video.srcObject = localMediaStream
      video.play()
    })
    .catch(err => {
      console.error('uh oh!', err)
    })
};

const paintToCanvas = () => {
  const width = video.videoWidth
  const height = video.videoHeight
  canvas.width = width
  canvas.height = height
  // const width = canvas.width
  // const height = canvas.height

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height)
    let pixels = ctx.getImageData(0, 0, width, height)
    if (toggleRed) pixels = redShifter(pixels)
    if (toggleGreenScreen) pixels = greenScreener(pixels)
    if (toggleGlitch) pixels = glitcher(pixels)


    ctx.putImageData(pixels, 0, 0)
  }, 16)

}




const takePhoto = () => {
  snap.currentTime = 0
  snap.play()

  const data = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = data
  link.setAttribute('download', 'silly')
  link.textContent = 'Download Image'
  link.innerHTML = `<img src="${data}" alt="Handsome Man">`
  strip.insertBefore(link, strip.firstChild)
}

const handleGreenScreen = (e) => {
  toggleGreenScreen = !toggleGreenScreen
}


// let toggleRed = false
const handleRedShift = (pixels) => {
  toggleRed = !toggleRed

}

const handleGlitch = (e) => {
  toggleGlitch = !toggleGlitch
}

getVideo();
video.addEventListener('canplay', paintToCanvas);
snapshot.addEventListener('click', takePhoto)
greenScreen.addEventListener('click', handleGreenScreen)
redShift.addEventListener('click', handleRedShift)
glitch.addEventListener('click', handleGlitch)



