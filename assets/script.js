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
  audioel.autoplay = true;
}

// grab metadata
function getAudioMetadata() {
  let audioel = document.getElementById("audio-element");
  let audiosrc = document.getElementById("audio-src");
  let jsmediatags = window.jsmediatags;
  jsmediatags.read(audiosrc.src, {
    onSuccess: function (tag) {
      const tags = tag.tags;
      let metadata = document.getElementById("metadata");
      metadata.innerHTML = `${tags.artist} - ${tags.album}`;
    },
    onError: function (err) {
      console.log(error.type, error.info);
    },
  });
}

// ready?
window.onload = () => {
  dragElement(document.getElementById("chatango"));
  $("#mute-btn").on("click", toggleMuteAudio);
  setAudioTime();
  getAudioMetadata();
};
