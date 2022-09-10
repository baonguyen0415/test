export function disableScroll() {
  let paddingRight = window.innerWidth - document.documentElement.offsetWidth + "px";
  document.documentElement.style.paddingRight = paddingRight;
  document.documentElement.addClass("overflow-hidden");
}
