(() => {
  // app/scripts/common/model/infinite-button.js
  var InfiniteButton = class extends HTMLElement {
    constructor() {
      super();
      this.isLoading = false;
      this.initEventHandler();
    }
    initEventHandler() {
      const handler = (cb) => {
        let self = this;
        return function(e) {
          let rect = self.getBoundingClientRect();
          let settings = self.getInfo();
          if (!self.isLoading && settings.nextPage && window.pageYOffset + 1e3 >= rect.y) {
            cb();
          }
        };
      };
      Object.assign(this, {
        unobserver: () => {
          window.removeEvent("scroll", this.scrollHandler);
          this.removeEvent("click", this.scrollHandler);
        },
        observer(cb) {
          this.scrollHandler = handler(cb);
          this.unobserver();
          window.addEvent("scroll", this.scrollHandler);
          this.addEvent("click", this.scrollHandler);
        }
      });
    }
    reset() {
      this.setAttribute("data-current-page", 1);
      this.setAttribute("data-next-page", 1);
    }
    setStatus(status) {
      switch (status) {
        case "hide":
          this.addClass("d-none");
          break;
        case "show":
          this.removeClass("d-none");
          break;
        case "loading":
          this.setAttribute("loading", "");
          this.isLoading = true;
          break;
        case "loaded":
          this.removeAttribute("loading");
          this.isLoading = false;
          break;
        case "reset":
          this.setAttribute("data-current-page", 1);
          this.setAttribute("data-next-page", 1);
          break;
      }
    }
    setInfo({ currentPage, nextPage }) {
      this.setAttribute("data-current-page", currentPage);
      this.setAttribute("data-next-page", nextPage);
    }
    getInfo() {
      return {
        currentPage: +this.getAttribute("data-current-page"),
        nextPage: +this.getAttribute("data-next-page")
      };
    }
  };

  // app/scripts/blog-page.js
  var BlogTemplate = {
    onLoad() {
      this.filterData = [];
      this.elms = {
        infiniteButton: this.container.querySelector("infinite-button"),
        blogGridContainer: this.container.querySelector("#main-blog-grid"),
        tagElements: this.container.querySelectorAll(".js-tag"),
        paginationContainer: document.getElementById("pagination-container")
      };
      this.settings = JSON.parse(this.container.querySelector("script[data-blog-settings]").innerHTML);
      this.filterData = {};
      this.canceLoadArticles = false;
      if (this.settings.paginationType == "infinite") {
        this.loadArticles().then(() => this.initInfiniteButton());
      }
    },
    initFilter() {
      let { tagElements } = this.elms;
      let parent = tagElements[0].closest(".widget-tags");
      tagElements.forEach((tagItem) => {
        tagItem.addEvent("click", (e) => {
          e.preventDefault();
          let { tagHandle } = tagItem.dataset;
          let isActived = false;
          if (tagItem.hasClass("active")) {
            isActived = true;
            this.settings.currentTags = this.settings.currentTags.filter((tag) => tag != tagHandle);
          } else {
            this.settings.currentTags.push(tagHandle);
          }
          this.canceLoadArticles = true;
          parent.addClass("pending");
          this.updatePage("filter").then(() => {
            isActived ? tagItem.removeClass("active") : tagItem.addClass("active");
          }).catch((error) => {
            console.warn("Tag filter has an error:");
            console.warn(error);
          }).finally(() => {
            this.canceLoadArticles = false;
            parent.removeClass("pending");
          });
        });
      });
    },
    initInfiniteButton() {
      let { infiniteButton, paginationContainer } = this.elms;
      customElements.define("infinite-button", InfiniteButton);
      let { nextPage } = infiniteButton.getInfo();
      if (nextPage) {
        infiniteButton.observer(this.onInfiniteHandler.bind(this));
        paginationContainer.removeClass("d-none");
      }
    },
    onInfiniteHandler() {
      let { infiniteButton } = this.elms;
      let { currentPage, nextPage } = infiniteButton.getInfo();
      if (nextPage) {
        currentPage++;
        let searchParams = this.getSearchParams(currentPage);
        infiniteButton.setStatus("loading");
        this.updatePage("infinite", searchParams).then(() => infiniteButton.setStatus("loaded"));
      }
    },
    async loadArticles() {
      let currentPage = AT.getParameterByName("page") || 1;
      for (let i = 1; i <= currentPage; i++) {
        let searchParams = this.getSearchParams(i);
        if (this.canceLoadArticles) {
          this.canceLoadArticles = false;
          break;
        }
        await this.updatePage("load-articles", searchParams);
      }
    },
    async updatePage(action, searchParams) {
      !searchParams && (searchParams = this.getSearchParams());
      let url = `${this.settings.url}${searchParams}`;
      return new Promise((res, rej) => {
        try {
          AT.queue.add(this.getPage(url), (html) => {
            this.renderPage(action, html);
            this.updateURLHash(url);
            res(1);
          });
        } catch (error) {
          rej(error);
        }
      });
    },
    getPage(url) {
      return this.filterData[url] ? this.filterData[url].cloneNode(true) : fetch(url, { dataType: "text" }).then((content) => {
        let div = document.createElement("div");
        div.innerHTML = content;
        this.filterData[url] = div.cloneNode(true);
        return div;
      });
    },
    async renderPage(action, html) {
      let { blogGridContainer, paginationContainer, infiniteButton } = this.elms;
      let articles = [...html.querySelectorAll("#main-blog-grid article")];
      switch (action) {
        case "filter":
          await AT.scrollTo(blogGridContainer, 1e3, parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) + 40).then(() => {
            blogGridContainer.innerHTML = html.querySelector("#main-blog-grid").innerHTML;
            if (this.settings.paginationType != "infinite") {
              paginationContainer.innerHTML = html.querySelector("#pagination-container").innerHTML.replace(/&view=ajax/g, "").replace(/&amp;view=ajax/g, "");
            }
          });
          break;
        case "infinite":
        case "load-articles":
          articles.forEach((article) => blogGridContainer.append(article));
          break;
      }
      if (this.settings.paginationType == "infinite" && action != "load-articles") {
        let { currentPage, nextPage } = html.querySelector("infinite-button").dataset;
        if (+nextPage) {
          paginationContainer.removeClass("d-none");
          infiniteButton.observer(this.onInfiniteHandler.bind(this));
        } else {
          paginationContainer.addClass("d-none");
          infiniteButton.unobserver();
        }
        infiniteButton.setInfo({ currentPage, nextPage });
      }
    },
    getSearchParams(page) {
      return [
        this.settings.currentTags.length ? `/tagged/${this.settings.currentTags.join("+")}` : "",
        [`page=${page || 1}`, "view=ajax"].join("&")
      ].join("?");
    },
    updateURLHash(url) {
      history.pushState({}, "", url.replace("&view=ajax", ""));
    }
  };
  register("blog-template", BlogTemplate);
  load("blog-template");
})();
