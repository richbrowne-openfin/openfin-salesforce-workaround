import { LightningElement, track } from "lwc";

export default class Sendopenfinmessage extends LightningElement {
  @track message = "";

  changeHandler(event) {
    this.message = event.target.value;

    window.dispatchEvent(
      new CustomEvent("openfin-outbox", {
        bubbles: false,
        detail: { message: this.message }
      })
    );
  }
}
