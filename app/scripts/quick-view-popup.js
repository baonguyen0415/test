import { linkOptions } from "./common/function";
import { PopupComponent } from "./common/model";

class PopupQuickView extends PopupComponent {
  constructor() {
    super();
  }

  open(html) {
    this.querySelector(".js-popup-box-inner").innerHTML = html;
    this.elms = {
      priceCompareElement: this.querySelector(".js-price-compare"),
      priceElement: this.querySelector(".js-price"),
      skuElement: this.querySelector(".js-sku"),
      inventoryElement: this.querySelector(".js-inventory"),
      mediaMain: this.querySelector("#quick-view-product-media-main"),
      mediaThumnails: this.querySelector("#quick-view-product-media-thumnails"),
      selectMaster: this.querySelector("#select-master"),
      addToCartButton: this.querySelector(".js-atc-btn"),
      formElement: this.querySelector("form[action*='/cart/add']"),
      labelSaveContainer: this.querySelector(".js-product-label-save"),
      swatchContainer: this.querySelector("swatch-component"),
      quantityInputContainer: this.querySelector(".js-product-quantity"),
      subscribeForm: this.querySelector("#contact-notify-when-available"),
      dynamicCheckoutContainer: this.querySelector(".js-product-dymanic-checkout"),
    };

    this.settings = JSON.parse(this.querySelector("[data-settings]").innerHTML);
    this.product = JSON.parse(this.querySelector("[data-product-json]").innerHTML);
    this.variantsInventory = JSON.parse(this.querySelector("[data-variants-inventory-json]").innerHTML);

    Object.keys(this.variantsInventory).forEach((variantId) => {
      this.product.variants.find(
        (variant) => variant.id == variantId && Object.assign(variant, this.variantsInventory[variantId]),
      );
    });

    this.initSliderMedia();
    this.initInventory();
    this.initFormAddToCart();
    linkOptions(this.elms.swatchContainer, this.product, this.handleVariantChange.bind(this));
    switch (theme.settings.shop.reviewApp) {
      case "shopify":
        if (window.SPR) {
          window.SPR.initDomEls();
          window.SPR.loadBadges();
        }
        break;
    }
    AT.debounce(() => {
      this.addClass("is-open");
      AT.disableScroll();
    }, 50)();
  }

  initSliderMedia() {
    let { mediaMain, mediaThumnails } = this.elms;
    !customElements.get("slider-component") && AT.initCustomElements("slider-component");
    this.mainSlider = mediaMain.init({ gutter: 12 });

    mediaThumnails.init();
  }

  handleVariantChange(variant) {
    let { skuElement, selectMaster, mediaMain } = this.elms;
    if (!variant) {
      this.updateVariantStatus();
      mediaMain.addClass("product-sold-out");
      return;
    }
    this.currentVariant = variant;
    this.updateLabelSave(variant);
    this.updateVariantStatus(variant);
    this.updatePrice(variant);
    variant.available ? mediaMain.removeClass("product-sold-out") : mediaMain.addClass("product-sold-out");

    !!variant.sku ? (skuElement.innerHTML = variant.sku) : (skuElement.innerHTML = theme.strings.product.skuNA);

    if (!!variant.featured_media) {
      this.mainSlider.goTo(variant.featured_media.position - 1);
    }

    selectMaster.value = variant.id;
  }

  initInventory() {
    let { inventoryElement } = this.elms;

    this.inventory = {
      setStatus: (status, variant) => {
        if (!this.settings.showInventory) {
          return;
        }
        inventoryElement.setAttribute("data-status", status);

        switch (status) {
          case "coming-stock": {
            inventoryElement.querySelector(".inventory_coming-stock").innerHTML = theme.strings.dateComingStock.replace(
              "{{date}}",
              variant.next_incoming_date,
            );
            break;
          }
          case "low-stock": {
            inventoryElement.querySelector(".inventory_low-stock").innerHTML = (
              variant.inventory_quantity > 1 ? theme.strings.product.itemsLowStock : theme.strings.product.itemLowStock
            ).replace("{{quantity}}", variant.inventory_quantity);
            break;
          }
          case "items-stock": {
            inventoryElement.querySelector(".inventory_items-stock").innerHTML = (
              variant.inventory_quantity > 1 ? theme.strings.product.itemsStock : theme.strings.product.itemStock
            ).replace("{{quantity}}", variant.inventory_quantity);
            break;
          }
        }
      },
    };
  }

  updateVariantStatus(variant) {
    let { addToCartButton } = this.elms;
    if (variant) {
      if (this.settings.enableSubscribe) {
        this.updateDynamicCheckout(variant.available);
        this.updateSubscribeForm(variant);
      }
      this.updateAddToCartButton(variant);
      this.updateInventory(variant);
    } else {
      addToCartButton.disabled = true;
      addToCartButton.querySelector("span").innerHTML = theme.strings.product.soldOut;

      this.inventory.setStatus("out-stock");
    }
  }

  updateDynamicCheckout(variantAvailable) {
    let { dynamicCheckoutContainer } = this.elms;
    if (dynamicCheckoutContainer) {
      variantAvailable ? dynamicCheckoutContainer.removeClass("d-none") : dynamicCheckoutContainer.addClass("d-none");
    }
  }

  updateSubscribeForm(variant) {
    let { subscribeForm } = this.elms;
    let inputBody = subscribeForm.querySelector("input[name='contact[body]']");
    let subscribeFormWrapper = subscribeForm.querySelector(".js-product-subscribe");
    !AT.getParameterByName("contact_posted") && subscribeFormWrapper.removeClass("posted-successfully");
    inputBody.value = inputBody.dataset.value.replace("{{product_name}}", variant.name);
    variant.available ? subscribeFormWrapper.addClass("d-none") : subscribeFormWrapper.removeClass("d-none");

    subscribeForm.addEvent("submit", () => {
      AT.cookie.set("subscribe-variant-id", this.currentVariant.id);
    });
  }

  updateAddToCartButton(variant) {
    let { addToCartButton, quantityInputContainer } = this.elms;
    if (variant.available) {
      addToCartButton.disabled = false;
      addToCartButton.querySelector("span").innerHTML =
        variant.inventory_quantity == 0 && variant.incoming
          ? theme.strings.product.preorder
          : theme.strings.product.addToCart;
      this.settings.enableSubscribe && quantityInputContainer.removeClass("d-none");
    } else {
      addToCartButton.disabled = true;
      addToCartButton.querySelector("span").innerHTML = theme.strings.product.soldOut;
      this.settings.enableSubscribe && quantityInputContainer.addClass("d-none");
    }
  }

  updateInventory(variant) {
    if (variant.available) {
      if (variant.inventory_management) {
        if (variant.inventory_quantity == 0 && variant.incoming) {
          this.inventory.setStatus("coming-stock", variant);
        } else {
          variant.inventory_quantity <= this.settings.inventoryThreshold
            ? this.inventory.setStatus("low-stock", variant)
            : this.inventory.setStatus("items-stock", variant);
        }
      } else {
        this.inventory.setStatus("in-stock");
      }
    } else {
      this.inventory.setStatus("out-stock");
    }
  }

  initFormAddToCart() {
    let { formElement, addToCartButton } = this.elms;
    formElement.addEvent("submit", (e) => {

      if(!addToCartButton.hasClass("has-pending")){
        addToCartButton.insertAdjacentHTML("beforeend", '<svg class="svg-loading" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; shape-rendering: auto;" width="28px" height="28px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><circle cx="50" cy="50" fill="none" stroke="var(--main-color)" stroke-width="5" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">  <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform></circle></svg>');
      }

      e.preventDefault();

      addToCartButton.addClass("pending", "has-pending");
      Cart.add(formElement)
        .then(() => {
          this.close();
        })
        .catch((error) => {
          AT.loadPopupMessage().then(() => {
            Popups.closeAll();
            PopupMessage.open(error.description);
          });
        })
        .finally(() => {
          addToCartButton.removeClass("pending");
        });
    });
  }

  updateLabelSave(variant) {
    let { labelSaveContainer } = this.elms;
    // let originalPrice = labelSaveContainer.querySelector(".js-origin-price");
    let percentElement = labelSaveContainer.querySelector(".js-percent");
    let moneySaved = labelSaveContainer.querySelector(".js-money-saved");
    let { compare_at_price, price } = variant;

    if (compare_at_price > price) {
      moneySaved.innerHTML = (compare_at_price - price).toCurrency();
      // originalPrice.innerHTML = compare_at_price.toCurrency();

      percentElement.innerHTML = Math.round(((compare_at_price - price) / compare_at_price) * 100);
      labelSaveContainer.removeClass("d-none");
    } else {
      labelSaveContainer.addClass("d-none");
    }
  }

  updatePrice(variant) {
    let { priceCompareElement, priceElement } = this.elms;
    if (!!variant.compare_at_price) {
      priceCompareElement.innerHTML = variant.compare_at_price.toCurrency();
      priceCompareElement.removeClass("d-none");
    } else {
      priceCompareElement.addClass("d-none");
    }
    priceElement.innerHTML = variant.price.toCurrency();
  }

  switchVariantById(variantId) {
    let { swatchContainer } = this.elms;
    let variantFound = theme.product.variants.find((i) => i.id == variantId);
    if (!variantFound) {
      return;
    }

    variantFound.options.forEach((option, index) => {
      [...swatchContainer.querySelectorAll(`[name='option${index + 1}']`)].find((element) => {
        switch (element.tagName) {
          case "INPUT":
            element.value == option && ((element.checked = true), element.dispatchEvent(new Event("change")));
            break;

          case "SELECT":
            element.value = option;
            element.dispatchEvent(new Event("change"));
            break;
        }
      });
    });
  }
}

let template = document.getElementById("popup-container");

let popupQuickView = template.content.querySelector("popup-quick-view");
if (popupQuickView) {
  template.insertAdjacentElement("beforebegin", popupQuickView);
  customElements.define("popup-quick-view", PopupQuickView);
  window.PopupQuickView = popupQuickView;
  Popups.push("popup-quick-view", window.PopupQuickView);
}

console.log("popup-quick-view script loaded");
