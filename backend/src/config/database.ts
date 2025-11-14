import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Configuração da conexão MySQL
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "notadez",
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
