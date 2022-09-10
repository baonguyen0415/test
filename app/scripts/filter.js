class Filter {
  constructor(container) {
    let dataUrls = container.dataset.urls;
    this.elms = {
      container: container,
      field1: container.querySelector(".chosen-container[data-field-index='1']"),
      field2: container.querySelector(".chosen-container[data-field-index='2']"),
      field3: container.querySelector(".chosen-container[data-field-index='3']"),
      buttonSubmit: container.querySelector(".js-btn-submit"),
      buttonReset: container.querySelector(".js-btn-reset"),
    };
    this.getData(dataUrls).then((data) => {
      data = data.flat(2);
      let lastSelect = AT.cookie.get("arn-filter");
      if (!!lastSelect) {
        let { collection, tag1, tag2 } = lastSelect;

        let temporaryVariable = data.find((item) => item.name.toLowerCase() == collection.toLowerCase());
        if (!temporaryVariable) {
          AT.cookie.delete("arn-filter");
          this.initField(this.elms.field1, data);
          return;
        }
        let data2 = temporaryVariable["field_2"];

        temporaryVariable = data2.find((item) => item.name.toLowerCase() == tag1.toLowerCase());
        if (!temporaryVariable) {
          AT.cookie.delete("arn-filter");
          this.initField(this.elms.field1, data);
          return;
        }
        let data3 = temporaryVariable["field_3"];
        if (!!data2 && !!data3 && data3.some((a) => a == tag2)) {
          this.setField(this.elms.field1, collection, data);
          this.setField(this.elms.field2, tag1, data2);
          this.setField(this.elms.field3, tag2, data3, true);
        } else {
          this.initField(this.elms.field1, data);
          AT.cookie.delete("arn-filter");
        }
      } else {
        this.initField(this.elms.field1, data);
      }
      this.initEventFieldTitle();
      this.initEventButtonReset();
      this.initEventButtonSubmit();
    });
  }

  initField(element, data, lastField) {
    let newData = lastField ? data : data.map((item) => item.name);
    let index = element.dataset.fieldIndex;
    let titleElement = element.querySelector(".js-title");

    let chosenResults = element.querySelector(".chosen-results");
    let chosenDrop = element.querySelector(".chosen-drop");
    chosenResults.innerHTML = newData
      .map((item) => `<li class="active-result" data-value="${item}">${item}</li>`)
      .join("");

    chosenResults.children.addEvents("click", (e) => {
      e.stopPropagation();
      let { target } = e;
      let value = target.dataset.value;
      titleElement.innerHTML = value;
      element.setAttribute("data-value", value);
      chosenDrop.removeClass("active");
      this.change(index, data, value);
    });
  }

  setField(element, value, data, lastField) {
    this.initField(element, data, lastField);
    element.setAttribute("data-value", value);
    element.querySelector(".js-title").innerHTML = value;
    element.addClass("active");
  }

  change(index, data, value) {
    let { field2, field3, buttonSubmit } = this.elms;
    switch (index) {
      case "1": {
        let newData = data.find((item) => item.name === value)["field_2"];

        this.resetField(field2);
        this.resetField(field3);

        this.initField(field2, newData);
        field2.addClass("active");
        field2.querySelector(".chosen-drop").addClass("active");
        break;
      }
      case "2": {
        let newData = data.find((item) => item.name === value)["field_3"];

        this.resetField(field3);

        this.initField(field3, newData, true);
        field3.addClass("active");
        field3.querySelector(".chosen-single").click();
        break;
      }
      case "3":
        buttonSubmit.click();
        break;
    }
  }

  resetField(element) {
    let title = element.querySelector(".js-title");
    element.removeClass("active");
    title.innerHTML = title.dataset.placeholder;
    element.setAttribute("data-value", "");
    element.querySelector(".chosen-results").innerHTMl = "";
  }

  initEventFieldTitle() {
    let { container } = this.elms;

    container.querySelectorAll(".chosen-container").forEach((fieldContainer) => {
      let filterTitle = fieldContainer.querySelector(".chosen-single");
      let inputSearch = fieldContainer.querySelector("input[name='search']");
      let fieldResults = fieldContainer.querySelector(".chosen-results");

      let target = filterTitle.nextElementSibling;
      filterTitle.addEvent("click", () => {
        if (target.hasClass("active")) {
          target.removeClass("active");
        } else {
          target.addClass("active");
        }
      });

      document.addEvent("click", (e) => {
        if (!filterTitle.parentElement.contains(e.target)) {
          target.removeClass("active");
        }
      });

      inputSearch.addEvent("input", () => {
        let value = inputSearch.value.toLowerCase();
        fieldResults.children.forEach((item) => {
          if (item.innerHTML.toLowerCase().includes(value)) {
            item.style.display = "block";
          } else {
            item.style.display = "none";
          }
        });
      });
    });
  }

  getData(urls) {
    return Promise.all(urls.split(",").map((url) => fetch(url, { dataType: "json" })));
  }

  initEventButtonReset() {
    let { field1, field2, field3, buttonReset } = this.elms;

    buttonReset.addEvent("click", () => {
      this.resetField(field1);
      field1.addClass("active");
      this.resetField(field2);
      this.resetField(field3);
    });
  }

  initEventButtonSubmit() {
    let { buttonSubmit, field1, field2, field3 } = this.elms;

    buttonSubmit.addEvent("click", () => {
      let [collection, tag1, tag2] = [field1.dataset.value, field2.dataset.value, field3.dataset.value];
      let url = `${
        theme.routes.collectionsUrl
      }/${collection.convertToSlug()}/${tag1.convertToSlug()}+${tag2.convertToSlug()}`;
      AT.cookie.set("arn-filter", { collection, tag1, tag2 }, 7);
      window.location.href = url;
    });
  }
}

window.Filter = Filter;
console.log("filter.js loaded");
