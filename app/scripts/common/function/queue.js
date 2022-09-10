export class Queue {
  constructor() {
    this.queue = [];
    this.running = false;
  }

  add(promise, callback) {
    this.queue.push([promise, callback]);
    if (!this.running) {
      this.next();
    }
  }

  next() {
    this.running = false;
    if (this.test) {
      return;
    }
    let [promise, callback] = this.queue.shift() || [undefined, undefined];
    if (!promise) {
      return;
    }
    if (typeof promise.then === "function") {
      this.running = true;
      return promise.then((data) => {
        !!callback && callback(data);
        this.next();
        return data;
      });
    } else {
      this.running = true;
      return new Promise((res, rej) => res(promise)).then((data) => {
        !!callback && callback(data);
        this.next();
        return data;
      });
    }
  }
}
