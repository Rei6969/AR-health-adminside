const images = [
  "./media/Selected/IMG_5678.JPG",
  "./media/Selected/IMG_5680.JPG",
  "./media/Selected/IMG_5684.JPG",
  "./media/Selected/IMG_5687.JPG",
  "./media/Selected/IMG_5689.JPG",
  "./media/Selected/IMG_5691.JPG",
  "./media/Selected/IMG_5693.JPG",
  "./media/Selected/IMG_5696.JPG",
  "./media/Selected/IMG_5700.JPG",
  "./media/Selected/IMG_5704.JPG",
  "./media/Selected/IMG_5708.JPG",
  "./media/Selected/IMG_5715.JPG",
];

let currentIndex = 0;
let showingDiv = 1;

const preloadedImages = [];
images.forEach((src) => {
  const img = new Image();
  img.src = src;
  preloadedImages.push(img);
});

function changeBackground() {
  const currentDiv = document.getElementById(`background${showingDiv}`);
  const nextDiv = document.getElementById(
    `background${showingDiv === 1 ? 2 : 1}`
  );

  nextDiv.style.backgroundImage = `url(${images[currentIndex]})`;
  currentDiv.classList.remove("show");
  nextDiv.classList.add("show");

  currentIndex = (currentIndex + 1) % images.length;
  showingDiv = showingDiv === 1 ? 2 : 1;
}

setInterval(changeBackground, 3000);
changeBackground();
