import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "./routes";
import { testConnection, ensurePesoColumn } from "./config/database";

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World");
});

app.use("/api", routes);

// Inicializar servidor e testar conexão com banco
app.listen(port, async () => {
    console.log(`Server rodando na porta: ${port}`);
    await testConnection();
    await ensurePesoColumn(); // Garantir que a coluna peso existe
});
