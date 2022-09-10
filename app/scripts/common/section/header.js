export let Header = {
  onLoad() {
    let { container } = this;
    this.config = {
      sticky: container.dataset.sticky === "true",
    };  

    this.elms = {
      mobileDrawerInput: this.container.querySelector("#mobile-drawer-input"),
      dropdownCartTemplate: this.container.querySelector("#dropdown-cart-template"),
      headerCartIconDesktop: this.container.getElementsByClassName("js-header-cart-icon--desktop"),
      headerCartIconMobile: this.container.querySelector(".js-header-cart-icon--mobile")
    };

    if (container.dataset.sticky === "true") {
      this.initSticky();
    }

    this.inittoggleMenu();
    this.initVerticalDropdown();
    this.initDrawer();
    this.initCartIcons();
    this.initDropdownCart();
    this.initChangeImage();
    this.initCountdown();
  }, 

  initVerticalDropdown() {
    let verticalDropdown = document.querySelector('.vertical-menu-head');
    if (!verticalDropdown) {
      return;
    }

    verticalDropdown.addEvent("click", (e) => {
      if(verticalDropdown.hasClass('open')){
        verticalDropdown.removeClass('open');
        document.querySelector('.header-vertical-menu').removeClass('open');
      }
      else{
        verticalDropdown.addClass('open');
        document.querySelector('.header-vertical-menu').addClass('open');
      }
    });
  },

  inittoggleMenu() {
    let toggleMenu = document.querySelector('.off-canvas-navigation-wrapper');
    let toggleMenuClose = document.querySelector('#main-content');
    if (!toggleMenu) {
      return;
    }

    toggleMenu.addEvent("click", (e) => {
      toggleMenu.addClass('toggled');
      document.querySelector('body').addClass('off-canvas-active');
    });

    toggleMenuClose.addEvent("click", (e) => {
      toggleMenu.removeClass('toggled');
      document.querySelector('body').removeClass('off-canvas-active');
    });
  },

  initDropdownCart() {
    let { headerCartIconDesktop, headerCartIconMobile, dropdownCartTemplate } = this.elms;
    if (!dropdownCartTemplate) {
      return;
    }

    this.dropdownCart = {
      inserted: false,
      container: dropdownCartTemplate.content.firstElementChild,
    };

    Object.assign(this.dropdownCart, {
      elms: {
        lineItemListContainer: this.dropdownCart.container.querySelector(".js-cart-line-item-list"),
        cartTotal: this.dropdownCart.container.querySelector(".js-cart-total"),
      },
      setItemCount(count) {
        this.container.setAttribute("data-cart-item-count", count);
      },
      highlightNewAddedItem(data) {
        let { lineItemListContainer } = this.elms;
        let newAddedLineItem = [...lineItemListContainer.children].find((item) => item.dataset.key == data.key);

        if (newAddedLineItem) {
          newAddedLineItem.addClass("line-item--highlight");
          lineItemListContainer.scrollTo(0, newAddedLineItem.offsetTop);
          AT.debounce(() => newAddedLineItem.removeClass("line-item--highlight"), 1000)();
        }
      },
    });

    this.dropdownCart.container.querySelector(".js-btn-close").addEvent("click", () => {
      this.dropdownCart.container.closest(".header-cart").removeClass("active");
      document.querySelector('body').removeClass("cart-active");
    });

    if(document.querySelector('body').hasClass('cart-type-drawer')){
      this.dropdownCart.container.querySelector(".btn-close-cart").addEvent("click", (e) => {
        this.dropdownCart.container.closest(".header-cart").removeClass("active");
        document.querySelector('body').removeClass("cart-active");
      });
    }

    this.dropdownCart.container
      .querySelectorAll(".js-cart-line-item")
      .forEach(this.initDropdownCartLineItem.bind(this));

    window.addEvent("resize", async () => {
      if (this.dropdownCart.inserted) {
        if (window.innerWidth >= 992) {
          insertDropdownCart.call(this, headerCartIconDesktop[0]);
        } else {
          //insertDropdownCart.call(this, headerCartIconMobile);
        }
      }
    });

    if (headerCartIconDesktop.length) {
      initheaderCartIconDesktop.call(this);
    } else {
      document.addEvent("desktop-lazyloaded", () => initheaderCartIconDesktop.bind(this), { once: true });
    }

    // headerCartIconMobile.addEvent("click", (e) => {
    //   e.preventDefault();
    //   e.stopPropagation();
    //   if (!this.dropdownCart.inserted) {
    //     insertDropdownCart.call(this, headerCartIconMobile);
    //   }
    //   this.dropdownCart.container.closest(".header-cart").addClass("active");
    // });

    document.addEvent("click", (e) => {
      if (!this.dropdownCart.container.contains(e.target) && this.dropdownCart.inserted) {
        this.dropdownCart.container.closest(".header-cart").removeClass("active");
        document.querySelector('body').removeClass("cart-active");
      }
    });

    document.addEvent("cart-add", ({ detail }) => {
      if (!this.dropdownCart.inserted) {
        insertDropdownCart.call(this, window.innerWidth >= 992 ? headerCartIconDesktop[0] : headerCartIconMobile);
      }
      this.updateDropdownCart("add", detail);

      if(window.innerWidth < 992){
        document.querySelector('#cart-message').addClass('is-open');
      }
      else{
        if(document.querySelector('.js-header-cart-icon--desktop').hasClass('effect-popup')){
          document.querySelector('#cart-message').addClass('is-open');
        }
        else{
          document.querySelector('.js-header-cart-icon--desktop').click();
        }
      }
      // this.dropdownCart.container.closest(".header-cart").addClass("active");
      // document.querySelector('body').addClass("cart-active");
      // this.dropdownCart.highlightNewAddedItem(detail);

    });

    document.querySelector('.popup-cart-close').addEvent("click", (e) => {
      document.querySelector('#cart-message').removeClass('is-open');
    });

    document.querySelector('.js-cart-popup-close').addEvent("click", (e) => {
      document.querySelector('#cart-message').removeClass('is-open');
    });

    function insertDropdownCart(cartItemElement) {
      if (!this.dropdownCart.inserted) {
        this.dropdownCart.inserted = true;
      }
      cartItemElement.insertAdjacentElement("afterend", this.dropdownCart.container);
    }

    function initheaderCartIconDesktop() {
      headerCartIconDesktop[0].addEvent("click", (e) => {
        if(document.querySelector('body').hasClass('cart-type-page')){
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        if (!this.dropdownCart.inserted) {
          insertDropdownCart.call(this, headerCartIconDesktop[0]);
        }
        this.dropdownCart.container.closest(".header-cart").addClass("active");
        document.querySelector('body').addClass("cart-active");
      });
    }
  },

  updateDropdownCart(action, data) {
    let { lineItemListContainer, cartTotal } = this.dropdownCart.elms;
    switch (action) {
      case "remove": {
        this.dropdownCart.container.setAttribute("data-cart-item-count", data.item_count);
        this.dropdownCart.container.setAttribute("data-cart-item-count", data.item_count);
        cartTotal.innerHTML = data.total_price.toCurrency();
        break;
      }
      case "add": {
        let { sections, ...lineItem } = data;
        let div = document.createElement("div");
        div.innerHTML = sections["ajax-cart"];
        let cartJSON = JSON.parse(div.querySelector("[data-cart-json]").innerHTML);
        let newlineItem = [...div.querySelectorAll(".js-cart-line-item")].find(
          (item) => item.dataset.key == lineItem.key,
        );
        if (
          ![...lineItemListContainer.children].find((item) => {
            if (item.dataset.key == lineItem.key) {
              item.querySelector(".js-line-item-qty").innerHTML = lineItem.quantity;
              item.querySelector(".js-line-item-price").innerHTML = lineItem.final_line_price.toCurrency();
              return true;
            }
          })
        ) {
          this.initDropdownCartLineItem(newlineItem);
          lineItemListContainer.prepend(newlineItem);
        }
        cartTotal.innerHTML = cartJSON.total_price.toCurrency();
        this.dropdownCart.setItemCount(cartJSON.item_count);
        break;
      }
    }
  },

  initDropdownCartLineItem(lineItemElement) {
    let removeButton = lineItemElement.querySelector(".js-btn-remove");
    let { key } = lineItemElement.dataset;
    removeButton.addEvent("click", (e) => {
      e.preventDefault();
      removeButton.innerHTML = theme.strings.header.dropdownCart.removing;
      Cart.remove(key).then((res) => {
        lineItemElement.remove();
        this.updateDropdownCart("remove", res);
      });
    });
  },

  initSticky() {
    let { container } = this;
    let offsetHeight = container.offsetHeight;
    let height = container.offsetHeight;
    document.documentElement.style.setProperty("--header-height", height + "px");
    if (window.pageYOffset > offsetHeight) {
      container.addClass("header-sticky");
      container.css("height", height + "px");
    }
    window.addEvent("scroll", () => {
      if (window.pageYOffset > offsetHeight) {
        container.addClass("header-sticky");
        container.css("height", height + "px");
      } else if (window.pageYOffset <= container.offsetTop) {
        container.removeClass("header-sticky");
        container.css("height", "");
      }
    });
    window.addEvent("resize", () => {
      height = container.offsetHeight;
      offsetHeight = container.offsetHeight;
      document.documentElement.style.setProperty("--header-height", height + "px");
      document.dispatchEvent(new CustomEvent("header-height-change", { detail: height + "px" }));
    });
  },

  initDrawer() {
    let { mobileDrawerInput } = this.elms;
    let mobileDrawerTemplate = this.container.querySelector("#header-mobile-drawer-wrapper");
    let div = document.createElement("div");
    div.innerHTML = mobileDrawerTemplate.innerHTML;

    mobileDrawerInput.addEvent(
      "input",
      () => {
        mobileDrawerTemplate.insertAdjacentElement("beforebegin", div.firstElementChild);
        mobileDrawerTemplate.remove();
      },
      { once: true },
    );

    mobileDrawerInput.addEvent("input", function () {
      this.checked ? AT.disableScroll() : AT.enableScroll();

      if(this.checked){
        document.querySelector("body").addClass("mobile-menu-active");
      }
      else{
        document.querySelector("body").removeClass("mobile-menu-active");
      }

      let menuCheckboxMobile = document.querySelectorAll('.menu-checkbox-mobile');
      menuCheckboxMobile.forEach(function (item) {
        item.addEventListener("change", function () {
          if(this.checked){
            this.closest(".menu-mobile-item").addClass("active");
            document.querySelector(".menu-mobile-list").addClass("sub-open");
          }
          else{
            this.closest(".menu-mobile-item").removeClass("active");
            document.querySelector(".menu-mobile-list").removeClass("sub-open")
          }
        });
      });

      let menuCheckboxMobile2 = document.querySelectorAll('.menu-checkbox-mobile-2');
      menuCheckboxMobile2.forEach(function (item2) {
        item2.addEventListener("change", function () {
          if(this.checked){
            this.closest(".menu-mobile-item-2").addClass("active");
            this.closest(".menu-mobile-list--lv1").addClass("sub-open");
          }
          else{
            this.closest(".menu-mobile-item-2").removeClass("active");
            this.closest(".menu-mobile-list--lv1").removeClass("sub-open");
          }
        });
      });
    }); 

    let _template_id = document.querySelectorAll(".mega-menu-item");
    _template_id.forEach(function (temp) {
      temp.addEventListener("mouseover", function () {
        let __this = this.querySelector('.temp-id');
        if(__this){
          let div = document.createElement("div");
          div.innerHTML = __this.innerHTML;
          __this.insertAdjacentElement("afterend", div.firstElementChild);
          __this.remove();
        }

        let _menu_item = document.querySelectorAll(".menu-item");
        _menu_item.forEach(function (menuItem) {
          menuItem.addEventListener("mouseover", function () {
            this.addClass("open");
          });

          menuItem.addEventListener("mouseleave", function () {
            this.removeClass("open");
          });
        });
      });
    });
  },

  initCartIcons() {
    let cartItemCount = this.container.getElementsByClassName("js-cart-item-count");
    let cartItemTotal = this.container.getElementsByClassName("js-cart-item-total");

    document.addEvent("cart-change", ({ detail }) => {
      [...cartItemCount].forEach((item) => (item.innerHTML = detail.item_count));
      [...cartItemTotal].forEach((item) => (item.innerHTML = detail.total_price.toCurrency()));
    });

    window.addEvent("resize", () => {
      [...cartItemCount].forEach((item) => (item.innerHTML = Cart.item_count));
      [...cartItemTotal].forEach((item) => (item.innerHTML = Cart.total_price.toCurrency()));
    });
  },

  initChangeImage() {
    let specialItemThumbImage = document.querySelectorAll('.img-swt-temp');
    if (!specialItemThumbImage) {
      return;
    }

    specialItemThumbImage.forEach(function (thumb) {
      thumb.addEvent("click", function () {
        let imgsrcset = thumb.querySelector('img').getAttribute("srcset");
        let imgdatasrcset = thumb.querySelector('img').getAttribute("data-srcset");
        let parent = thumb.closest('.product-card');
        let imgElem = parent.querySelector('.wrap-image img');
    
        imgElem.setAttribute('data-srcset',imgdatasrcset);
        imgElem.setAttribute('srcset',imgsrcset);

      });
    });
  },

  initCountdown() {
    let productCountdown = document.querySelectorAll('.product-countdown');
    if (!productCountdown) {
      return;
    }

    productCountdown.forEach(function (countdown) {
      // Set the date we're counting down to
      let _dueDate_year = countdown.getAttribute("data-duedate-year");
      let _dueDate_month = countdown.getAttribute("data-duedate-month");
      let _dueDate_day = countdown.getAttribute("data-duedate-day");
      let _countDownDate = new Date( _dueDate_year, _dueDate_month - 1, _dueDate_day ).getTime();

      // Update the count down every 1 second
      let _x = setInterval(function() {

        // Get today's date and time
        let now = new Date().getTime();

        // Find the distance between now and the count down date
        let distance = _countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)+(days*24));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        countdown.querySelector(".countdown-html").innerHTML = "<span class='countdown-section'><span class='countdown-value'>" + hours + "</span><span class='countdown-text'>hours</span></span> " + "<span class='countdown-section'><span class='countdown-value'>" + minutes + "</span><span class='countdown-text'>minutes</span></span> " + "<span class='countdown-section'><span class='countdown-value'>" + seconds + "</span><span class='countdown-text'>seconds</span></span>"


        if (distance < 0) {
          clearInterval(_x);
          countdown.closest(".product-countdown").addClass("d-none");
        }
      }, 1000);

    });
  }
};
