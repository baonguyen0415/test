export function getProductList(url, productGridContainer) {
  // let { productGridContainer, infiniteButton } = this.elms;
  return fetch(url, { dataType: "text" }).then((content) => {
    let div = document.createElement("div");
    div.innerHTML = content;

    productGridContainer.innerHTML = div.querySelector("#main-collection-product-grid").innerHTML;

    history.replaceState(
      {},
      "",
      url
        .replace("?section_id=collection-ajax&", "?")
        .replace("?section_id=collection-ajax", "")
        .replace("&section_id=collection-ajax", ""),
    );

    // infiniteButton.setAttribute("data-page", 1);
    // infiniteButton.removeClass("end");
  });
}
