// single draggable shit
function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// mute button shit
function toggleMuteAudio(e) {
  let audioel = document.getElementById("audio-element");
  let mutebtn = document.getElementById("mute-btn");
  if (audioel.muted) {
    audioel.muted = false;
    mutebtn.innerHTML = "mute";
  } else {
    audioel.muted = true;
    mutebtn.innerHTML = "unmute";
  }
}

// set audio time based on current time since epoch
function setAudioTime() {
  let audioel = document.getElementById("audio-element");
  const duration = audioel.duration;
  const timestamp = Date.now() / 1000;
  const audiotime = timestamp % duration;
  audioel.currentTime = audiotime;
}

// grab metadata
function getAudioMetadata() {
  let audioel = document.getElementById("audio-element");
  let audiosrc = document.getElementById("audio-src");
  let jsmediatags = window.jsmediatags;
  jsmediatags.read(audiosrc.src, {
    onSuccess: function (tag) {
      const tags = tag.tags;
      $("#metadata span").html(`${tags.artist} - ${tags.album}`);
    },
    onError: function (err) {
      console.log(error.type, error.info);
    },
  });
}

// distorion + pitchshift
let distortionFx, pitchShiftFx;
let source = null;
let gainNode = null;

const refreshintvrl = 10.0;
let lastmousex = -1;
let lastmousey = -1;

function initAudioTone() {
  let audioel = document.getElementById("audio-element");
  let source = Tone.getContext().rawContext.createMediaElementSource(audioel);
  pitchShiftFx = new Tone.PitchShift();
  distortionFx = new Tone.Distortion();

  Tone.connect(source, pitchShiftFx);
  Tone.connect(pitchShiftFx, distortionFx);
  Tone.connect(distortionFx, Tone.getContext().destination);
}

function fxOnMove(e) {
  let target = e;
  if (e.type === "touchmove")
    target = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
  let mousex = target.clientX;
  let mousey = target.clientY;
  let xtravel = Math.abs(mousex - lastmousex);
  let ytravel = Math.abs(mousey - lastmousey);
  lastmousex = mousex;
  lastmousey = mousey;
  distortionFx.distortion = xtravel / refreshintvrl;
  pitchShiftFx.pitch = ytravel / refreshintvrl;
  // console.log(xtravel / refreshintvrl, ytravel / refreshintvrl);
}

// drag image into window
const uploadCanvas = document.getElementById("upload-canvas");
const imgupload = document.getElementById("imgupload");
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  uploadCanvas.addEventListener(eventName, preventDefaults, false);
});
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

uploadCanvas.addEventListener("drop", handleDrop, false);
function handleDrop(e) {
  let dt = e.dataTransfer;
  let files = dt.files;
  readURL(files);
}

$("#imgupload").change(function () {
  readURL(this.files);
});

function readURL(files) {
  if (files && files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      $("body").css("background", `url("${e.target.result}")`);
    };
    reader.readAsDataURL(files[0]); // convert to base64 string
  }
}

// drag upload canvas handle highlights
["dragenter", "dragover"].forEach((eventName) => {
  uploadCanvas.addEventListener(eventName, highlight, false);
});
["dragleave", "drop"].forEach((eventName) => {
  uploadCanvas.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
  uploadCanvas.classList.add("highlight");
}

function unhighlight(e) {
  uploadCanvas.classList.remove("highlight");
}

// ready?
window.onload = () => {
  const md = new MobileDetect(window.navigator.userAgent);
  let audioel = document.getElementById("audio-element");
  setAudioTime();
  if (md.mobile()) {
    $("#metadata").on("touchstart", async (e) => {
      Tone.getContext().resume();
      audioel.play();
      $("#metadata").unbind("touchstart");
    });
  } else {
    audioel.autoplay = true;
  }

  dragElement(document.getElementById("chatango"));
  $("#mute-btn").on("click", toggleMuteAudio);
  getAudioMetadata();
  initAudioTone();
  if (md.mobile()) {
    $(document).on("touchmove", fxOnMove);
  } else {
    $(document).mousemove(fxOnMove);
  }
};
