"use strict";
document.documentElement.classList.add("js");
document.querySelectorAll("[data-print]").forEach(button => button.addEventListener("click", () => window.print()));
document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
  const category = button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach(b => b.setAttribute("aria-pressed", String(b === button)));
  let visible = 0;
  document.querySelectorAll(".issue").forEach(item => {
    item.hidden = category !== "all" && item.dataset.category !== category;
    if (!item.hidden) visible++;
  });
  document.getElementById("filter-count").textContent = `${visible} of 9 problems shown`;
}));
