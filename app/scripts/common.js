import "./common/define";
import { load, register } from "@shopify/theme-sections";
import { getSizedImageUrl } from "@shopify/theme-images";
import {
  ProductCard,
  SliderComponent,
  Cart,
  CollapsePanel,
  QuantityInput,
  Popups,
  PopupComponent,
} from "./common/model";
import { AnnouncementBar, FeaturedCollection, LogoList, FeaturedBlog, Header } from "./common/section";
import {
  detectVisible,
  initTabPanel,
  disableScroll,
  enableScroll,
  debounce,
  loadScript,
  loadSearch,
  Queue,
  getParameterByName,
  scrollTo,
  initBackToTop,
  cookie,
  loadPopupMessage,
  loadPopupQuickView,
  loadPopupStoreLocation,
  loadCss,
} from "./common/function";
Object.assign(window, {
  load,
  register,
  Cart: new Cart(),
  AT: {
    searchLoaded: false,
    detectVisible,
    initTabPanel,
    disableScroll,
    enableScroll,
    debounce,
    loadScript,
    loadCss,
    loadSearch,
    getParameterByName,
    getSizedImageUrl,
    scrollTo,
    queue: new Queue(),
    cookie,
    loadPopupMessage,
    loadPopupQuickView,
    loadPopupStoreLocation,
    initCustomElements(name) {
      switch (name) {
        case "slider-component":
          customElements.define(name, SliderComponent);
          break;
        case "collapse-panel":
          customElements.define(name, CollapsePanel);
      }
    },
    productsViewedQuickly: {},
  },
});

window.Popups = new Popups();
window.PopupComponent = PopupComponent;
theme.customElementsList &&
  [...new Set(theme.customElementsList)].forEach((name) => {
    switch (name) {
      case "slider-component":
        customElements.define(name, SliderComponent);
        break;
      case "collapse-panel":
        customElements.define(name, CollapsePanel);
    }
  });
customElements.define("product-card", ProductCard);
customElements.define("quantity-input", QuantityInput);
register("header", Header);

theme.sectionRegister &&
  theme.sectionRegister.forEach((name) => {
    switch (name) {
      case "announcement-bar":
        register("announcement-bar", AnnouncementBar);
        break;
      case "featured-collection":
        register("featured-collection", FeaturedCollection);
        break;
      case "logo-list":
        register("logo-list", LogoList);
        break;
      case "featured-blog":
        register("featured-blog", FeaturedBlog);
        break;
    }
  });
load("*");
document.querySelectorAll("input[name='q']").addEvents("click", () => AT.loadSearch(), { once: true });
console.log("global.js loaded");
document.dispatchEvent(new CustomEvent("global.js loaded"));
initBackToTop(); 
