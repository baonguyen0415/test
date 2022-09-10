export function initPhotoSwipeFromDOM(galleryElement) {
  var parseThumbnailElements = (el) => {
    let items = [],
      item;
    // var thumbElements = el.childNodes,
    //   numNodes = thumbElements.length,
    //   items = [],
    //   el,
    //   childElements,
    //   size,
    //   item;

    el.querySelectorAll(".media-item").forEach((element) => {
      let img = element.querySelector("img");
      item = {
        src: element.dataset.imgUrl,
        w: +img.getAttribute("width"),
        h: +img.getAttribute("height"),
        el: img,
      };
      item.o = {
        src: item.src,
        w: +img.getAttribute("width"),
        h: +img.getAttribute("height"),
      };
      items.push(item);
    });

    // for (var i = 0; i < numNodes; i++) {
    //   el = thumbElements[i];

    //   // include only element nodes
    //   if (el.nodeType !== 1) {
    //     continue;
    //   }

    //   childElements = el.children;

    //   size = el.getAttribute("data-size").split("x");

    //   // create slide object
    //   item = {
    //     src: el.getAttribute("href"),
    //     w: parseInt(size[0], 10),
    //     h: parseInt(size[1], 10),
    //     author: el.getAttribute("data-author"),
    //   };

    //   item.el = el; // save link to element for getThumbBoundsFn

    //   if (childElements.length > 0) {
    //     item.msrc = childElements[0].getAttribute("src"); // thumbnail url
    //     if (childElements.length > 1) {
    //       item.title = childElements[1].innerHTML; // caption (contents of figure)
    //     }
    //   }

    //   // var mediumSrc = el.getAttribute("data-med");
    //   // if (mediumSrc) {
    //   //   size = el.getAttribute("data-med-size").split("x");
    //   //   // "medium-sized" image
    //   //   item.m = {
    //   //     src: mediumSrc,
    //   //     w: parseInt(size[0], 10),
    //   //     h: parseInt(size[1], 10),
    //   //   };
    //   // }
    //   // original image
    //   item.o = {
    //     src: item.src,
    //     w: item.w,
    //     h: item.h,
    //   };

    //   items.push(item);
    // }

    return items;
  };

  // find nearest parent element
  var closest = (el, fn) => {
    return el && (fn(el) ? el : closest(el.parentNode, fn));
  };

  var onThumbnailsClick = (e) => {
    e.preventDefault();

    var eTarget = e.target || e.srcElement;

    var clickedListItem = closest(eTarget, (el) => {
      return el.hasClass("media-item");
    });

    if (!clickedListItem) {
      return;
    }

    openPhotoSwipe(clickedListItem.dataset.position - 1);
    return false;
  };

  var openPhotoSwipe = (index, disableAnimation, fromURL) => {
    var pswpElement = document.getElementById("modal-image-zoom"),
      gallery,
      options,
      items;

    items = parseThumbnailElements(galleryElement);
    // define options (if needed)
    options = {
      galleryUID: galleryElement.getAttribute("data-pswp-uid"),

      getThumbBoundsFn: function (index) {
        // See Options->getThumbBoundsFn section of docs for more info
        var thumbnail = items[index].el,
          pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
          rect = thumbnail.getBoundingClientRect();

        return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
      },

      // addCaptionHTMLFn: function (item, captionEl, isFake) {
      //   if (!item.title) {
      //     captionEl.children[0].innerText = "";
      //     return false;
      //   }
      //   captionEl.children[0].innerHTML = item.title + "<br/><small>Photo: " + item.author + "</small>";
      //   return true;
      // },
    };

    if (fromURL) {
      if (options.galleryPIDs) {
        // parse real index when custom PIDs are used
        // https://photoswipe.com/documentation/faq.html#custom-pid-in-url
        for (var j = 0; j < items.length; j++) {
          if (items[j].pid == index) {
            options.index = j;
            break;
          }
        }
      } else {
        options.index = parseInt(index, 10) - 1;
      }
    } else {
      options.index = parseInt(index, 10);
    }

    // exit if index not found
    if (isNaN(options.index)) {
      return;
    }

    // options.mainClass = "pswp--minimal--dark";
    // options.barsSize = { top: 0, bottom: 0 };
    // options.captionEl = false;
    // options.fullscreenEl = false;
    // options.shareEl = false;
    // options.bgOpacity = 0.85;
    // options.tapToClose = true;
    // options.tapToToggleControls = false;

    if (disableAnimation) {
      options.showAnimationDuration = 0;
    }

    // Pass data to PhotoSwipe and initialize it
    gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

    // see: http://photoswipe.com/documentation/responsive-images.html
    var realViewportWidth,
      useLargeImages = false,
      firstResize = true,
      imageSrcWillChange;

    gallery.listen("beforeResize", function () {
      var dpiRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
      dpiRatio = Math.min(dpiRatio, 2.5);
      realViewportWidth = gallery.viewportSize.x * dpiRatio;

      if (realViewportWidth >= 1200 || (!gallery.likelyTouchDevice && realViewportWidth > 800) || screen.width > 1200) {
        if (!useLargeImages) {
          useLargeImages = true;
          imageSrcWillChange = true;
        }
      } else {
        if (useLargeImages) {
          useLargeImages = false;
          imageSrcWillChange = true;
        }
      }

      if (imageSrcWillChange && !firstResize) {
        gallery.invalidateCurrItems();
      }

      if (firstResize) {
        firstResize = false;
      }

      imageSrcWillChange = false;
    });
    gallery.listen("afterChange", () => {
      if (!!this.mainSlider && typeof this.mainSlider.goTo === "function") {
        this.mainSlider.goTo(gallery.getCurrentIndex());
      }
    });

    gallery.listen("gettingData", function (index, item) {
      item.src = item.o.src;
      item.w = item.o.w;
      item.h = item.o.h;
      // if (useLargeImages) {
      // } else {
      //   console.log(item);
      //   item.src = item.m.src;
      //   item.w = item.m.w;
      //   item.h = item.m.h;
      // }
    });

    gallery.init();
  };

  // galleryElement.addEvent("click", onThumbnailsClick);
  galleryElement.querySelectorAll("img").forEach((item) => {
    let isMoving = false;
    let startEvent = false;
    item.addEvent("mousedown", () => {
      startEvent = true;
    });

    item.addEvent("mouseup", (e) => {
      if (!isMoving) {
        onThumbnailsClick(e);
      }
      startEvent = false;
      isMoving = false;
    });
    item.addEvent("mousemove", (e) => {
      if (startEvent) {
        isMoving = true;
      }
    });
  });
  galleryElement.setAttribute("data-pswp-uid", 1);

  // select all gallery elements
  // var galleryElements = document.querySelectorAll(gallerySelector);

  // for (var i = 0, l = galleryElements.length; i < l; i++) {
  //   galleryElements[i].setAttribute("data-pswp-uid", i + 1);
  //   galleryElements[i].onclick = onThumbnailsClick;
  // }

  // var photoswipeParseHash = function () {
  //   var hash = window.location.hash.substring(1),
  //     params = {};

  //   if (hash.length < 5) {
  //     // pid=1
  //     return params;
  //   }

  //   var vars = hash.split("&");
  //   for (var i = 0; i < vars.length; i++) {
  //     if (!vars[i]) {
  //       continue;
  //     }
  //     var pair = vars[i].split("=");
  //     if (pair.length < 2) {
  //       continue;
  //     }
  //     params[pair[0]] = pair[1];
  //   }

  //   if (params.gid) {
  //     params.gid = parseInt(params.gid, 10);
  //   }

  //   return params;
  // };

  // // Parse URL and open gallery if it contains #&pid=3&gid=1
  // var hashData = photoswipeParseHash();
  // if (hashData.pid && hashData.gid) {
  //   openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
  // }
}
