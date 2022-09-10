export let AnnouncementBar = {
  onLoad() {
    let { container } = this;
    try {
      this.slider = container.querySelector("slider-component").init();
    } catch (error) {
      console.log(container);
      console.warn(error);
    }
  },
};
