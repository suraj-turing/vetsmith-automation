import { google } from 'googleapis';
import chalk from 'chalk';

const log = (message, params) => { console.log(chalk.green(message), params || ''); }

const auth = new google.auth.GoogleAuth({
    keyFile: "keys.json", //the key file
    scopes: "https://www.googleapis.com/auth/spreadsheets", 
});

const authClientObject = await auth.getClient();
const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });
const spreadsheetId = "1SiFwST6DAzUVrEqWof64oia0rXyodMLGzu36mrqTkuc";
// const spreadsheetId = "1KqTEqpaM9OQqOqPs_ReNrCO3yqbt_c1CUJC96-DAcR0";

// write
// await googleSheetsInstance.spreadsheets.values.append({
//     auth, //auth object
//     spreadsheetId, //spreadsheet id
//     range: "Sheet1!A:B", //sheet name and range of cells
//     valueInputOption: "USER_ENTERED", // The information will be passed according to what the usere passes in as date, number or text
//     resource: {
//         values: [["Peter testing", "Peter Adeoye"]],
//     },
// });

// read
const readData = await googleSheetsInstance.spreadsheets.values.get({
  auth, //auth object
  spreadsheetId, // spreadsheet id
  range: "Exclude list!A2:B", //range of cells to read from.
});
const data = readData.data.values.map(c => c[0])

log("readData", data);
