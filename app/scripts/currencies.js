import formats from "./common/formats";
class Currencies {
  constructor(value) {
    Object.assign(this, {
      ...value,
      formats,
      observeRegistered: [],
      originCurrency: theme.currency.current,
      currentCurrency: theme.currency.current,
      pattern: theme.currency.pattern,
    });
    document.getElementsByClassName("js-money").forEach(this.registerObserve.bind(this));
  }

  registerObserve(element) {
    let cents = 0.0;

    if (this.formats[this.originCurrency][this.pattern].includes("amount_no_decimals")) {
      cents = parseInt(element.innerHTML.replace(/[^0-9]/g, ""), 10) * 100;
    } else if (this.originCurrency === "JOD" || this.originCurrency == "KWD" || this.originCurrency == "BHD") {
      cents = parseInt(element.innerHTML.replace(/[^0-9]/g, ""), 10) / 10;
    } else {
      cents = parseInt(element.innerHTML.replace(/[^0-9]/g, ""), 10);
    }
    element.setAttribute("data-money", cents);
    element.setAttribute("data-currency", this.currentCurrency);

    let observe = new MutationObserver((records) => {
      records.forEach((record) => {
        let { attributeName, target } = record;
        let { money, currency } = target.dataset;
        let format = this.formats[currency][this.pattern] || "{{amount}}";

        switch (attributeName) {
          case "data-money": {
            target.innerHTML = this.convert(money, this.originCurrency, currency).toCurrency(format);

            [...target.attributes].forEach(({ name }) => {
              if (name.includes("data-currency-")) {
                let isoCode = name.replace("data-currency-", "").toUpperCase();
                let formatOfAttribute = this.formats[isoCode][this.pattern] || "{{amount}}";
                target.setAttribute(
                  name,
                  this.convert(money, this.originCurrency, isoCode).toCurrency(formatOfAttribute),
                );
              }
            });
            break;
          }

          case "data-currency": {
            let currencyAvailable = target.getAttribute(`data-currency-${currency}`);
            let moneyConverted = this.convert(money, this.originCurrency, currency).toCurrency(format);
            if (currencyAvailable) {
              target.innerHTML =
                currencyAvailable === moneyConverted
                  ? currencyAvailable
                  : (target.setAttribute(`data-currency-${currency}`, moneyConverted), moneyConverted);
            } else {
              target.setAttribute(`data-currency-${currency}`, moneyConverted);

              target.innerHTML = moneyConverted;
            }

            break;
          }
        }
      });
    });

    observe.observe(element, { attributeFilter: ["data-currency", "data-money"], attributeOldValue: true });

    element.setAttribute(`data-currency-${this.originCurrency}`, cents.toCurrency());

    if (this.originCurrency != this.currentCurrency) {
      element.setAttribute("data-currency", this.currentCurrency);
    }
    this.observeRegistered.push(element);
  }

  switchCurrency(currencyCode) {
    this.currentCurrency = currencyCode;

    this.observeRegistered.forEach((item) => {
      !!item && item.setAttribute("data-currency", currencyCode);
    });
    this.observeRegistered = this.observeRegistered.filter(Boolean);
    if (this.originCurrency === currencyCode) {
      AT.cookie.delete("arn-currency");
    } else {
      AT.cookie.set("arn-currency", currencyCode, 7);
    }
  }

  convertToCurrentCurrency(cents) {
    let format = this.formats[this.currentCurrency][this.pattern] || "{{amount}}";
    return this.convert(cents, this.originCurrency, this.currentCurrency).toCurrency(format);
  }
}
window.Currencies = new Currencies(Currency);
