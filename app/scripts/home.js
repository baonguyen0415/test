import {
  LogoList,
  FeaturedCollections,
} from "./common/section";

(function () {
  theme.sectionRegister.forEach(registerSection);

  load("*");
  if (Shopify.designMode) {
    document.addEventListener("shopify:section:load", function ({ detail: { sectionId } }) {
      try {
        let element = document.getElementById("section-" + sectionId);
        if (!element) {
          return;
        }
        let { sectionType } = element.dataset;
        if (element && !Shopify.theme.sections.instances.find((item) => item.container === element)) {
          if (theme.sectionRegister.includes(sectionType)) {
            load(element.dataset.sectionType);
          } else {
            registerSection(sectionType);
            load(sectionType);
          }
        }
      } catch (error) {
        console.log(error);
        console.warn(sectionId);
      }
    });
  }

  function registerSection(type) {
    switch (type) {
      case "logo-list":
        register(type, LogoList);
        break;
      case "featured-blog":
        register(type, BlogSection);
        break;
      case "featured-collections":
        register(type, FeaturedCollections);
        break;
    }
  }
  console.log("home.js loaded");
})();
