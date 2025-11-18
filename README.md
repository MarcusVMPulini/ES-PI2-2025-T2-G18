Nosso projeto se trata de um web site projetado para professores organizarem suas turmas, notas, e ate mesmo importar 
alunos, tudo isso a partir da instituição que eles lecionam, de maneira simplificada e intuitiva, realizando o login no 
site através de um e-mail e senha. O objetivo principal de nosso web site seria a integração com os sistemas 
institucionais, já que os outros apps usados com esse objetivo não atendem especificamente ao nicho de controle de 
notas, o NotaDez surge como solução para esse problema, o sistema permite lançar notas em atividades e provas e 
realizar o cálculo automático da nota final da disciplina. 

Nosso grupo é composto por: 
Marcus Vinícius Martins Pulini | RA: 25009605 
Arthur Valerio De Santi | RA: 25006924
Gabriel Rocca Padua dos Santos | RA: 25002330
Lucas Leonel | RA: 25015188

---------------------------------------------Utilização código------------------------------------------

1° passo-) Ao abrir o ambiente de teste, clonar o repositorio atraves do link: 
https://github.com/MarcusVMPulini/ES-PI2-2025-T2-G18.git ou entrar na parte CODE e copiar o link em https.

2° passo-) Baixar as dependencias do node e arquivo .env para rodar o servidor, abra o cmd e use o comando "cd backend", depois use o comando "npm install" caso n faça o download automatico das dependecias, use o comando "npm install express, 
dotenv, mysql2, bcrypt, jsonwebtoken, cors, body-parser""

3° passo) Ainda dentro da pasta backend crie um arquivo .env e cole os seguintes dados: 
DB_HOST=shinkansen.proxy.rlwy.net

DB_PORT=20092

DB_USER=root

DB_PASSWORD=FiTvUPAVsGlZombLphMoeATOpdQYneDr

DB_NAME=notadez1

JWT_SECRET=segredo_super_secreto

4° passo) Dentro do cmd utilize o comando “npm run dev” para inicializar o servidor 

5° passo-) Abrir o arquivo index.html, localizando dentro da pasta P.I -> Front-End e usar a extensao live server para rodar a pagina

