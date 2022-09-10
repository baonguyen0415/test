export class CollapsePanel extends HTMLElement {
  constructor() {
    super();
    this.elms = {
      triggerElement: this.querySelector("collapse-panel-header"),
      expansionElement: this.querySelector("collapse-panel-content"),
    };
    this.initEvent();
    this.initContentObserverEventHandler();
  }

  initEvent() {
    let { triggerElement, expansionElement } = this.elms;
    if (this.hasAttribute("open")) {
      expansionElement.css("height", expansionElement.firstElementChild.offsetHeight + "px");
    }
    triggerElement.addEvent("click", () => {
      if (this.hasAttribute("open")) {
        this.close();
      } else {
        this.open();
      }
    });
  }

  open() {
    let { expansionElement } = this.elms;
    this.setAttribute("open", "");
    let height = expansionElement.firstElementChild.offsetHeight;
    expansionElement.css("height", height + "px");
  }

  close() {
    let { expansionElement } = this.elms;
    this.removeAttribute("open");
    expansionElement.css("height", "");
  }

  initContentObserverEventHandler() {
    let { expansionElement } = this.elms;

    let observer = new MutationObserver(this.open.bind(this));

    observer.observe(expansionElement, { childList: true, subtree: true });

    window.addEvent("resize", this.open.bind(this));
  }
}
