import { linkOptions } from "../function";

export let ProductDefault = {
  onLoad: function () {
    let container = this.container;
    this.product = theme.product;
    this.elms = {
      priceCompareElement: container.querySelector(".js-price-compare"),
      priceElement: container.querySelector(".js-price"),
      skuElement: container.querySelector(".js-sku"),
      inventoryElement: container.querySelector(".js-inventory"),
      mediaMain: document.getElementById("product-media-main"),
      mediaThumnails: document.getElementById("product-media-thumnails"),
      selectMaster: container.querySelector("#select-master"),
      addToCartButton: container.querySelector(".js-atc-btn"),
      formElement: container.querySelector("form[action*='/cart/add']"),
      labelSaveContainer: container.querySelector(".js-product-label-save"),
      swatchContainer: container.querySelector("swatch-component"),
      findStoreButton: container.querySelector(".js-find-store-btn"),
      quantityInputContainer: container.querySelector(".js-product-quantity"),
      subscribeForm: container.querySelector("#contact-notify-when-available"),
      dynamicCheckoutContainer: container.querySelector(".js-product-dymanic-checkout"),
    };

    this.settings = JSON.parse(this.container.querySelector("[data-settings]").innerHTML);

    let shippingTime = document.querySelector(".shipping-time");
    if(shippingTime){
      this.initOrderDeadLine();
      this.initOrderShipping();
    }

    let checkbundledAddToCart = document.querySelector("#bundledAddToCart");
    if(checkbundledAddToCart){
      this.initProductItemEvents();
      this.initMultiVariantEvents();
    } 

    this.initSliderMedia();
    this.initInventory();
    this.initFormAddToCart();
    linkOptions(this.elms.swatchContainer, this.product, this.handleVariantChange.bind(this));
    this.initScrollToReviews();

    if (AT.getParameterByName("contact_posted")) {
      this.switchVariantById(AT.cookie.get("subscribe-variant-id"));
      AT.cookie.delete("subscribe-variant-id");
      let searchParams = window.location.search
        .replace("?", "")
        .split("&")
        .filter((param) => !param.includes("contact_posted"))
        .filter(Boolean)
        .join("&");
      window.history.replaceState({}, "", `${window.location.pathname}?${searchParams}`);
    }
  },

  initProductItemEvents() {
    let productItemElements = document.querySelectorAll(".js-input-quantity");
    this.initAddToCartFormEvent();
  },

  initAddToCartFormEvent(element) {
    let form = document.querySelector(".js-bundledAddToCart");

    let submitButton = form.querySelector(".js-btn-add-to-cart");
    form.addEvent("submit", (e) => {
      e.preventDefault();

      let inputElements = form.querySelectorAll("input[name='quantity']");
      let items = [...inputElements].reduce((accu, input) => {
        if (+input.value > 0) {
          accu.push({ id: +input.dataset.variantId, quantity: +input.value });
        }
        return accu;
      }, []);

      if (items.length) {
        if(!submitButton.hasClass("has-pending")){
          submitButton.insertAdjacentHTML("beforeend", '<svg class="svg-loading" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; shape-rendering: auto;" width="28px" height="28px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><circle cx="50" cy="50" fill="none" stroke="var(--main-color)" stroke-width="5" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">  <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform></circle></svg>');
        }
        submitButton.addClass("pending", "has-pending");
        Cart.addMutiple(items)
          .then((data) => {
            // to do this
          })
          .finally(() => {
            submitButton.removeClass("pending");
            window.location.href = '/cart';
          });
      }
    });
  },

  initMultiVariantEvents(){
    let selectMaster = document.querySelectorAll(".select-master-bundle");
    let bundledCheckbox = document.querySelectorAll(".bundled-checkbox");
    let totalBundledPriceHtml = document.querySelector(".js-bundled-total-price");
    let totalBundledPrice = Number(document.querySelector(".bundled-total-price").getAttribute("data-bundled-total-price"));

    bundledCheckbox.forEach(function (button) {
      button.addEventListener("change", function () {
        let bundled_item = this.closest(".bundled-item");
        let bundled_item_qty_id = this.getAttribute('data-id');
        let bundled_item_price = Number(this.getAttribute('data-price'));
       
        if (this.checked) {
          totalBundledPrice = totalBundledPrice + bundled_item_price;
          bundled_item.querySelector('.js-input-quantity').value = '1';
          document.querySelector('#' + bundled_item_qty_id).removeClass('d-none');

          if(bundled_item.querySelector('.select-group-bundle').hasClass('select-multi-variants')){
            bundled_item.querySelector('.select-group-bundle').removeClass('d-none');
          }
        }
        else{
          totalBundledPrice = totalBundledPrice - bundled_item_price;
          bundled_item.querySelector('.js-input-quantity').value = '0';
          document.querySelector('#' + bundled_item_qty_id).addClass('d-none');

          if(bundled_item.querySelector('.select-group-bundle').hasClass('select-multi-variants')){
            bundled_item.querySelector('.select-group-bundle').addClass('d-none');
          }
        }

        totalBundledPriceHtml.innerHTML = totalBundledPrice.toCurrency();
        document.querySelector('.bundled-total-price').setAttribute('data-bundled-total-price', totalBundledPrice);
        totalBundledPrice = Number(document.querySelector(".bundled-total-price").getAttribute("data-bundled-total-price"));
      });
    });

    selectMaster.forEach(function (select) {
      select.addEventListener("change", function () {
        let selectid = this.getAttribute('id');
        let bundled_item = this.closest(".bundled-item");
        let select_option_price = Number(this.options[this.selectedIndex].getAttribute('data-option-price'));
        let select_option_data_price = Number(bundled_item.querySelector('.bundled-checkbox').setAttribute('data-price', select_option_price));

        bundled_item.querySelector('.js-input-quantity').setAttribute("id", this.value);
        bundled_item.querySelector('.js-input-quantity').setAttribute("data-variant-id", this.value);
        document.querySelector('.' + selectid).innerHTML = select_option_price.toCurrency();

        let totalBundledPriceSelect = 0;
        let bundledCheckbox = document.querySelectorAll(".bundled-checkbox");
        bundledCheckbox.forEach(function (button) {
          if (button.checked) {
            let bundled_item_price = Number(button.getAttribute('data-price'));
            totalBundledPriceSelect = totalBundledPriceSelect + bundled_item_price;
          }
        });

        totalBundledPriceHtml.innerHTML = totalBundledPriceSelect.toCurrency();
        document.querySelector('.bundled-total-price').setAttribute('data-bundled-total-price', totalBundledPriceSelect);
        totalBundledPrice = Number(document.querySelector(".bundled-total-price").getAttribute("data-bundled-total-price"));

      });
    });
  },

  initOrderDeadLine() {
    let _deadline_time = parseInt(document.querySelector('.shipping-time').getAttribute('data-deadline'));
    let _deadline_html = document.querySelector('.deadline');
    let _currentDate = new Date();

    let _dueDate = new Date( _currentDate.getFullYear(), _currentDate.getMonth(), _currentDate.getDate());
    _dueDate.setHours(_deadline_time);

    if(_currentDate >= _dueDate){
      _deadline_html.innerHTML = 'Order until <strong>' + _deadline_time + ':00 tomorrow</strong>';
    }
    else{
      _deadline_html.innerHTML = 'Order today until <strong>' + _deadline_time + ':00</strong>';
    }
  },

  initOrderShipping() {
    let today = new Date();
    let business_days = parseInt(document.querySelector('.shipping-time').getAttribute('data-deliverytime'));
    let deliveryDate = today; //will be incremented by the for loop
    let total_days = business_days; //will be used by the for loop

    for(let days=1; days <= total_days; days++) {
      deliveryDate = new Date(today.getTime() + (days *24*60*60*1000));
      // if(deliveryDate.getDay() == 0 || deliveryDate.getDay() == 6) {
      //   //it's a weekend day so we increase the total_days of 1
      //   total_days++
      // }
    }

    let weekday = new Array(7);
    weekday[0] =  "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thurday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    
    let _day = weekday[deliveryDate.getDay()];

    let month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March ";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";
    let _month = month[deliveryDate.getMonth()];

    document.querySelector('.dt-time').innerHTML = _day + ',' + '&nbsp;' + deliveryDate.getDate() + '&nbsp;' + _month;
  
  },

  initSliderMedia: function () {
    let { mediaMain, mediaThumnails } = this.elms;
    this.mainSlider = mediaMain.init({ gutter: 12 });

    mediaThumnails.init();
  },

  handleVariantChange: function (variant) {
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
    this.updateURLHash(variant);
    variant.available ? mediaMain.removeClass("product-sold-out") : mediaMain.addClass("product-sold-out");

    !!variant.sku ? (skuElement.innerHTML = variant.sku) : (skuElement.innerHTML = theme.strings.product.skuNA);

    if (!!variant.featured_media) {
      this.mainSlider.goTo(variant.featured_media.position - 1);
    }

    selectMaster.value = variant.id;
  },

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
  },

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
      addToCartButton.querySelector("span").innerHTML = theme.strings.product.unavailable;
      document.querySelector(".product-wishlist-compare").addClass("d-none");
      document.querySelector(".people-in-cart").addClass("d-none");
      document.querySelector(".shipping-time").addClass("d-none");

      this.inventory.setStatus("out-stock");
    }
  },

  updateDynamicCheckout(variantAvailable) {
    let { dynamicCheckoutContainer } = this.elms;
    if (dynamicCheckoutContainer) {
      variantAvailable ? dynamicCheckoutContainer.removeClass("d-none") : dynamicCheckoutContainer.addClass("d-none");
    }
  },

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
  },

  updateAddToCartButton(variant) {
    let { addToCartButton, quantityInputContainer } = this.elms;
    if (variant.available) { 
      addToCartButton.disabled = false;
      addToCartButton.querySelector("span").innerHTML =
        variant.inventory_quantity == 0 && variant.inventory_policy == 'continue'
          ? theme.strings.product.preorder
          : theme.strings.product.addToCart;
      this.settings.enableSubscribe && quantityInputContainer.removeClass("d-none");
      if(document.querySelector(".product-wishlist-compare")){
        document.querySelector(".product-wishlist-compare").removeClass("d-none");
      }
      if(document.querySelector(".people-in-cart")){
        document.querySelector(".people-in-cart").removeClass("d-none");
      } 
      if(document.querySelector(".shipping-time")){
        document.querySelector(".shipping-time").removeClass("d-none");
      }
      if(document.querySelector('.product-countdown-detail')){
        document.querySelector(".product-countdown-detail").removeClass("d-none");
      }
    } else {
      addToCartButton.disabled = true;
      addToCartButton.querySelector("span").innerHTML = theme.strings.product.soldOut;
      this.settings.enableSubscribe && quantityInputContainer.addClass("d-none");
      if(document.querySelector(".product-wishlist-compare")){
        document.querySelector(".product-wishlist-compare").addClass("d-none");
      }
      if(document.querySelector(".people-in-cart")){
        document.querySelector(".people-in-cart").addClass("d-none");
      }
      if(document.querySelector(".shipping-time")){
        document.querySelector(".shipping-time").addClass("d-none");
      }
      if(document.querySelector('.product-countdown-detail')){
        document.querySelector(".product-countdown-detail").addClass("d-none");
      }
    }
  },

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
  },

  initFormAddToCart() {
    let { formElement, addToCartButton } = this.elms;
    formElement.addEvent("submit", (e) => {
      e.preventDefault();

      if(!addToCartButton.hasClass("has-pending")){
        addToCartButton.insertAdjacentHTML("beforeend", '<svg class="svg-loading" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; shape-rendering: auto;" width="28px" height="28px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><circle cx="50" cy="50" fill="none" stroke="var(--main-color)" stroke-width="5" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">  <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform></circle></svg>');
      }

      addToCartButton.addClass("pending", "has-pending");
      Cart.add(formElement)
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
  },

  initScrollToReviews() {
    let reviewsWidget = document.querySelector("#product-reviews-widget");
    let reviewsBadge = document.querySelector("#product-review-badge");

    reviewsBadge.addEvent("click", () =>
      AT.scrollTo(
        reviewsWidget,
        1000,
        reviewsWidget.click()
      ),
    );
  },

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
  },

  updatePrice(variant) {
    let { priceCompareElement, priceElement } = this.elms;
    if (!!variant.compare_at_price) {
      priceCompareElement.innerHTML = variant.compare_at_price.toCurrency();
      priceCompareElement.removeClass("d-none");
    } else {
      priceCompareElement.addClass("d-none");
    }
    priceElement.innerHTML = variant.price.toCurrency();
  },

  updateURLHash(variant) {
    let searchParams = window.location.search.replace("?", "").split("&").filter(Boolean);

    window.history.replaceState(
      {},
      "",
      AT.getParameterByName("variant")
        ? `${window.location.pathname}?${searchParams
            .map((param) => (param.includes("variant") ? "variant=" + variant.id : param))
            .join("&")}`
        : (searchParams.unshift("variant=" + variant.id), `${window.location.pathname}?${searchParams.join("&")}`),
    );
  },

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
  },
};
