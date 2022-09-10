export class InfiniteButton extends HTMLElement {
  constructor() {
    super();
    this.isLoading = false;
    this.initEventHandler();
  }
  initEventHandler() {
    const handler = (cb) => {
      let self = this;
      return function(e) {
        let rect = self.getBoundingClientRect();
        let settings = self.getInfo();
        if (!self.isLoading && settings.nextPage && window.pageYOffset + 1e3 >= rect.y) {
          cb();
        }
      };
    };
    Object.assign(this, {
      unobserver: () => {
        window.removeEvent("scroll", this.scrollHandler);
        this.removeEvent("click", this.scrollHandler);
      },
      observer(cb) {
        this.scrollHandler = handler(cb);
        this.unobserver();
        window.addEvent("scroll", this.scrollHandler);
        this.addEvent("click", this.scrollHandler);
      }
    });
  }
  reset() {
    this.setAttribute("data-current-page", 1);
    this.setAttribute("data-next-page", 1);
  }
  setStatus(status) {
    switch (status) {
      case "hide":
        this.addClass("d-none");
        break;
      case "show":
        this.removeClass("d-none");
        break;
      case "loading":
        this.setAttribute("loading", "");
        this.isLoading = true;
        break;
      case "loaded":
        this.removeAttribute("loading");
        this.isLoading = false;
        break;
      case "reset":
        this.setAttribute("data-current-page", 1);
        this.setAttribute("data-next-page", 1);
        break;
    }
  }
  setInfo({ currentPage, nextPage }) {
    this.setAttribute("data-current-page", currentPage);
    this.setAttribute("data-next-page", nextPage);
  }
  getInfo() {
    return {
      currentPage: +this.getAttribute("data-current-page"),
      nextPage: +this.getAttribute("data-next-page")
    };
  }
};