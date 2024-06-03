function changeLanguage(lang) {
    loadJSON(lang);
  }
  function changeLanguage(lang) {
    app.loadTranslation(lang);
  }
  
  
  function loadJSON(lang = "it") {
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
              switchDetailsTitle: texts.switchDetailsTitle.replace("{{switchId}}", switchId),
              closeSwitchDetailsButton: texts.closeSwitchDetailsButton,
              switchPortsTitle: texts.switchPortsTitle.replace("{{switchId}}", switchId),
              portNumber: texts.portNumber,
              name: texts.name,
              macAddress: texts.macAddress,
              flowTableTitle: texts.flowTableTitle.replace("{{switchId}}", switchId),
              tableID: texts.tableID,
              priority: texts.priority,
              actions: texts.actions,
              match: texts.match,
              timeout: texts.timeout,
              idle: texts.idle,
              hard: texts.hard,
              duration: texts.duration,
              packetCount: texts.packetCount,
              hostDetailsTitle: texts.hostDetailsTitle.replace("{{switchId}}", switchId),
              closeHostDetailsButton: texts.closeHostDetailsButton,
              connectedHostPortTitle: texts.connectedHostPortTitle,
              updateFrequencyLabel: texts.updateFrequencyLabel:
              switchId: 1, // Assumiamo che switchId e hostId siano valori già definiti
              hostId: 1
            };
          }
        }).mount("#app");
  
        document.getElementById("title").textContent = texts.title;
      })
      .catch((error) =>
        console.error("Errore nel caricamento del file JSON:", error)
      );
  }
  
  // Chiamata alla funzione al caricamento della pagina
  window.onload = () => loadJSON("it");
  