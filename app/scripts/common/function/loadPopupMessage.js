import { PopupMessage } from "../model";

export function loadPopupMessage() {
  return new Promise((resolve, reject) => {
    if (typeof window.PopupMessage != "undefined") {
      resolve(1);
      return;
    }

    let template = document.getElementById("popup-container");
    let popupMessage = template.content.querySelector("popup-message");
    if (popupMessage) {
      template.insertAdjacentElement("beforebegin", popupMessage);
      customElements.define("popup-message", PopupMessage);
      window.PopupMessage = popupMessage;
      Popups.push("popup-message", window.PopupMessage);
      return resolve(1);
    }
    return reject(0);
  });
}
