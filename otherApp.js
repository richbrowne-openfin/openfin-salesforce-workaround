function setupApp() {
  let listenToMessagesButton = document.getElementById("listenToMessages");
  let sendMessageButton = document.getElementById("sendMessage");
  let messageToSend = document.getElementById("messageToSend");
  let receivedMessageDisplay = document.getElementById(
    "receivedMessageDisplay"
  );
  let receivedMessage = document.getElementById("receivedMessage");

  const salesForceAppId = "SalesForceGuide001";
  const outboxTopic = "/openfin/salesforce/outbox/" + salesForceAppId;
  const inboxTopic = "/openfin/salesforce/inbox/" + salesForceAppId;

  listenToMessagesButton.onclick = () => {
    receivedMessageDisplay.style.display = "block";

    window.fin.InterApplicationBus.subscribe(
      { uuid: salesForceAppId },
      outboxTopic,
      message => {
        console.log("Message recevieved on topic: " + outboxTopic);
        receivedMessage.value = JSON.stringify(message, undefined, 4);
      }
    )
      .then(() => console.info(`Subscribed to ${outboxTopic}`))
      .catch(err => console.error(`Error subscribing to ${outboxTopic}`, err));

    listenToMessagesButton.disabled = true;
  };

  sendMessageButton.onclick = () => {
    window.fin.InterApplicationBus.send(
      { uuid: salesForceAppId },
      inboxTopic,
      messageToSend.value
    ).catch(reason => {
      console.error(
        `Unable to publish message to application: ${salesForceAppId} on topic: ${inboxTopic}. Reason: ${reason}`
      );
    });
  };
}

setupApp();
