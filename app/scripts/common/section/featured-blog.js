export let FeaturedBlog = {
  onLoad() {
    let { container } = this;
  
    try {
      AT.detectVisible({
        element: container,
        rootMargin: "0px",
        callback() {
          let sliderComponent_1 = document.getElementById("slideshow-media-main");
          let sliderComponent_2 = document.getElementById("slideshow-three-products");
          sliderComponent_1.init();
          if(sliderComponent_2){sliderComponent_2.init()};
        },
      });
    } catch (error) {
      console.log(container);
      console.error(error);
    }
  },
};
