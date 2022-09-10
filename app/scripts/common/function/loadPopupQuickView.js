export function loadPopupQuickView() {
  return new Promise((resolve, reject) => {
    if (typeof window.PopupQuickView != "undefined") {
      return resolve(1);
    }

    AT.loadScript(theme.assets.popupQuickView, () => {
      resolve(1);
    });
  });
}
