export let initTabPanel = (container) => {
  try {
    let tabControls = container.querySelector(".js-nav-controls");
    let tabContents = container.querySelector(".js-tab-contents");

    [...tabControls.children].forEach((item) => {
      let target = tabContents.querySelector(item.dataset.target);

      item.addEvent("click", () => {
        if (item.hasClass("active")) {
          return;
        }
        tabControls.children.removeClass("active");
        tabContents.children.removeClass("active");
        item.addClass("active");
        target.addClass("active");
      });
    });
  } catch (error) {
    console.warn("Has an error from Tab Panel function:", error);
    console.log(container);
  }
};
