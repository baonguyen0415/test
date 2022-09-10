export class Cart {
  constructor() {
    this.settings = { ...theme.settings.cart };
    this.get();
  }

  addMutiple(items) {
    return fetch(theme.routes.cartAdd, {
      method: "post",
      headers: new Headers({ "Content-type": "application/json" }),
      body: JSON.stringify({ items: [...items] }),
      dataType: "json",
    })
      .then((data) => {
        return this.get().then(async () => {
          let { items } = data;
          if (this.settings.type === "drawer") {
            if (!this.drawer) {
              return data;
            }
            if (this.drawer.isLoaded) {
              document.dispatchEvent(new CustomEvent("cart-add", { detail: data }));

              this.get().then((res) => document.dispatchEvent(new CustomEvent("cart-change", { detail: res })));
            } else {
              await this.drawer.load();
            }
            return data;
          }
        });
      })
      .catch((res) => {
        res.then((data) => {
          if (!!this.drawer && this.drawer.isOpen) {
            this.drawer.close();
            alert(data.description);
          } else {
            alert(data.description);
          }
        });
        return res;
      });
  }

  add(form) {
    let formData = new FormData(form);
    if (theme.template == "cart") {
      formData.append("sections", "cart-template");
      formData.append("sections_url", theme.routes.searchUrl);
    } else {
      formData.append("sections", "ajax-cart");
    }
    return fetch(theme.routes.cartAdd, {
      method: "post",
      headers: new Headers({ "X-Requested-With": "XMLHttpRequest" }),
      body: formData,
      dataType: "json",
    }).then((data) => {
      document.dispatchEvent(new CustomEvent("cart-add", { detail: data }));

      this.get().then((res) => document.dispatchEvent(new CustomEvent("cart-change", { detail: res })));
    });
  }

  get() {
    return fetch(theme.routes.cartGet, { dataType: "json" }).then((res) => Object.assign(this, res));
  }

  clear() {
    return fetch(theme.routes.cartClear, { dataType: "json" }).then((res) => {
      this.value = res;
      return res;
    });
  }

  change(key, quantity) {
    return fetch(theme.routes.cartChange, {
      method: "post",
      body: JSON.stringify({ id: key, quantity }),
      headers: { "Content-Type": "application/json" },
      dataType: "json",
    }).then((res) => {
      this.value = res;
      return res;
    });
  }

  remove(key) {
    return fetch(theme.routes.cartChange, {
      method: "post",
      headers: new Headers({ "Content-Type": "application/json" }),
      dataType: "json",
      body: JSON.stringify({ id: key, quantity: 0 }),
    }).then((res) => {
      this.value = res;
      document.dispatchEvent(new CustomEvent("cart-change", { detail: res }));
      return res;
    });
  }
}
