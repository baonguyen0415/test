export let linkOptions = (container, product, cb) => {
  let optionsMap = {};
  if (!container) {
    return;
  }
  console.log(product);
  let statusWhenVariantSoldOut = container.dataset.statusSoldOut;
  let optionElements = container.getElementsByClassName("js-option-item");
  if (product.variants.length < 2) {
    return;
  }
  optionElements.addEvents("change", function () {
    container.dispatchEvent(
      new CustomEvent("swatch-change", { detail: { position: +this.dataset.optionPosition, optionValue: this.value } }),
    );
  });
  container.addEvent("swatch-change", function ({ detail: { position, optionValue } }) {
    container.querySelector(`[data-selected-option='option${position}']`).innerHTML = optionValue;
    switch (position) {
      case 1:
        if (product.options.length > 1) {
          updateOptionsInSelector(2);
        } else {
          cb(findVariantFromOption(getValueOptions()));
        }
        break;
      case 2:
        if (product.options.length === 3) {
          updateOptionsInSelector(3);
        } else {
          cb(findVariantFromOption(getValueOptions()));
        }
        break;
      case 3:
        cb(findVariantFromOption(getValueOptions()));
        break;
    }
  });
  product.variants.forEach((variant) => {
    if (variant.available) {
      optionsMap["root"] = optionsMap["root"] || [];
      optionsMap["root"].push(variant.option1);
      optionsMap["root"] = optionsMap["root"].reduce((accu, currentvalue) => {
        if (!accu.includes(currentvalue)) {
          accu.push(currentvalue);
        }
        return accu;
      }, []);
      if (product.options.length > 1) {
        var key = variant.option1;
        optionsMap[key] = optionsMap[key] || [];
        optionsMap[key].push(variant.option2);
        optionsMap[key] = optionsMap[key].reduce((accu, currentvalue) => {
          if (!accu.includes(currentvalue)) {
            accu.push(currentvalue);
          }
          return accu;
        }, []);
      }
      if (product.options.length === 3) {
        var key = variant.option1 + " / " + variant.option2;
        optionsMap[key] = optionsMap[key] || [];
        optionsMap[key].push(variant.option3);
        optionsMap[key] = optionsMap[key].reduce((accu, currentvalue) => {
          if (!accu.includes(currentvalue)) {
            accu.push(currentvalue);
          }
          return accu;
        }, []);
      }
    }
  });
  updateOptionsInSelector(1);
  function updateOptionsInSelector(position) {
    let optionValues = getValueOptions();
    let key, selector;
    switch (position) {
      case 1:
        key = "root";
        selector = container.querySelector(".js-swatch-item[data-position='1']");
        break;
      case 2:
        key = optionValues.option1;
        selector = container.querySelector(".js-swatch-item[data-position='2']");
        break;
      case 3:
        key = optionValues.option1 + " / " + optionValues.option2;
        selector = container.querySelector(".js-swatch-item[data-position='3']");
        break;
    }
    switch (selector.dataset.style) {
      case "select": {
        let selectElement = selector.getElementsByClassName("js-option-item")[0];
        let oldValue = selectElement.value;
        switch (statusWhenVariantSoldOut) {
          case "hide": {
            selectElement.innerHTML = optionsMap[key]
              .map((optionValue) => `<option value="${optionValue}">${optionValue}</option>`)
              .join("");
            if (optionsMap[key].includes(oldValue)) {
              selectElement.value = oldValue;
            }
            break;
          }
          case "disable": {
            [...selectElement.options].forEach((option) => {
              if (optionsMap[key].includes(option.value)) {
                option.disabled = false;
              } else {
                option.disabled = true;
                option.selected = false;
              }
            });
            [...selectElement.options].find((option) => option.disabled == false && (option.selected = true));
            break;
          }
        }
        break;
      }
      case "color":
      case "image":
      case "button":
        let inputsElement = selector.getElementsByClassName("js-option-item");
        let oldValue = [...inputsElement].find((input) => input.checked).value;
        switch (statusWhenVariantSoldOut) {
          case "hide":
            inputsElement.forEach((input) => {
              if (optionsMap[key].includes(input.value)) {
                input.closest(".swatch-group_wrapper").removeClass("d-none");
              } else {
                input.closest(".swatch-group_wrapper").addClass("d-none");
                oldValue === input.value && ((input.checked = false), (inputsElement[0].checked = true));
              }
            });
            break;
          case "disable": {
            inputsElement.forEach((input) => {
              if (optionsMap[key].includes(input.value)) {
                input.disabled = false;
              } else {
                input.disabled = true;
                oldValue === input.value && ((input.checked = false), (inputsElement[0].checked = true));
              }
            });
            break;
          }
        }
        break;
    }

    container.dispatchEvent(
      new CustomEvent("swatch-change", { detail: { position, optionValue: optionValues[`option${position}`] } }),
    );
  }
  function getValueOptions() {
    return [...container.getElementsByClassName("js-swatch-item")].reduce((accu, element) => {
      switch (element.dataset.style) {
        case "select":
          let select = element.querySelector("select.single-option-selector");
          accu[select.name] = select.value;
          break;
        case "color":
        case "image":
        case "button":
          let inputsElements = element.querySelectorAll("input[data-single-option-selector]");
          accu[inputsElements[0].name] = [...inputsElements].find((input) => input.checked).value;
          break;
      }
      return accu;
    }, {});
  }
  function findVariantFromOption(options) {
    return product.variants.find((variant) => {
      return Object.keys(options).every((optionKey) => variant[optionKey] === options[optionKey]);
    });
  }
};
