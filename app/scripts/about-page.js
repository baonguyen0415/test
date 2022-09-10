let AboutPage = {
  onLoad: function () {
    let sliderContainers = this.container.getElementsByClassName("js-slider-container");
    sliderContainers.forEach((sliderContainer) => {
      let config = JSON.parse(sliderContainer.querySelector("[data-tns-config]").innerHTML);
      config.onInit = () => {
        sliderContainer.addClass("slider-initialized");
      };
      tns(config);
    });
  },
};

register("about-page", AboutPage);
load("*");
