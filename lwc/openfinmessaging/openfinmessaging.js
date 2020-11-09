import { LightningElement, track } from "lwc";
export default class Openfinmessaging extends LightningElement {
  @track message = "";

  finApi = null;
  finUUID = "";

  constructor() {
    super();
    window.addEventListener("openfin-api-response", e => {
      if (e.detail.fin !== undefined && e.detail.fin.length === 1) {
        this.finApi = e.detail.fin[0];
        this.finUUID = this.finApi.Application.getCurrentSync().identity.uuid;
      }
    });

    let apiRequest = new CustomEvent("openfin-api-request", {
      bubbles: false
    });

    window.dispatchEvent(apiRequest);
  }

  changeHandler(event) {
    this.message = event.target.value;

    if (this.finApi !== undefined && this.finApi !== null) {
      let outboxTopic = "/openfin/salesforce/outbox/" + this.finUUID;
      this.finApi.InterApplicationBus.publish(outboxTopic, {
        message: this.message,
        directApiCall: true
      }).catch(reason => {
        // eslint-disable-next-line no-console
        console.error(
          "Unable to publish a message to OpenFin messagebus: " + reason
        );
      });
    }
  }
}
