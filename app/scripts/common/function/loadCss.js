export let loadCss = (url, cb) => {
  let link = document.createElement("link");
  link.href = url;
  link.rel = "stylesheet";
  link.as = "style";
  !!cb && (link.onload = cb);
  link.onError = () => {
    console.warn("Has an error when loading link:", url);
  };
  document.head.append(link);
};
