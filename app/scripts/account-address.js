import { PopupAddress } from "./common/model/popup-address";

(() => {
  register("account-address", {
    onLoad() {
      this.elms = {
        popupAddress: this.container.querySelector("#popup-address"),
        addButton: this.container.querySelector(".js-btn-add-new"),
        editButtons: this.container.querySelectorAll(".js-btn-edit"),
      };
      customElements.define("popup-address", PopupAddress);
      this.initEvent();
    },
    initEvent() {
      let { addButton, editButtons, popupAddress } = this.elms;

      addButton.addEvent("click", () => {
        popupAddress.open("add");
      });

      editButtons.addEvents("click", function () {
        let data = JSON.parse(this.dataset.json);
        console.log(data);
        popupAddress.open("edit", data);
      });
    },
  });
  load("account-address");
})();
