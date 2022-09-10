(()=>{"use strict";let e=(e,t,s)=>{let n={};if(!e)return;console.log(t);let i=e.dataset.statusSoldOut,a=e.getElementsByClassName("js-option-item");function o(t){let s,a,o=r();switch(t){case 1:s="root",a=e.querySelector(".js-swatch-item[data-position='1']");break;case 2:s=o.option1,a=e.querySelector(".js-swatch-item[data-position='2']");break;case 3:s=o.option1+" / "+o.option2,a=e.querySelector(".js-swatch-item[data-position='3']")}switch(a.dataset.style){case"select":{let e=a.getElementsByClassName("js-option-item")[0],t=e.value;switch(i){case"hide":e.innerHTML=n[s].map((e=>`<option value="${e}">${e}</option>`)).join(""),n[s].includes(t)&&(e.value=t);break;case"disable":[...e.options].forEach((e=>{n[s].includes(e.value)?e.disabled=!1:(e.disabled=!0,e.selected=!1)})),[...e.options].find((e=>0==e.disabled&&(e.selected=!0)))}break}case"color":case"image":case"button":let e=a.getElementsByClassName("js-option-item"),t=[...e].find((e=>e.checked)).value;switch(i){case"hide":e.forEach((i=>{n[s].includes(i.value)?i.closest(".swatch-group_wrapper").removeClass("d-none"):(i.closest(".swatch-group_wrapper").addClass("d-none"),t===i.value&&(i.checked=!1,e[0].checked=!0))}));break;case"disable":e.forEach((i=>{n[s].includes(i.value)?i.disabled=!1:(i.disabled=!0,t===i.value&&(i.checked=!1,e[0].checked=!0))}))}}e.dispatchEvent(new CustomEvent("swatch-change",{detail:{position:t,optionValue:o[`option${t}`]}}))}function r(){return[...e.getElementsByClassName("js-swatch-item")].reduce(((e,t)=>{switch(t.dataset.style){case"select":let s=t.querySelector("select.single-option-selector");e[s.name]=s.value;break;case"color":case"image":case"button":let n=t.querySelectorAll("input[data-single-option-selector]");e[n[0].name]=[...n].find((e=>e.checked)).value}return e}),{})}function c(e){return t.variants.find((t=>Object.keys(e).every((s=>t[s]===e[s]))))}t.variants.length<2||(a.addEvents("change",(function(){e.dispatchEvent(new CustomEvent("swatch-change",{detail:{position:+this.dataset.optionPosition,optionValue:this.value}}))})),e.addEvent("swatch-change",(function({detail:{position:n,optionValue:i}}){switch(e.querySelector(`[data-selected-option='option${n}']`).innerHTML=i,n){case 1:t.options.length>1?o(2):s(c(r()));break;case 2:3===t.options.length?o(3):s(c(r()));break;case 3:s(c(r()))}})),t.variants.forEach((e=>{if(e.available){if(n.root=n.root||[],n.root.push(e.option1),n.root=n.root.reduce(((e,t)=>(e.includes(t)||e.push(t),e)),[]),t.options.length>1){var s=e.option1;n[s]=n[s]||[],n[s].push(e.option2),n[s]=n[s].reduce(((e,t)=>(e.includes(t)||e.push(t),e)),[])}if(3===t.options.length){s=e.option1+" / "+e.option2;n[s]=n[s]||[],n[s].push(e.option3),n[s]=n[s].reduce(((e,t)=>(e.includes(t)||e.push(t),e)),[])}}})),o(1))};HTMLElement;HTMLElement;HTMLElement;HTMLElement;HTMLElement;class t extends HTMLElement{constructor(){super(),this.getElementsByClassName("js-popup-close").addEvents("click",this.close.bind(this))}close(){this.removeClass("is-open"),AT.enableScroll()}open(){this.addClass("is-open"),AT.disableScroll()}}class s extends t{constructor(){super()}open(t){switch(this.querySelector(".js-popup-box-inner").innerHTML=t,this.elms={priceCompareElement:this.querySelector(".js-price-compare"),priceElement:this.querySelector(".js-price"),skuElement:this.querySelector(".js-sku"),inventoryElement:this.querySelector(".js-inventory"),mediaMain:this.querySelector("#quick-view-product-media-main"),mediaThumnails:this.querySelector("#quick-view-product-media-thumnails"),selectMaster:this.querySelector("#select-master"),addToCartButton:this.querySelector(".js-atc-btn"),formElement:this.querySelector("form[action*='/cart/add']"),labelSaveContainer:this.querySelector(".js-product-label-save"),swatchContainer:this.querySelector("swatch-component"),quantityInputContainer:this.querySelector(".js-product-quantity"),subscribeForm:this.querySelector("#contact-notify-when-available"),dynamicCheckoutContainer:this.querySelector(".js-product-dymanic-checkout")},this.settings=JSON.parse(this.querySelector("[data-settings]").innerHTML),this.product=JSON.parse(this.querySelector("[data-product-json]").innerHTML),this.variantsInventory=JSON.parse(this.querySelector("[data-variants-inventory-json]").innerHTML),Object.keys(this.variantsInventory).forEach((e=>{this.product.variants.find((t=>t.id==e&&Object.assign(t,this.variantsInventory[e])))})),this.initSliderMedia(),this.initInventory(),this.initFormAddToCart(),e(this.elms.swatchContainer,this.product,this.handleVariantChange.bind(this)),theme.settings.shop.reviewApp){case"shopify":window.SPR&&(window.SPR.initDomEls(),window.SPR.loadBadges())}AT.debounce((()=>{this.addClass("is-open"),AT.disableScroll()}),50)()}initSliderMedia(){let{mediaMain:e,mediaThumnails:t}=this.elms;!customElements.get("slider-component")&&AT.initCustomElements("slider-component"),this.mainSlider=e.init({gutter:12}),t.init()}handleVariantChange(e){let{skuElement:t,selectMaster:s,mediaMain:n}=this.elms;if(!e)return this.updateVariantStatus(),void n.addClass("product-sold-out");this.currentVariant=e,this.updateLabelSave(e),this.updateVariantStatus(e),this.updatePrice(e),e.available?n.removeClass("product-sold-out"):n.addClass("product-sold-out"),e.sku?t.innerHTML=e.sku:t.innerHTML=theme.strings.product.skuNA,e.featured_media&&this.mainSlider.goTo(e.featured_media.position-1),s.value=e.id}initInventory(){let{inventoryElement:e}=this.elms;this.inventory={setStatus:(t,s)=>{if(this.settings.showInventory)switch(e.setAttribute("data-status",t),t){case"coming-stock":e.querySelector(".inventory_coming-stock").innerHTML=theme.strings.dateComingStock.replace("{{date}}",s.next_incoming_date);break;case"low-stock":e.querySelector(".inventory_low-stock").innerHTML=(s.inventory_quantity>1?theme.strings.product.itemsLowStock:theme.strings.product.itemLowStock).replace("{{quantity}}",s.inventory_quantity);break;case"items-stock":e.querySelector(".inventory_items-stock").innerHTML=(s.inventory_quantity>1?theme.strings.product.itemsStock:theme.strings.product.itemStock).replace("{{quantity}}",s.inventory_quantity)}}}}updateVariantStatus(e){let{addToCartButton:t}=this.elms;e?(this.settings.enableSubscribe&&(this.updateDynamicCheckout(e.available),this.updateSubscribeForm(e)),this.updateAddToCartButton(e),this.updateInventory(e)):(t.disabled=!0,t.querySelector("span").innerHTML=theme.strings.product.soldOut,this.inventory.setStatus("out-stock"))}updateDynamicCheckout(e){let{dynamicCheckoutContainer:t}=this.elms;t&&(e?t.removeClass("d-none"):t.addClass("d-none"))}updateSubscribeForm(e){let{subscribeForm:t}=this.elms,s=t.querySelector("input[name='contact[body]']"),n=t.querySelector(".js-product-subscribe");!AT.getParameterByName("contact_posted")&&n.removeClass("posted-successfully"),s.value=s.dataset.value.replace("{{product_name}}",e.name),e.available?n.addClass("d-none"):n.removeClass("d-none"),t.addEvent("submit",(()=>{AT.cookie.set("subscribe-variant-id",this.currentVariant.id)}))}updateAddToCartButton(e){let{addToCartButton:t,quantityInputContainer:s}=this.elms;e.available?(t.disabled=!1,t.querySelector("span").innerHTML=0==e.inventory_quantity&&e.incoming?theme.strings.product.preorder:theme.strings.product.addToCart,this.settings.enableSubscribe&&s.removeClass("d-none")):(t.disabled=!0,t.querySelector("span").innerHTML=theme.strings.product.soldOut,this.settings.enableSubscribe&&s.addClass("d-none"))}updateInventory(e){e.available?e.inventory_management?0==e.inventory_quantity&&e.incoming?this.inventory.setStatus("coming-stock",e):e.inventory_quantity<=this.settings.inventoryThreshold?this.inventory.setStatus("low-stock",e):this.inventory.setStatus("items-stock",e):this.inventory.setStatus("in-stock"):this.inventory.setStatus("out-stock")}initFormAddToCart(){let{formElement:e,addToCartButton:t}=this.elms;e.addEvent("submit",(s=>{t.hasClass("has-pending")||t.insertAdjacentHTML("beforeend",'<svg class="svg-loading" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: none; shape-rendering: auto;" width="28px" height="28px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><circle cx="50" cy="50" fill="none" stroke="var(--main-color)" stroke-width="5" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">  <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform></circle></svg>'),s.preventDefault(),t.addClass("pending","has-pending"),Cart.add(e).then((()=>{this.close()})).catch((e=>{AT.loadPopupMessage().then((()=>{Popups.closeAll(),PopupMessage.open(e.description)}))})).finally((()=>{t.removeClass("pending")}))}))}updateLabelSave(e){let{labelSaveContainer:t}=this.elms,s=t.querySelector(".js-percent"),n=t.querySelector(".js-money-saved"),{compare_at_price:i,price:a}=e;i>a?(n.innerHTML=(i-a).toCurrency(),s.innerHTML=Math.round((i-a)/i*100),t.removeClass("d-none")):t.addClass("d-none")}updatePrice(e){let{priceCompareElement:t,priceElement:s}=this.elms;e.compare_at_price?(t.innerHTML=e.compare_at_price.toCurrency(),t.removeClass("d-none")):t.addClass("d-none"),s.innerHTML=e.price.toCurrency()}switchVariantById(e){let{swatchContainer:t}=this.elms,s=theme.product.variants.find((t=>t.id==e));s&&s.options.forEach(((e,s)=>{[...t.querySelectorAll(`[name='option${s+1}']`)].find((t=>{switch(t.tagName){case"INPUT":t.value==e&&(t.checked=!0,t.dispatchEvent(new Event("change")));break;case"SELECT":t.value=e,t.dispatchEvent(new Event("change"))}}))}))}}let n=document.getElementById("popup-container"),i=n.content.querySelector("popup-quick-view");i&&(n.insertAdjacentElement("beforebegin",i),customElements.define("popup-quick-view",s),window.PopupQuickView=i,Popups.push("popup-quick-view",window.PopupQuickView)),console.log("popup-quick-view script loaded")})();