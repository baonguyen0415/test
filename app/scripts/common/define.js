//NodeList
Object.assign(NodeList.prototype, {
  removeClass: function () {
    for (const item of this) {
      item.classList.remove(...arguments);
    }
  },
  addClass: function () {
    for (const item of this) {
      item.classList.add(...arguments);
    }
  },
  addEvents: function (...args) {
    for (const item of this) {
      item.addEvent(...args);
    }
  },
  removeEvents: function (...args) {
    for (const item of this) {
      item.removeEvent(...args);
    }
  },
});

// HTMLCollection
Object.assign(HTMLCollection.prototype, {
  removeClass: function () {
    for (const item of this) {
      item.classList.remove(...arguments);
    }
  },
  addClass: function () {
    for (const item of this) {
      item.classList.add(...arguments);
    }
  },
  addEvents: function (...args) {
    for (const item of this) {
      item.addEventListener(...args);
    }
  },
  removeEvents: function (...args) {
    for (const item of this) {
      item.removeEventListener(...args);
    }
  },
  forEach: Array.prototype.forEach,
});

// HTMLElement
Object.assign(HTMLElement.prototype, {
  removeClass: function (...args) {
    this.classList.remove(...args);
    return this;
  },
  addClass: function (...args) {
    this.classList.add(...args);
    return this;
  },
  hasClass: function (className) {
    return this.classList.contains(className);
  },
  css(key, value) {
    this.style[key] = value;
  },
});

// Number;
Object.assign(Number.prototype, {
  toCurrency: moneyFormat,
});

//String
Object.assign(String.prototype, {
  toCurrency: moneyFormat,
  convertToSlug,
});

function convertToSlug() {
  let str = this;
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
  return str
    .toLowerCase()
    .replace(/-/g, " ")
    .trim()
    .replace(/[\(\)\[\]'"]/g, "")
    .replace(/[^\w]+/g, "-");
}

var moneyFormatString = theme.currency.format;

function moneyFormat(format) {
  let cents = this;
  if (cents instanceof String) {
    cents = cents.replace(".", "");
  }
  var value = "";
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = format || moneyFormatString;

  function formatWithDelimiters(number, precision, thousands, decimal) {
    thousands = thousands || ",";
    decimal = decimal || ".";

    if (isNaN(number) || number === null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split(".");
    var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands);
    var centsAmount = parts[1] ? decimal + parts[1] : "";

    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case "amount":
      value = formatWithDelimiters(cents, 2);
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0);
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ".", ",");
      break;
    case "amount_no_decimals_with_space_separator":
      value = formatWithDelimiters(cents, 0, " ");
      break;
    case "amount_with_apostrophe_separator":
      value = formatWithDelimiters(cents, 2, "'");
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

(function () {
  let nativeFetch = window.fetch;
  window.fetch = function (...agrs) {
    let dataType = !!agrs[1] ? agrs[1].dataType : "";
    return nativeFetch(...agrs).then(async (res) => {
      if (!res.ok && res.type === "basic") {
        throw await res.json();
      }
      switch (dataType) {
        case "json": {
          return res.json();
        }
        case "text": {
          return res.text();
        }
        default:
          return res;
      }
    });
  };
})();
