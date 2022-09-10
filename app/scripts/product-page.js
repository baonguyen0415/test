import { ProductDefault, RelatedProducts } from "./common/section";

(() => {
  theme.sectionRegister.forEach((item) => {
    switch (item) {
      case "product-template":
        register(item, ProductDefault);
        break;

      case "related-products":
        register(item, RelatedProducts);
        break;
    }
  });
  load("*");
  console.log("product-page.js loaded");
})();
