import { YMMSearch } from "./common/model/ymm-search";

class PopupYMMSearch extends PopupComponent {
  constructor() {
    super();

    document.addEvent("ymm-search-popup-open", this.open.bind(this));
    document.addEvent("show-my-vehicles", this.close.bind(this));

    new YMMSearch(this.querySelector(".ymm-search"));
  }
}

let popupTemplate = document.getElementById("popup-container");
let popupYMMSearch = popupTemplate.content.querySelector("popup-ymm-search");

popupTemplate.insertAdjacentElement("beforebegin", popupYMMSearch);
customElements.define("popup-ymm-search", PopupYMMSearch);
Popups.push("popup-ymm-search", popupYMMSearch);
console.log("ymm-search-popup.js loaded");
