import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Configuração da conexão MySQL
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "notadez1",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Pool de conexões
let pool: mysql.Pool | null = null;

export const getPool = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log("Pool de conexões MySQL criado");
  }
  return pool;
};

// Função para testar a conexão
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await getPool().getConnection();
    console.log("Conexão com MySQL estabelecida com sucesso!");
    connection.release();
    return true;
  } catch (error) {
    console.error("Erro ao conectar com MySQL:", error);
    return false;
  }
};

// Função para executar queries
export const query = async <T = any>(
  sql: string,
  params?: any[]
): Promise<T> => {
  try {
    const [results] = await getPool().execute(sql, params);
    return results as T;
  } catch (error) {
    console.error("Erro ao executar query:", error);
    throw error;
  }
};

// Função para fechar o pool (útil para testes ou shutdown)
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("Pool de conexões MySQL fechado");
  }
};

// Função para verificar e criar coluna peso se não existir
export const ensurePesoColumn = async (): Promise<void> => {
  try {
    // Primeiro verificar se a tabela existe
    const tables = await query<any[]>(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'componentes_nota'`,
      [dbConfig.database]
    );

    if (tables.length === 0) {
      console.log("Tabela 'componentes_nota' não encontrada. Pulando criação da coluna peso.");
      return;
    }

    // Verificar se a coluna existe
    const columns = await query<any[]>(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'componentes_nota' 
       AND COLUMN_NAME = 'peso'`,
      [dbConfig.database]
    );

    if (columns.length === 0) {
      // Coluna não existe, criar
      console.log("Coluna 'peso' não encontrada. Criando...");
      await query(
        `ALTER TABLE componentes_nota 
         ADD COLUMN peso DECIMAL(5,2) NULL 
         COMMENT "Percentual que o componente vale na nota final (0-100)"`
      );
      console.log("Coluna 'peso' criada com sucesso!");
    } else {
      console.log("Coluna 'peso' já existe na tabela componentes_nota");
    }
  } catch (error: any) {
    console.error("Erro ao verificar/criar coluna peso:", error.message);
    // Não lançar erro para não impedir o servidor de iniciar
  }
};