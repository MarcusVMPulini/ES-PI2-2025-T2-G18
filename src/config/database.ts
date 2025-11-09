// src/config/database.ts
export class Database {
    private static instance: Database;
    private data: Record<string, any[]> = {};
  
    private constructor() {
      this.data = {
        instituicoes: [],
        cursos: [],
        disciplinas: [],
        turmas: [],
        alunos: [],
      };
    }
  
    public static getInstance(): Database {
      if (!Database.instance) {
        Database.instance = new Database();
      }
      return Database.instance;
    }
  
    public getTable(name: string) {
      if (!this.data[name]) this.data[name] = [];
      return this.data[name];
    }
  
    public setTable(name: string, value: any[]) {
      this.data[name] = value;
    }
  }
  