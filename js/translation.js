function loadJSON(lang = "it",, switchId = null, hostId = null) {
  fetch("../translation.json")
    .then((response) => response.json())
    .then((data) => {
      const texts = data[lang].text;

      const app = Vue.createApp({
        data() {
          return {
            autoUpdateButtonTextStart: texts.autoUpdateButtonTextStart,
            autoUpdateButtonTextStop: texts.autoUpdateButtonTextStop,
            layoutVertical: texts.layoutVertical,
            layoutHorizontal: texts.layoutHorizontal,
            switchDetailsTitle: texts.switchDetailsTitle.replace("{{switchId}}", this.switchId),
            closeSwitchDetailsButton: texts.closeSwitchDetailsButton,
            switchPortsTitle: texts.switchPortsTitle.replace("{{switchId}}", this.switchId),
            portNumber: texts.portNumber,
            name: texts.name,
            macAddress: texts.macAddress,
            flowTableTitle: texts.flowTableTitle.replace("{{switchId}}", this.switchId),
            tableID: texts.tableID,
            priority: texts.priority,
            actions: texts.actions,
            match: texts.match,
            timeout: texts.timeout,
            idle: texts.idle,
            hard: texts.hard,
            duration: texts.duration,
            packetCount: texts.packetCount,
            hostDetailsTitle: texts.hostDetailsTitle.replace("{{hostId}}", this.hostId),
            closeHostDetailsButton: texts.closeHostDetailsButton,
            connectedHostPortTitle: texts.connectedHostPortTitle,
            updateFrequencyLabel: texts.updateFrequencyLabel,
            switchId,
            hostId,
          };
        }
      }).mount("#app");

      document.getElementById("title").textContent = texts.title;
    })
    .catch((error) =>
      console.error("Errore nel caricamento del file JSON:", error)
    );
}

window.onload = () => loadJSON("it");