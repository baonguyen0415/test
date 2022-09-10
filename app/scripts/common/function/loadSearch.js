export let loadSearch = function () {
  return new Promise((resolve, reject) => {
    if (AT.searchLoaded) {
      reject(0);
    } else {
      AT.loadScript(theme.assets.search, () => {
        AT.searchLoaded = true;
        resolve(1);
      });
    }
  });
};
