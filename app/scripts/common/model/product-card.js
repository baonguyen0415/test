export class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.elms = {
      form: this.querySelector("form"),
      atcButton: this.querySelector(".js-atc-btn"),
      quickViewButton: this.querySelector(".js-product-card-quick-view"),
    };
    this.initATC();
    this.initQuickView();
  }
  initATC() {
    let { form, atcButton } = this.elms;
    if (typeof form != "undefined") {
      form.addEvent("submit", (e) => {
        e.preventDefault();
        if(!atcButton.hasClass("has-pending")){
          atcButton.insertAdjacentHTML("beforeend", '<svg class="svg-loading" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; shape-rendering: auto;" width="28px" height="28px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><circle cx="50" cy="50" fill="none" stroke="var(--main-color)" stroke-width="5" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">  <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform></circle></svg>');
        }
        atcButton.addClass("pending", "has-pending");
        
        Cart.add(form).finally(() => {
          atcButton.removeClass("pending");
        });
      }); 
    }
  } 

  initQuickView() {
    let { quickViewButton } = this.elms;

    quickViewButton &&
      quickViewButton.addEvent("click", function () {
        let { productHandle } = this.dataset;

        this.addClass("pending");

        let arrPromise = [];

        arrPromise.push(AT.loadPopupQuickView());

        arrPromise.push(
          AT.productsViewedQuickly[productHandle]
            ? AT.productsViewedQuickly[productHandle]
            : fetch(`/products/${productHandle}?view=ajax-quick-view`, { dataType: "text" }),
        );

        Promise.all(arrPromise)
          .then((res) => {
            if (res[0]) {
              PopupQuickView.open(res[1]);
              AT.productsViewedQuickly[productHandle] = res[1];
            } else {
              console.log("An error occurred while loading quick view");
            }
          })
          .finally(() => this.removeClass("pending"));
      });
  }
}
