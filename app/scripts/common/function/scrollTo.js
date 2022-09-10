export function scrollTo(element, duration, minus = 0) {
  return new Promise((resolve, reject) => {
    var startingY = window.pageYOffset;
    var elementY = getElementY(element) - minus;

    var targetY =
      document.body.scrollHeight - elementY < window.innerHeight
        ? document.body.scrollHeight - window.innerHeight
        : elementY;
    var diff = targetY - startingY;
    var easing = function (t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };
    var start;
    if (!diff) return resolve(1);
    window.requestAnimationFrame(function step(timestamp) {
      if (!start) start = timestamp;
      var time = timestamp - start;
      var percent = Math.min(time / duration, 1);
      percent = easing(percent);
      window.scrollTo(0, startingY + diff * percent);
      if (time < duration) {
        window.requestAnimationFrame(step);
      } else {
        resolve(1);
      }
    });
  });
}
function getElementY(query) {
  return typeof query == "number" ? query : window.pageYOffset + query.getBoundingClientRect().top;
}
