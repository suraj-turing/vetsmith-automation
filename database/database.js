 import chalk from 'chalk';
import mysql from 'mysql';
 import config from '../config/database-config.js';

const {dbConfig} = config; 
const log = (message, params) => { console.log(chalk.green(message), params || ''); }


 var connection = mysql.createPool(dbConfig)
 
 connection.on('connection', async (db) => {
  log('Connection established to database', db);
 });
 
export default connection; 