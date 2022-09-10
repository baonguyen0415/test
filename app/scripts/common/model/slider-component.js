export class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.sliderContainer = this.querySelector(".js-slider-container");
    this.config = Object.assign(JSON.parse(this.querySelector("[data-tns-config]").innerHTML), {
      onInit: () => {
        this.sliderContainer.addClass("slider-initialized");
      },
    });
  }

  init(config = {}) {
    try {
      return (this.slider = tns(Object.assign({ ...this.config }, config)));
    } catch (error) {
      console.log(this);
      console.error(error);
    }
  }

  destroy() {
    this.slider.destroy();
  }

  goTo(index) {
    try {
      this.slider.goTo(index);
    } catch (error) {
      console.log(this);
      console.warn(error);
    }
  }

  play() {
    try {
      this.slider.play();
    } catch (error) {
      console.log(this);
      console.warn(error);
    }
  }

  pause() {
    try {
      this.slider.pause();
    } catch (error) {
      console.log(this);
      console.warn(error);
    }
  }

  getConfig() {
    return this.config;
  }
}
