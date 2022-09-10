import { StoreLocation } from "./common/model/store-location";

register("store-location", {
  onLoad() {
    new StoreLocation(this.container, "map");
  },
});

load("store-location");
console.log("store-location-page.js loaded");
