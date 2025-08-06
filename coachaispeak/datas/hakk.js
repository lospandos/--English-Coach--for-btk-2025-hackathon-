document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("easterEggBtn");
  const msg = document.getElementById("easterEgg");

  btn.addEventListener("click", () => {
    msg.classList.toggle("visible");
  });
});
