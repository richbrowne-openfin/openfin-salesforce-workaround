import { LightningElement, track } from "lwc";

export default class Receiveopenfinmessage extends LightningElement {
  @track message = "";

  constructor() {
    super();
    window.addEventListener("openfin-inbox", e => {
      if (e.detail.message !== undefined) {
        this.message = e.detail.message;
      }
    });
  }
}
