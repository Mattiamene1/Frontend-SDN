const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios').default;

// Imposta la porta su 3000
const PORT = process.env.PORT || 80;

// Definisci una directory statica per servire il file HTML
app.use(express.static(path.join(__dirname)));

// Gestisci richieste GET sulla radice (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Aggiungi una route per ottenere dati dal processo backend
app.get('/getHostsData', async (req, res) => {
    try {
      const response = await axios.get('http://127.0.0.1:80/hosts');
      const data = response.data;
      res.json({ hostsData: data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Errore nel recupero dei dati' });
    }
  });

// Avvia il server sulla porta 5500
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
