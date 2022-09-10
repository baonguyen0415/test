export function getUrlAjaxRequest(value, action) {
  let newURL = "";
  switch (action) {
    case "sort-by": {
      if (!!window.location.search) {
        if (location.search.includes("sort_by")) {
          let paramsSearch = location.search.split("&");
          paramsSearch = paramsSearch.map((item) => {
            if (item.includes("sort_by")) {
              return item.split("=")[0] + "=" + value;
            }
            return item;
          });
          paramsSearch.push("section_id=collection-ajax");
          newURL = `${location.origin}${location.pathname}${paramsSearch.join("&")}`;
        } else {
          newURL = `${location.href}&sort_by=${value}&section_id=collection-ajax`;
        }
      } else {
        newURL = `${location.href}?sort_by=${value}&section_id=collection-ajax`;
      }
      break;
    }
    case "filter": {
      if (!!location.search) {
        let paramsSearch = location.search.split("&");
        paramsSearch = paramsSearch.map((item) => {
          if (item.includes("page=") && +item.split("=")[1] > 1) {
            return item.split("=")[0] + "=1";
          }
          return item;
        });

        newURL = `${this.url}/${this.currentTags.join("+")}${paramsSearch.join("&")}&section_id=collection-ajax`;
      } else {
        newURL = `${this.url}/${this.currentTags.join("+")}?section_id=collection-ajax`;
      }

      break;
    }
    default:
      if (!!window.location.search) {
        newURL = location.origin + location.pathname + location.search + "&section_id=collection-ajax";
      } else {
        newURL = `${location.origin + location.pathname + location.search}?section_id=collection-ajax`;
      }
      break;
  }
  return newURL;
}
