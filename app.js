import dotenv from 'dotenv';
import dbUtil from './utilities/dbUtil.js';
import tables from './constants/tables.js';
import { log, logError, logWarn } from "./utilities/logUtils.js";
import { getDataFromGoogleSheet } from './utilities/googleSheetUtil.js';
dotenv.config();


const run = async () => {
    log('Environment: ', process.env.ENV);
    log('Starting Vetsmith Automation ...');
    log(new Date());
    try {
        await startVetsmithAutomation();
    } catch (e) {
        logError('error in vetsmith automation - ', e);
    }
};

const startVetsmithAutomation = async () => {
    const newVetsmithDevelopers = await getNewVetsmithDevelopers();
    log('getNewVetsmithDevelopers:', newVetsmithDevelopers.length)
}

// challenge_id=375 came from `select step_acc_id from `turing-230020.raw.dv2_custom_flow_steps` where step='coding_challenge' and flow_id in (128, 130);`
const getNewVetsmithDevelopers = async () => {
    const devList = await getDataFromGoogleSheet(process.env.READ_SHEET_NAME_RANGE_USER)
    const countries = await getDataFromGoogleSheet(
      process.env.READ_SHEET_NAME_RANGE_COUNTRY, 'string'
    );
    if (!devList || !countries || !devList.length || !countries.length) {
        logWarn(`Unable to fetch devList or list of banned countries; Total devList = ${devList.length} ;  Total banned countries = ${countries.length}`);
        return
    }

    const getExcludedDevlopersList = () => {
      return "(" + devList.join(",") + ")";
    };

    const getStringifiedBannedCountriesList = () => {
      return "('" + countries.join("','") + "')";
    };

    const query = `
        select * from ${tables.DV2_CHALLENGE_SUBMIT} cs left join ${
      tables.DEVELOPER_DETAIL
    } dd 
            on cs.user_id=dd.user_id 
        where cs.user_id not in ${getExcludedDevlopersList()}
            and challenge_id=375 
            and total_score_by_cases>=12 
            and submit_time>='${process.env.LAST_REPORT_DATE}'
            and country_id not in (select id from ${
              tables.TPM_COUNTIES
            } where name in ${getStringifiedBannedCountriesList()})
    `;
    // log('query:', query);
    const developersArray = await dbUtil.executeSQL(query);
    return developersArray.map(dev => dev.user_id)
};

run().then(() => {
    log('All done!');
    process.exit();
});
