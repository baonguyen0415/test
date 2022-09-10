export class Popups {
  constructor() {
    this.list = {};
  }

  open(id) {
    this.list[id] && this.list[id].open();
  }

  close(id) {
    this.list[id] && this.list[id].close();
  }

  closeAll() {
    Object.keys(this.list).forEach((key) => this.list[key].close());
  }

  push(name, element) {
    this.list[name] = element;
  }

  get(name) {
    return this.list[name];
  }
}
