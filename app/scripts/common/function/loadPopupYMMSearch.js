export function loadPopupYMMSearch() {
  return new Promise((resolve, reject) => {
    if (typeof window.PopupYMMSearch != "undefined") {
      return resolve(1);
    }

    AT.loadScript(theme.assets.popupYMMSearch, () => {
      resolve(1);
    });
  });
}
