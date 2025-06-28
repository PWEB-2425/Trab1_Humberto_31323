const express = require('express');
const fs = require('fs'); // Módulo para leitura de arquivos

const app = express();
const PORT = 3000;

app.get("/nomes", (req, res) => {
    fs.readFile('bd.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ erro: "Erro ao ler o arquivo" });
            return;
        }

        const jsonData = JSON.parse(data); // Converte o conteúdo do arquivo em objeto JS
        res.json(jsonData.nomes); // Retorna apenas o array de nomes
    });
});

app.listen(PORT, () => {
    console.log("Servidor na Porta: " + PORT);
});
