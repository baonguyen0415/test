export function initBackToTop() {
  let backToTopButton = document.getElementById("back-to-top");

  backToTopButton.addEvent("click", () => {
    AT.scrollTo(0, 1000);
  });

  window.addEvent("scroll", () => {
    if (window.pageYOffset > window.innerHeight * 1.5) {
      backToTopButton.addClass("show");
    } else {
      backToTopButton.removeClass("show");
    }
  });
}
