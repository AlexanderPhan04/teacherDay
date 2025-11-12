const song = document.getElementById("song");
const playPauseBtn = document.getElementById("play-pause-btn");
const albumArt = document.getElementById("album-art");
const progress = document.getElementById("progress");
const progressContainer = document.getElementById("progress-container");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetTab = button.getAttribute("data-tab");
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(targetTab + "-tab").classList.add("active");
  });
});

let isPlaying = false;
let isDragging = false;

function formatTime(time) {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function playSong() {
  isPlaying = true;
  song.play().catch((error) => {
    console.error("Error:", error);
    alert("Cannot play music. Please check the file.");
    isPlaying = false;
  });
  albumArt.classList.add("playing");
  playPauseBtn.innerHTML = "<span>&#10074;&#10074;</span>";
}

function pauseSong() {
  isPlaying = false;
  song.pause();
  albumArt.classList.remove("playing");
  playPauseBtn.innerHTML = "<span>&#9658;</span>";
}

playPauseBtn.addEventListener("click", () => {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
});

song.addEventListener("timeupdate", (e) => {
  if (isDragging) return; // Không update khi đang kéo
  const duration = e.srcElement.duration;
  const currentTime = e.srcElement.currentTime;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = progressPercent + "%";
  currentTimeEl.textContent = formatTime(currentTime);
  durationEl.textContent = formatTime(duration);
});

// Hàm tính toán và set thời gian từ vị trí click/drag
function setTimeFromPosition(e) {
  const width = progressContainer.clientWidth;
  const rect = progressContainer.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const duration = song.duration;

  if (duration && !isNaN(duration)) {
    const clampedX = Math.max(0, Math.min(clickX, width));
    const newTime = (clampedX / width) * duration;
    song.currentTime = newTime;

    // Update UI ngay lập tức
    const progressPercent = (newTime / duration) * 100;
    progress.style.width = progressPercent + "%";
    currentTimeEl.textContent = formatTime(newTime);
  }
}

// Click để tua
progressContainer.addEventListener("click", (e) => {
  setTimeFromPosition(e);
});

// Bắt đầu kéo
progressContainer.addEventListener("mousedown", (e) => {
  isDragging = true;
  setTimeFromPosition(e);
  progressContainer.style.cursor = "grabbing";
});

// Kéo
document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    setTimeFromPosition(e);
  }
});

// Kết thúc kéo
document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    progressContainer.style.cursor = "pointer";
  }
});

song.addEventListener("ended", pauseSong);

song.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(song.duration);
});

song.addEventListener("error", (e) => {
  console.error("File error:", e);
  alert("Cannot load music file.");
});
