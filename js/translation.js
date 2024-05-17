function changeLanguage(lang) {
    loadJSON(lang);
}

function loadJSON(lang = 'it') {
    fetch('../translation.json')
        .then(response => response.json())
        .then(data => {
            const texts = data[lang].text;

            document.getElementById('title').textContent = texts.title;
            document.getElementById('autoUpdateButtonText').textContent = texts.autoUpdateButtonText;
            document.getElementById('layoutVertical').textContent = texts.layoutVertical;
            document.getElementById('layoutHorizontal').textContent = texts.layoutHorizontal;
            document.getElementById('switchDetailsTitle').textContent = texts.switchDetailsTitle.replace('{{switchId}}', switchId);
            document.getElementById('closeSwitchDetailsButton').textContent = texts.closeSwitchDetailsButton;
            document.getElementById('switchPortsTitle').textContent = texts.switchPortsTitle.replace('{{switchId}}', switchId);
            document.getElementById('portNumber').textContent = texts.portNumber;
            document.getElementById('name').textContent = texts.name;
            document.getElementById('macAddress').textContent = texts.macAddress;
            document.getElementById('flowTableTitle').textContent = texts.flowTableTitle.replace('{{switchId}}', switchId);
            document.getElementById('tableID').textContent = texts.tableID;
            document.getElementById('priority').textContent = texts.priority;
            document.getElementById('actions').textContent = texts.actions;
            document.getElementById('match').textContent = texts.match;
            document.getElementById('timeout').textContent = texts.timeout;
            document.getElementById('idle').textContent = texts.idle;
            document.getElementById('duration').textContent = texts.duration;
            document.getElementById('packetCount').textContent = texts.packetCount;
            document.getElementById('hostDetailsTitle').textContent = texts.hostDetailsTitle.replace('{{switchId}}', switchId);
            document.getElementById('closeHostDetailsButton').textContent = texts.closeHostDetailsButton;
            document.getElementById('connectedHostPortTitle').textContent = texts.connectedHostPortTitle;
        
    })
    .catch(error => console.error('Errore nel caricamento del file JSON:', error));
}

// Chiamata alla funzione al caricamento della pagina
window.onload = () => loadJSON('it');