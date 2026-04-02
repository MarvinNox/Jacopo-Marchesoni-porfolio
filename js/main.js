const video = document.querySelector(".hero__video");

if (video) {
  video.muted = true;
  video.play().catch(() => {
    console.log("Автоплей був заблокований браузером");
  });
}
