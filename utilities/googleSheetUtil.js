import { google } from "googleapis";
import { log, logError } from "./logUtils.js";


const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_KEYFILE_NAME, //the key file
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

const authClientObject = await auth.getClient();
const googleSheetsInstance = google.sheets({
  version: "v4",
  auth: authClientObject,
});

export const getDataFromGoogleSheet = async (sheetNameRange, type='number') => {
  const sheetId = process.env.READ_SHEET_ID;
  const readData = await googleSheetsInstance.spreadsheets.values
    .get({
      auth, //auth object
      spreadsheetId: sheetId, // spreadsheet id
      range: sheetNameRange, //range of cells to read from.
    })
    .catch((err) => {
      logError(
        `[getDataFromGoogleSheet]: Error fetching data from googlesheet -  sheetId=${sheetId}; sheetRangeName=${sheetNameRange} ===> ${err}`
      );
    });
    if (readData && readData.data && readData.data.values) {
      readData.data.values = readData.data.values.map((c) => type === 'number' ? parseInt(c[0], 10): c[0]);
      return readData.data.values;
    }
    return [];
};

export const writeFileToGoogleSheet = async (sheetNameRange="Sheet1!A:B", data) => {
  const sheetId = process.env.READ_SHEET_ID;
  await googleSheetsInstance.spreadsheets.values.append({
    auth, //auth object
    spreadsheetId: sheetId, //spreadsheet id
    range: sheetNameRange, //sheet name and range of cells
    valueInputOption: "USER_ENTERED", // The information will be passed according to what the usere passes in as date, number or text
    resource: {
      values: data, // Array of Arrays [[A,B],[C,D]]
    },
  }).then(() => {
    log(`[writeFileToGoogleSheet]: Data successfully written to google sheet id=${sheetId}`);
  }).catch((err) => {
      logError(
        `[writeFileToGoogleSheet]: Error writing data from google sheet -  sheetId=${sheetId}; sheetRangeName=${sheetNameRange} ===> ${err}`
      );
  });
  return;
}
