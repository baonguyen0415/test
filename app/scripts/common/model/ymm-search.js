export class YMMSearch {
  constructor(container) {
    if (!container) {
      return;
    }
    let dataUrls = container.dataset.url.split(",");

    this.elms = {
      container: container,
      field1: container.querySelector(".js-select[data-select-index='1']"),
      field2: container.querySelector(".js-select[data-select-index='2']"),
      field3: container.querySelector(".js-select[data-select-index='3']"),
      submitButton: container.querySelector(".js-submit-button"),
      resetButton: container.querySelector(".js-reset-button"),
      saveButton: container.querySelector(".js-save-button"),
      viewButton: container.querySelector(".js-view-button"),
      messageEml: container.querySelector(".js-ymm-search-message"),
    };

    this.getData(dataUrls).then((res) => {
      let { field1, field2, field3, resetButton } = this.elms;
      let data = res.flat(2);
      let ymmSearchSelected = JSON.parse(AT.cookie.get("arn-ymm-search"));
      this.initField(field1, data, "Year");
      this.initSubmitButton();
      this.initResetButton();
      this.initSaveButton();
      this.initViewButton();

      (() => {
        if (!ymmSearchSelected) {
          return;
        }
        setValue(field1, ymmSearchSelected.field1) &&
          setValue(field2, ymmSearchSelected.field2) &&
          setValue(field3, ymmSearchSelected.field3, true);

        function setValue(element, value, last) {
          let select = element.querySelector("select");
          select.value = value;

          if (!select.value) {
            AT.cookie.delete("arn-ymm-search");
            resetButton.click();
            return false;
          }

          !last && select.dispatchEvent(new Event("change"));
          return true;
        }
      })();
    });

    this.myVehicles = this.getMyVehicles();
  }

  getData(urls) {
    return Promise.all(
      urls.map((url) => {
        return fetch(url, { dataType: "json" });
      }),
    );
  }

  initField(element, data, name) {
    let newData = data.map((i) => i[name]);

    let selectElement = element.querySelector("select");

    newData.forEach(function (name) {
      let option = document.createElement("option");
      option.value = name;
      option.innerHTML = name;
      selectElement.append(option);
    });

    selectElement.addEvent("change", () => {
      element.removeClass("ys-error");
      this.fieldChange(element.dataset.selectIndex, selectElement.value, data);
    });
    element.addClass("ys-active");
  }

  fieldChange(index, value, data) {
    let { field2, field3, submitButton } = this.elms;

    switch (index) {
      case "1":
        this.resetField(field2);
        this.resetField(field3);
        this.initField(field2, data.find((i) => i.Year == value).field_2, "Make");
        break;

      case "2":
        this.resetField(field3);
        this.initField(field3, data.find((i) => i.Make == value).field_3, "Model");
        break;
      case "3":
        submitButton.click();
        break;
    }
  }

  resetField(element) {
    let selectElement = element.querySelector("select");
    selectElement.innerHTML = `<option value="">${selectElement.dataset.placeholder}</option>`;
    selectElement.insertAdjacentElement("beforebegin", selectElement.cloneNode(true));
    element.removeClass("ys-active", "ys-error");
    selectElement.remove();
  }

  getOptions() {
    let { field1, field2, field3 } = this.elms;
    let [value1, value2, value3] = [
      field1.querySelector("select").value,
      field2.querySelector("select").value,
      field3.querySelector("select").value,
    ];

    let values = [
      value1
        ? `filter.p.m.${field1.dataset.metafieldKey}.${field1.dataset.metafieldNamespace}=${value1.convertToSlug()}`
        : "",
      value2
        ? `filter.p.m.${field2.dataset.metafieldKey}.${field2.dataset.metafieldNamespace}=${value2.convertToSlug()}`
        : "",
      value3
        ? `filter.p.m.${field3.dataset.metafieldKey}.${field3.dataset.metafieldNamespace}=${value3.convertToSlug()}`
        : "",
    ];

    let fieldNotSelect = values.findIndex((i) => !i);
    return fieldNotSelect != -1
      ? fieldNotSelect
      : {
          field1: value1,
          field2: value2,
          field3: value3,
          label: [value1, value2, value3].join(" "),
          url: theme.routes.collectionAllUrl + "?" + values.join("&"),
        };
  }

  initSubmitButton() {
    let { submitButton, container } = this.elms;

    submitButton.addEvent("click", () => {
      let value = this.getOptions();

      if (typeof value != "object") {
        container.querySelector(`.js-select[data-select-index="${value + 1}"]`).addClass("ys-error");
        return;
      }
      AT.cookie.set("arn-ymm-search", JSON.stringify(value), 15);
      window.location.href = value.url;
    });
  }

  initResetButton() {
    let { resetButton, field1 } = this.elms;

    resetButton.addEvent("click", () => {
      let select = field1.querySelector("select");
      select.value = "";
      select.dispatchEvent(new Event("change"));
      document.dispatchEvent(new CustomEvent("ymm-search-reset"));
    });
  }

  initViewButton() {
    let { viewButton } = this.elms;

    !!viewButton && viewButton.addEvent("click", () => document.dispatchEvent(new CustomEvent("show-my-vehicles")));
  }

  initSaveButton() {
    let { saveButton, messageEml } = this.elms;

    saveButton.addEvent("click", () => {
      let value = this.getOptions();

      if (typeof value != "object") {
        messageEml.setAttribute("data-status", "select-options");
        return;
      }
      if (this.saveToMyVehicle(value)) {
        messageEml.setAttribute("data-status", "added");
        document.dispatchEvent(new CustomEvent("my-vehicles-add", { details: value }));
      } else {
        messageEml.setAttribute("data-status", "exist");
      }
    });
  }

  getMyVehicles() {
    return JSON.parse(localStorage.getItem("arn-my-vehicles") || "[]");
  }

  saveToMyVehicle(value) {
    console.log(this.myVehicles);
    return this.myVehicles.some((item) => JSON.stringify(item) === JSON.stringify(value))
      ? false
      : (this.myVehicles.push(value), localStorage.setItem("arn-my-vehicles", JSON.stringify(this.myVehicles)), true);
  }
}
