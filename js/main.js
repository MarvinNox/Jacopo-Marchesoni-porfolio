const CLOUD_NAME = "marvin-nox";
const TAG = "tenjou-gallery";
const LIST_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG}.json`;

const toggle = document.getElementById("theme-toggle");
const html = document.documentElement;

let galleryItems = [];
let currentIndex = 0;

const video = document.querySelector(".hero__video");

if (video) {
  video.addEventListener("error", () => {
    video.classList.add("is-hidden");
  });

  video.play().catch(() => {
    video.classList.add("is-hidden");
  });
}

const saved = localStorage.getItem("theme");
if (saved === "dark") {
  html.classList.add("dark");
  toggle.checked = true;
}

toggle.addEventListener("change", () => {
  if (toggle.checked) {
    html.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    html.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
});

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildPreviewUrl(item) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,g_auto,w_900,h_650/f_auto,q_auto/${item.public_id}.${item.format}`;
}

function buildFullUrl(item) {
  return item.secure_url
    ? item.secure_url
    : `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${item.public_id}.${item.format}`;
}

function mapCloudinaryItem(item) {
  return {
    id: item.asset_id || item.public_id,
    alt: item.context?.custom?.alt || item.display_name || item.public_id || "",
    caption: item.context?.custom?.caption || "",
    preview: buildPreviewUrl(item),
    full: buildFullUrl(item),
  };
}

function renderGallery(items) {
  items.forEach((item, index) => {
    const img = document.getElementById(`gallery-img-${index}`);
    if (!img) return;

    img.src = item.preview;
    img.alt = item.alt || "";
    img.dataset.full = item.full;
    img.dataset.caption = item.caption || "";
    img.loading = "lazy";
  });
}

async function loadGallery() {
  try {
    const res = await fetch(LIST_URL);
    if (!res.ok) throw new Error("Failed to fetch Cloudinary list");

    const data = await res.json();
    const resources = data.resources || [];

    galleryItems = shuffle(resources).slice(0, 6).map(mapCloudinaryItem);

    renderGallery(galleryItems);
  } catch (error) {
    console.error("Cloudinary gallery error:", error);
  }
}

function openLightbox(index) {
  const item = galleryItems[index];
  if (!item) return;

  currentIndex = index;

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");

  lightboxImg.src = item.full;
  lightboxImg.alt = item.alt || "";
  lightbox.style.display = "flex";
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");

  lightbox.style.display = "none";
  lightboxImg.src = "";
}

function showImage(index) {
  if (!galleryItems.length) return;

  if (index < 0) index = galleryItems.length - 1;
  if (index >= galleryItems.length) index = 0;

  currentIndex = index;

  const item = galleryItems[currentIndex];
  const lightboxImg = document.getElementById("lightbox-img");

  lightboxImg.src = item.full;
  lightboxImg.alt = item.alt || "";
}

function prevImage(event) {
  if (event) event.stopPropagation();
  showImage(currentIndex - 1);
}

function nextImage(event) {
  if (event) event.stopPropagation();
  showImage(currentIndex + 1);
}

document.addEventListener("keydown", function (e) {
  const lightbox = document.getElementById("lightbox");

  if (lightbox.style.display !== "flex") return;

  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showImage(currentIndex - 1);
  if (e.key === "ArrowRight") showImage(currentIndex + 1);
});

document.getElementById("lightbox").addEventListener("click", function (e) {
  if (e.target === this) {
    closeLightbox();
  }
});

document
  .querySelector(".lightbox-content")
  .addEventListener("click", function (e) {
    e.stopPropagation();
  });

loadGallery();
AOS.init();
