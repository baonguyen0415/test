import { PopupComponent } from ".";

export class PopupMessage extends PopupComponent {
  constructor() {
    super();
  }

  open(message) {
    this.addClass("is-open");
    this.querySelector(".js-message").innerHTML = message;
    AT.disableScroll();
  }
}
