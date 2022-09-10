export class QuantityInput extends HTMLElement {
  constructor() {
    super();
    let minusButton = this.querySelector("quantity-input-minus");
    let plusButton = this.querySelector("quantity-input-plus");
    let input = this.querySelector("input[name='quantity']");
    let min = +input.min;
    minusButton.addEvent("click", () => {
      let { value } = input;
      --value;
      value > 1 ? (input.value = value) : (input.value = 1);
      input.dispatchEvent(new Event("input"));
    });
    plusButton.addEvent("click", () => {
      let { value } = input;
      input.value = ++value;
      input.dispatchEvent(new Event("input"));
    });
    input.addEvent(
      "input",
      AT.debounce(() => {
        if (typeof this.callback === "function" && input.value >= min) {
          this.callback(input.value);
        }
      }, 500),
    );
  }
  onChange(cb) {
    this.callback = cb;
  }
}
