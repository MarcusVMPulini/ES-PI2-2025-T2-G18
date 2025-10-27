import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.json());


app.get("/", (req: Request, res: Response) => {
    res.send("Hello World");
});

//Definir as rotas
/*app.get("/estudantes", async (req: Request, res: Response) => {
    try {
        const estudantes = await getAllEstudantes();
        res.json(estudantes);
    } catch (error) {
        console.error("Erro ao buscar estudantes:", error);
        res.status(500).json({ error: "Erro ao buscar estudantes" });
    }
});
*/

app.listen(port, () => {
    console.log(`Server rodando na porta: ${port}`);
});
