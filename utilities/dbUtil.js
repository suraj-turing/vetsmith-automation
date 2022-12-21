import mysql from 'mysql';
import config from '../config/database-config.js';
const {dbConfig} = config;
const pool = mysql.createPool(dbConfig);

const executeSQL = async function (sqlstr, params) {
  var promise = new Promise(function (resolve, reject) {

    pool.getConnection(function (error, mysqlConnection) {
      if (error) {
        console.log('error in getConnec - ', error)
        reject(error);
        return;
      }

      mysqlConnection.query(sqlstr, params, function (error, allRows) {
        mysqlConnection.release();
        if (error) {
          console.log('error in querying - ', error)
          reject(error);
        } else resolve(allRows);
      });
    });
  });

  return promise;
};

const commonQuery = async function (spName, params, res, gotCount, errorMessage) {
  var sqlstr = `CALL ${spName}(`;
  for (let i = 0; i < params.length; i++) {
    sqlstr += (i === 0 ? '?' : ',?');
  }
  sqlstr += ');';

  /* Beware: If there is count value in the SP, it must be the second result set and name as total */
  await executeSQL(sqlstr, params)
    .then(function (result) {
      console.log('commonQuery:', sqlstr, params);
      if (result && result.length > 0) {
        res.json({
          success: true,
          result: result[0],
          count: ((gotCount && result.length > 1) ? result[1][0].total : 0)
        });
      } else if (result && result.affectedRows > 0) { // check if this is an update that returns no row
        res.json({ success: true });
      } else res.status(codes.BAD_REQUEST).json({ success: false, errorMessage: errorMessage || codes.BAD_REQUEST });
    })
    .catch(function (error) {
      console.log('commonQuery:', sqlstr, error);
      res.status(codes.INTERNAL_SERVER_ERROR).json({ success: false, errorMessage: 'Error' });
      throw error; // Necessary to track server error in sentry
    });
};

const commonQueryRows = async function (spName, params) {
  var sqlstr = `CALL ${spName}(`;
  for (let i = 0; i < params.length; i++) {
    sqlstr += (i === 0 ? '?' : ',?');
  }
  sqlstr += ');';
  let finalResult;

  await executeSQL(sqlstr, params)
    .then(function (result) {
      console.log('commonQueryRows:', sqlstr, params);

      if (result && result.length > 0) {
        finalResult = result;
      }
    })
    .catch(function (error) {
      console.log('commonQueryRows:', sqlstr, error);
      throw error;
    });

  return finalResult;
};

export default {
  executeSQL, commonQuery, commonQueryRows
}