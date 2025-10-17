const express = require('express');
const index = express();
const port = 3000;

index.get ('/', (req, res) => {
    res.send("Rota principal funcionando");
});

index.listen(port, () => {
    console.log(`Servidor no Ar na porta ${port}`);
});