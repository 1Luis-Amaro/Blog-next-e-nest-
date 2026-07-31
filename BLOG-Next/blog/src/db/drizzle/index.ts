import { drizzle } from "drizzle-orm/better-sqlite3";  // Importa a função drizzle para usar o ORM com SQLite
import { postsTable } from "./schemas";               // Importa o schema da tabela 'posts'
import Database from "better-sqlite3";                // Importa o driver SQLite para Node.js
import { resolve } from "path";                       // Importa função para montar caminhos de arquivo

// Monta o caminho absoluto do arquivo do banco de dados (db.sqlite3)
const sqliteDatabasePatch = resolve(process.cwd(), 'db.sqlite3')

// Cria (ou abre) o arquivo SQLite localizado no caminho acima
const sqliteDatabase = new Database(sqliteDatabasePatch)

// Configura o Drizzle ORM com a conexão e o schema
export const drizzleDb = drizzle(sqliteDatabase, {
  schema: {
    posts: postsTable   // Registra a tabela 'posts' para uso no ORM
  },
  logger: false,         // Mostra no console as queries SQL executadas
})
