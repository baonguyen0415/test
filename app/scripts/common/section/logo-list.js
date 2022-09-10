export let LogoList = {
  onLoad() {
    let { container } = this;

    try {
      AT.detectVisible({
        element: container,
        rootMargin: "0px",
        callback() {
          let sliderComponent = container.querySelector("slider-component");
          sliderComponent.init();
        },
      });
    } catch (error) {
      console.log(container);
      console.error(error);
    }
  },
};
