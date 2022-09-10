export class PopupComponent extends HTMLElement {
  constructor() {
    super();
    this.getElementsByClassName("js-popup-close").addEvents("click", this.close.bind(this));
  }

  close() {
    this.removeClass("is-open");
    AT.enableScroll();
  }

  open() {
    this.addClass("is-open");
    AT.disableScroll();
  }
}
