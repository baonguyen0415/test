import { StoreLocation } from "./common/model";

class PopupStoreLocation extends PopupComponent {
  constructor() {
    super();
    let storesJSON = JSON.parse(this.querySelector("[data-location-list-json]").innerHTML);
    let storeListContainer = this.querySelector(".js-find-store-location-list");
    let storeItemTemplate = storeListContainer.firstElementChild;
    let countrySelect = this.querySelector(".js-find-store-location-country");

    storesJSON.features.forEach(({ properties }) => {
      let li = storeItemTemplate.cloneNode(true);

      li.removeClass("d-none", "template");
      li.querySelector(".js-name").innerHTML = properties["Store Name"];
      li.querySelector(".js-address").innerHTML = properties["Full Address"];
      li.setAttribute("data-country", properties["Country"]);
      li.setAttribute("data-city", properties["City"]);
      li.setAttribute("data-lat", properties["Latitude"]);
      li.setAttribute("data-long", properties["Longitude"]);
      storeListContainer.append(li);
    });

    let countries = storesJSON.features.reduce((acc, { properties }) => {
      acc[properties["Country"]] = [...(acc[properties["Country"]] || []), properties["City"]];
      return acc;
    }, {});

    Object.keys(countries).forEach((country) => {
      let option = document.createElement("option");
      option.innerText = country;

      option.dataset.cities = JSON.stringify(countries[country]);
      countrySelect.append(option);
    });
    this.querySelectorAll(".js-popup-close").addEvents("click", this.close.bind(this));
    document.addEvent("store-location-popup-open", this.open.bind(this));
    document.addEvent("store-location-popup-open", () => new StoreLocation(this, "popup-map"), { once: true });
  }
}

let popupTemplate = document.getElementById("popup-container");
let storeLocationPopup = popupTemplate.content.querySelector(".popup-store-location");

popupTemplate.insertAdjacentElement("beforebegin", storeLocationPopup);
customElements.define("popup-store-location", PopupStoreLocation);
Popups.push("popup-store-location", storeLocationPopup);
console.log("store-location-popup.js loaded");
