(function(host) {
  if (host !== host.top) {
    return;
  }
  const salesforcefin = host.fin;
  const uuid = salesforcefin.Application.getCurrentSync().identity.uuid;
  const inboxTopic = "/openfin/salesforce/inbox/" + uuid;
  const outboxTopic = "/openfin/salesforce/outbox/" + uuid;

  function inbox(message) {
    console.log("Message recevieved on topic: " + inboxTopic);
    let incomingMessage = new CustomEvent("openfin-inbox", {
      bubbles: true,
      detail: {
        message: message
      }
    });

    host.dispatchEvent(incomingMessage);
  }

  function setupInbox() {
    salesforcefin.InterApplicationBus.subscribe(
      { uuid: "*" },
      inboxTopic,
      inbox
    )
      .then(() => console.info(`Subscribed to ${inboxTopic}`))
      .catch(err => console.error(`Error subscribing to ${inboxTopic}`, err));
  }

  function outbox(outgoingMessage) {
    if (outgoingMessage.detail.uuid !== undefined) {
      salesforcefin.InterApplicationBus.send(
        { uuid: outgoingMessage.detail.uuid },
        outboxTopic,
        outgoingMessage.detail.message
      ).catch(reason => {
        console.error(
          `Unable to publish message to application: ${
            outgoingMessage.detail.uuid
          } on topic: ${outboxTopic}. Reason: ${reason}`
        );
      });
    } else {
      salesforcefin.InterApplicationBus.publish(
        outboxTopic,
        outgoingMessage.detail.message
      )
        .then(() => {
          console.info(`Published message to topic ${outboxTopic}`);
        })
        .catch(err => {
          console.error(`Error publishing to topic ${outboxTopic}`, err);
        });
    }
  }

  function setupOutbox() {
    console.log("Listening for openfin outbox requests.");
    host.addEventListener("openfin-outbox", outbox.bind(this));
  }

  function sendApi(e) {
    let wrappedApi = new CustomEvent("openfin-api-response", {
      bubbles: true,
      detail: {
        fin: [salesforcefin]
      }
    });
    host.dispatchEvent(wrappedApi);
  }

  function setupApi() {
    console.log("Listening for api requests.");
    host.addEventListener("openfin-api-request", sendApi.bind(this));
  }

  function setupUnsubscribe() {
    host.addEventListener("beforeunload", function(event) {
      console.log("Unsubscribing from API request listener");
      host.removeEventListener("openfin-api-request", sendApi);
      console.log("Unsubscribing from outbox listener");
      host.removeEventListener("openfin-outbox", outbox);
      console.log("Unsubscribing from subscription: " + inboxTopic);
      salesforcefin.InterApplicationBus.unsubscribe(
        { uuid: "*" },
        inboxTopic,
        inbox
      )
        .then(result => {
          console.log(`Unsubscribe request for topic: ${inboxTopic} sent.`);
        })
        .catch(reason => {
          console.log(
            `Unable to unsubscribe from topic: ${inboxTopic} for the following reason: ${reason}`
          );
        });
    });
  }

  function setupStyles() {
    salesforcefin.Window.getCurrentSync().updateOptions({ frame: false });
    debugger;

    host.addEventListener("DOMContentLoaded", function() {
      let styleOverrides = host.document.createElement("style");

      styleOverrides.innerHTML =
        host.location.pathname === "/"
          ? `
        /* OpenFin - Login Window Style Overrides */

        #content {
          -webkit-app-region: no-drag;
        }

        #left {
          -webkit-app-region: drag;
        }
        `
          : !host.location.search.includes("windowed=true")
          ? `
        /* OpenFin - Main Window Style Overrides */

        .slds-global-header__logo {
          -webkit-app-region: drag;
        }
        `
          : `
        /* OpenFin - Popout Window Style Overrides */

        .slds-col--bump-left {
          -webkit-app-region: no-drag;
        }

        .slds-utility-panel__header {
          -webkit-app-region: drag;
        }
        `;

      host.document.head.appendChild(styleOverrides);
    });
  }

  function init() {
    salesforcefin.desktop.main(() => {
      setupOutbox();
      setupInbox();
      setupApi();
      setupUnsubscribe();
    });
    setupStyles();
  }

  init();
})(window);
