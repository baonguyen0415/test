export function loadPopupStoreLocation() {
  let arrPromise = [
    new Promise((res, rej) => {
      AT.loadCss(theme.assets.mapboxCss, () => {
        res(1);
      });
    }),
    new Promise((res, rej) => {
      AT.loadScript(theme.assets.mapboxJs, () => {
        res(1);
      });
    }),
    new Promise((res, rej) => {
      AT.loadScript(theme.assets.storeLocationPopup, () => {
        res(1);
      });
    }),
  ];
  return Promise.all(arrPromise);
}
