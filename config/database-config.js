import dotenv from 'dotenv';
dotenv.config()

const dbConfig = {
  connectionLimit: 30,
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  multipleStatements: true
}

export default { dbConfig };