import { InfiniteButton } from "./common/model/infinite-button";

let CollectionDefault = {
  onLoad() {
    let { container } = this;
    this.elms = {
      sortBy: container.querySelector("#select-sort-by"),
      productGridContainer: container.querySelector("#main-collection-product-grid"),
      filterGroups: container.getElementsByClassName("js-filter-group"),
      productsShowing: container.querySelector("#products-showing"),
      filterValueCountElements: container.querySelectorAll("#collection-filters-form .js-count"),
      infiniteButton: container.querySelector("infinite-button"),
      sidebarContainer: container.querySelector("#main-collection-filters"),
      collectionProductGridList: container.querySelector("#collection-product-grid"),
      paginationContainer: container.querySelector("#pagination-container"),
    };
    this.canceLoadProducts = false;
    this.filterData = {};
    this.settings = JSON.parse(this.container.querySelector("script[data-collection-settings]").innerHTML);

    this.filterActiveValues = this.getFilterActiveValues();

    if (this.settings.paginationType == "infinite") {
      this.loadProducts().then(() => this.initInfiniteButton());
    }
    this.initFilter();
    this.initSortBy();
    this.initGridList();
  },

  initSortBy() {
    if (this.settings.enableSort) {
      let { sortBy } = this.elms;
      sortBy.addEvent("change", () => {
        if (this.settings.paginationType == "infinite") {
          this.loadProducts("sort-by");
        } else {
          this.updatePage("sort-by");
        }
      });
    }
  },
  
  initFilter() {
    if(document.querySelector('.section-collection-template').hasClass('has-sidebar')){
      let { filterGroups } = this.elms;
      let filterMaxlistMore = document.querySelectorAll(".maxlist-more");
      let filterMaxlistLess = document.querySelectorAll(".maxlist-less");

      filterMaxlistMore.forEach((e) => {
        e.addEvent("click", function () {
          let filterMax = this.closest(".filter-maxlist");
          this.addClass("d-none");
          this.closest(".filter-group_inner").addClass("maxlist-more-active");
          filterMax.querySelector(".maxlist-less").removeClass("d-none");
        });
      });

      filterMaxlistLess.forEach((e) => {
        e.addEvent("click", function () {
          let filterMax = this.closest(".filter-maxlist");
          this.addClass("d-none");
          this.closest(".filter-group_inner").removeClass("maxlist-more-active");
          filterMax.querySelector(".maxlist-more").removeClass("d-none");
        });
      });

      if(document.querySelector('.collection-filters_form').hasClass('has-filter-price')){
        let checkboxContainer = document.querySelectorAll(".filter-group-display__list-item_checkbox");
        checkboxContainer.forEach((e) => {
          e.addEvent("click", function () {
            document.querySelector(".collection-filters_form").submit();
          });
        });
      }
      
      else{
        filterGroups.forEach((filterGroupItem) => {
          let { paramName } = filterGroupItem.dataset;
          filterGroupItem.querySelectorAll("input").addEvents("input", (e) => {
            let input = e.target;
            filterGroupItem.setAttribute("pending", "");
            if (input.checked) {
              this.filterActiveValues[paramName].push(input.value);
            } else {
              this.filterActiveValues[paramName] = this.filterActiveValues[paramName].filter(
                (value) => value != input.value,
              );
            }
            this.canceLoadProducts = true;
            this.updatePage("filter").then(() => {
              filterGroupItem.removeAttribute("pending");
              this.canceLoadProducts = false;
            });
          });
        });
      } 
    }
  },

  initInfiniteButton() {
    let { infiniteButton, paginationContainer } = this.elms;
    !customElements.get("infinite-button") && customElements.define("infinite-button", InfiniteButton);
    if (infiniteButton.getInfo().nextPage) {
      infiniteButton.observer(this.onInfiniteHandler.bind(this));
      paginationContainer.removeClass("d-none");
    }
  },

  onInfiniteHandler() {
    let { infiniteButton } = this.elms;
    let { nextPage, currentPage } = infiniteButton.getInfo();
    if (nextPage) {
      currentPage++;
      let searchParams = this.getSearchParams("infinite", currentPage);
      infiniteButton.setStatus("loading");
      this.updatePage("infinite", searchParams).then(() => infiniteButton.setStatus("loaded"));
    }
  },

  async loadProducts(triggerAction) {
    let currentPage = +this.getPageNumber();
    for (let i = 1; i <= currentPage; i++) {
      let searchParams = this.getSearchParams("load-products", i);
      if (this.canceLoadProducts) {
        this.canceLoadProducts = false;
        break;
      }
      await this.updatePage("load-products", searchParams, i, triggerAction);
    }
  },

  async updatePage(action, searchParams, currentPage, triggerAction) {
    !searchParams && (searchParams = this.getSearchParams(action));
    return new Promise((res, rej) => {
      AT.queue.add(this.getPage(searchParams), (html) => {
        switch (action) {
          case "sort-by": {
            this.renderPage(html, action);
            this.updateURLHash(searchParams);
            break;
          }
          case "filter": {
            this.renderPage(html, action);
            this.updateURLHash(searchParams);
            break;
          }
          case "load-products": {
            this.renderPage(html, action, currentPage, triggerAction);
            if (triggerAction == "sort-by") {
              this.updateURLHash(searchParams);
            }
            break;
          }
          case "infinite": {
            this.renderPage(html, action);
            this.updateURLHash(searchParams);
            break;
          }
        }
        res(1);
      });
    });
  },

  async renderPage(html, action, currentPage, triggerAction) {
    let { productGridContainer, filterValueCountElements, paginationContainer, productsShowing, infiniteButton } =
      this.elms;
    switch (action) {
      case "sort-by":
        productGridContainer.innerHTML = html.querySelector("#main-collection-product-grid").innerHTML;
        if (this.settings.paginationType !== "infinite") {
          paginationContainer.innerHTML = html
            .querySelector("#pagination-container")
            .innerHTML.replace(/&view=ajax/g, "")
            .replace(/&amp;view=ajax/g, "");
        }
        break;
      case "filter":
          productGridContainer.innerHTML = html.querySelector("#main-collection-product-grid").innerHTML;
          JSON.parse(html.querySelector("script[filter-values-counts]").innerHTML)
            .filter(Boolean)
            .forEach((count, index) => {
              filterValueCountElements[index].innerHTML = count;
              if(count == 0){
                filterValueCountElements[index].closest('.filter-group_item').addClass('d-none');
              }
              else{
                filterValueCountElements[index].closest('.filter-group_item').removeClass('d-none');
              }
            });
          !!productsShowing && (productsShowing.innerHTML = html.querySelector("#products-showing").innerHTML);
          if (this.settings.paginationType !== "infinite") {
            paginationContainer.innerHTML = html
              .querySelector("#pagination-container")
              .innerHTML.replace(/&view=ajax/g, "")
              .replace(/&amp;view=ajax/g, "");
          }
        break;
      case "infinite":
        !!productsShowing && (productsShowing.innerHTML = html.querySelector("#products-showing").innerHTML);
      case "load-products":
        if (triggerAction == "sort-by" && currentPage == 1) {
          productGridContainer.innerHTML = "";
        }
        html.querySelectorAll("product-card").forEach((productCard) => productGridContainer.append(productCard));
    }
    if (this.settings.paginationType === "infinite" && action != "load-products") {
      let { currentPage: currentPage2, nextPage } = html.querySelector("infinite-button").dataset;
      if (+nextPage) {
        paginationContainer.removeClass("d-none");
        infiniteButton.observer(this.onInfiniteHandler.bind(this));
      } else {
        paginationContainer.addClass("d-none");
        infiniteButton.unobserver();
      }
      infiniteButton.setInfo({ currentPage: currentPage2, nextPage });
    }
  },

  getSearchParams(action, pageNumber) {
    let { sortBy } = this.elms;
    let searchParams = [
      AT.getParameterByName("q") ? `q=${AT.getParameterByName("q")}` : "",
      ...Object.keys(this.filterActiveValues).reduce((accu, value) => {
        if (this.filterActiveValues[value].length) {
          accu.push(`${value}=${this.filterActiveValues[value].map(encodeURIComponent).join(",")}`);
        }
        return accu;
      }, []),
      !!sortBy ? `sort_by=${sortBy.value}` : "",
    ];
    switch (action) {
      case "sort-by":
        searchParams.push(`page=${this.getPageNumber()}`);
        break;
      case "infinite":
      case "load-products":
        searchParams.push(`page=${pageNumber}`);
        break;
    }
    searchParams.push("view=ajax");
    return searchParams.filter(Boolean).join("&");
  },

  getPage(searchParams) {
    let url = `${window.location.pathname}?${searchParams}`;
    return this.filterData[url]
      ? this.filterData[url].cloneNode(true)
      : fetch(url, { dataType: "text" }).then((content) => {
          let div = document.createElement("div");
          div.innerHTML = content;
          this.filterData[url] = div.cloneNode(true);
          return div;
        });
  },

  getPageNumber() {
    return AT.getParameterByName("page") || 1;
  },

  updateURLHash(searchParams) {
    history.pushState(
      {},
      "",
      `${window.location.pathname}${searchParams && "?".concat(searchParams.replace("&view=ajax", ""))}`,
    );
  },

  initGridList() {
    let { collectionProductGridList, productGridContainer } = this.elms;
    let gridList = collectionProductGridList.querySelector('.grid-list');

    if(gridList){
      let gridView = collectionProductGridList.querySelectorAll('.grid');

      gridView.forEach(function (grid) {
        grid.addEventListener("click", function () {
          gridView.forEach(function(gridActive) {
            gridActive.removeClass("active");
          });
          this.addClass('active');

          let gridClass = this.getAttribute('data-grid');
          collectionProductGridList.className = '';
          collectionProductGridList.addClass(gridClass);
        });
      });
    }
  },

  getFilterActiveValues() {
    let filterActive = JSON.parse(
      this.container.querySelector("script[data-collection-filter-active-values]").innerHTML,
    );

    window.location.search
      .replace("?", "")
      .split("&")
      .forEach((param) => {
        let [filterString, value] = param.split(/=(.+)/);
        if (filterString in filterActive && value) {
          !filterActive[filterString].includes(value) && filterActive[filterString].push(value);
        }
      });

    return filterActive;
  },
};
register("collection-template", CollectionDefault);
load("collection-template");
console.log("collection-page.js loaded");
