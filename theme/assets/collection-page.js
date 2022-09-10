(()=>{"use strict";class e extends HTMLElement{constructor(){super(),this.isLoading=!1,this.initEventHandler()}initEventHandler(){const e=e=>{let t=this;return function(i){let n=t.getBoundingClientRect(),r=t.getInfo();!t.isLoading&&r.nextPage&&window.pageYOffset+1e3>=n.y&&e()}};Object.assign(this,{unobserver:()=>{window.removeEvent("scroll",this.scrollHandler),this.removeEvent("click",this.scrollHandler)},observer(t){this.scrollHandler=e(t),this.unobserver(),window.addEvent("scroll",this.scrollHandler),this.addEvent("click",this.scrollHandler)}})}reset(){this.setAttribute("data-current-page",1),this.setAttribute("data-next-page",1)}setStatus(e){switch(e){case"hide":this.addClass("d-none");break;case"show":this.removeClass("d-none");break;case"loading":this.setAttribute("loading",""),this.isLoading=!0;break;case"loaded":this.removeAttribute("loading"),this.isLoading=!1;break;case"reset":this.setAttribute("data-current-page",1),this.setAttribute("data-next-page",1)}}setInfo({currentPage:e,nextPage:t}){this.setAttribute("data-current-page",e),this.setAttribute("data-next-page",t)}getInfo(){return{currentPage:+this.getAttribute("data-current-page"),nextPage:+this.getAttribute("data-next-page")}}}register("collection-template",{onLoad(){let{container:e}=this;this.elms={sortBy:e.querySelector("#select-sort-by"),productGridContainer:e.querySelector("#main-collection-product-grid"),filterGroups:e.getElementsByClassName("js-filter-group"),productsShowing:e.querySelector("#products-showing"),filterValueCountElements:e.querySelectorAll("#collection-filters-form .js-count"),infiniteButton:e.querySelector("infinite-button"),sidebarContainer:e.querySelector("#main-collection-filters"),collectionProductGridList:e.querySelector("#collection-product-grid"),paginationContainer:e.querySelector("#pagination-container")},this.canceLoadProducts=!1,this.filterData={},this.settings=JSON.parse(this.container.querySelector("script[data-collection-settings]").innerHTML),this.filterActiveValues=this.getFilterActiveValues(),"infinite"==this.settings.paginationType&&this.loadProducts().then((()=>this.initInfiniteButton())),this.initFilter(),this.initSortBy(),this.initGridList()},initSortBy(){if(this.settings.enableSort){let{sortBy:e}=this.elms;e.addEvent("change",(()=>{"infinite"==this.settings.paginationType?this.loadProducts("sort-by"):this.updatePage("sort-by")}))}},initFilter(){if(document.querySelector(".section-collection-template").hasClass("has-sidebar")){let{filterGroups:e}=this.elms,t=document.querySelectorAll(".maxlist-more"),i=document.querySelectorAll(".maxlist-less");if(t.forEach((e=>{e.addEvent("click",(function(){let e=this.closest(".filter-maxlist");this.addClass("d-none"),this.closest(".filter-group_inner").addClass("maxlist-more-active"),e.querySelector(".maxlist-less").removeClass("d-none")}))})),i.forEach((e=>{e.addEvent("click",(function(){let e=this.closest(".filter-maxlist");this.addClass("d-none"),this.closest(".filter-group_inner").removeClass("maxlist-more-active"),e.querySelector(".maxlist-more").removeClass("d-none")}))})),document.querySelector(".collection-filters_form").hasClass("has-filter-price")){document.querySelectorAll(".filter-group-display__list-item_checkbox").forEach((e=>{e.addEvent("click",(function(){document.querySelector(".collection-filters_form").submit()}))}))}else e.forEach((e=>{let{paramName:t}=e.dataset;e.querySelectorAll("input").addEvents("input",(i=>{let n=i.target;e.setAttribute("pending",""),n.checked?this.filterActiveValues[t].push(n.value):this.filterActiveValues[t]=this.filterActiveValues[t].filter((e=>e!=n.value)),this.canceLoadProducts=!0,this.updatePage("filter").then((()=>{e.removeAttribute("pending"),this.canceLoadProducts=!1}))}))}))}},initInfiniteButton(){let{infiniteButton:t,paginationContainer:i}=this.elms;!customElements.get("infinite-button")&&customElements.define("infinite-button",e),t.getInfo().nextPage&&(t.observer(this.onInfiniteHandler.bind(this)),i.removeClass("d-none"))},onInfiniteHandler(){let{infiniteButton:e}=this.elms,{nextPage:t,currentPage:i}=e.getInfo();if(t){i++;let t=this.getSearchParams("infinite",i);e.setStatus("loading"),this.updatePage("infinite",t).then((()=>e.setStatus("loaded")))}},async loadProducts(e){let t=+this.getPageNumber();for(let i=1;i<=t;i++){let t=this.getSearchParams("load-products",i);if(this.canceLoadProducts){this.canceLoadProducts=!1;break}await this.updatePage("load-products",t,i,e)}},async updatePage(e,t,i,n){return!t&&(t=this.getSearchParams(e)),new Promise(((r,s)=>{AT.queue.add(this.getPage(t),(s=>{switch(e){case"sort-by":case"filter":this.renderPage(s,e),this.updateURLHash(t);break;case"load-products":this.renderPage(s,e,i,n),"sort-by"==n&&this.updateURLHash(t);break;case"infinite":this.renderPage(s,e),this.updateURLHash(t)}r(1)}))}))},async renderPage(e,t,i,n){let{productGridContainer:r,filterValueCountElements:s,paginationContainer:a,productsShowing:o,infiniteButton:l}=this.elms;switch(t){case"sort-by":r.innerHTML=e.querySelector("#main-collection-product-grid").innerHTML,"infinite"!==this.settings.paginationType&&(a.innerHTML=e.querySelector("#pagination-container").innerHTML.replace(/&view=ajax/g,"").replace(/&amp;view=ajax/g,""));break;case"filter":r.innerHTML=e.querySelector("#main-collection-product-grid").innerHTML,JSON.parse(e.querySelector("script[filter-values-counts]").innerHTML).filter(Boolean).forEach(((e,t)=>{s[t].innerHTML=e,0==e?s[t].closest(".filter-group_item").addClass("d-none"):s[t].closest(".filter-group_item").removeClass("d-none")})),o&&(o.innerHTML=e.querySelector("#products-showing").innerHTML),"infinite"!==this.settings.paginationType&&(a.innerHTML=e.querySelector("#pagination-container").innerHTML.replace(/&view=ajax/g,"").replace(/&amp;view=ajax/g,""));break;case"infinite":o&&(o.innerHTML=e.querySelector("#products-showing").innerHTML);case"load-products":"sort-by"==n&&1==i&&(r.innerHTML=""),e.querySelectorAll("product-card").forEach((e=>r.append(e)))}if("infinite"===this.settings.paginationType&&"load-products"!=t){let{currentPage:t,nextPage:i}=e.querySelector("infinite-button").dataset;+i?(a.removeClass("d-none"),l.observer(this.onInfiniteHandler.bind(this))):(a.addClass("d-none"),l.unobserver()),l.setInfo({currentPage:t,nextPage:i})}},getSearchParams(e,t){let{sortBy:i}=this.elms,n=[AT.getParameterByName("q")?`q=${AT.getParameterByName("q")}`:"",...Object.keys(this.filterActiveValues).reduce(((e,t)=>(this.filterActiveValues[t].length&&e.push(`${t}=${this.filterActiveValues[t].map(encodeURIComponent).join(",")}`),e)),[]),i?`sort_by=${i.value}`:""];switch(e){case"sort-by":n.push(`page=${this.getPageNumber()}`);break;case"infinite":case"load-products":n.push(`page=${t}`)}return n.push("view=ajax"),n.filter(Boolean).join("&")},getPage(e){let t=`${window.location.pathname}?${e}`;return this.filterData[t]?this.filterData[t].cloneNode(!0):fetch(t,{dataType:"text"}).then((e=>{let i=document.createElement("div");return i.innerHTML=e,this.filterData[t]=i.cloneNode(!0),i}))},getPageNumber:()=>AT.getParameterByName("page")||1,updateURLHash(e){history.pushState({},"",`${window.location.pathname}${e&&"?".concat(e.replace("&view=ajax",""))}`)},initGridList(){let{collectionProductGridList:e,productGridContainer:t}=this.elms;if(e.querySelector(".grid-list")){let t=e.querySelectorAll(".grid");t.forEach((function(i){i.addEventListener("click",(function(){t.forEach((function(e){e.removeClass("active")})),this.addClass("active");let i=this.getAttribute("data-grid");e.className="",e.addClass(i)}))}))}},getFilterActiveValues(){let e=JSON.parse(this.container.querySelector("script[data-collection-filter-active-values]").innerHTML);return window.location.search.replace("?","").split("&").forEach((t=>{let[i,n]=t.split(/=(.+)/);i in e&&n&&!e[i].includes(n)&&e[i].push(n)})),e}}),load("collection-template"),console.log("collection-page.js loaded")})();