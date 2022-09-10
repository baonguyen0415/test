export let loadScript = (url, cb) => {
  let script = document.createElement("script");
  script.src = url;
  !!cb && (script.onload = cb);
  script.onError = () => {
    console.warn("Has an error when loading script:", url);
  };
  document.body.append(script);
};
