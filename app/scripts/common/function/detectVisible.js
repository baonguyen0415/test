export let detectVisible = ({ element, rootMargin, callback, threshold = 0 }) => {
  if (typeof IntersectionObserver === "undefined") {
    callback();
    return;
  }
  let observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(element);
        }
      });
    },
    { rootMargin },
  );

  observer.observe(element);
};
