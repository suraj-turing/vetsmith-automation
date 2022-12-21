import chalk from 'chalk';
import dotenv from 'dotenv';
import dbUtil from './utilities/dbUtil.js';
import tables from './constants/tables.js';
import { banned_countries_list } from './constants/banned-countries.js';
import { excluded_developers_list } from './constants/excluded-developers-list.js';
import { last_report_date } from './constants/last-report-date.js';

dotenv.config();

const logError = (message, params) => { console.log(chalk.red(message), params || ''); }
const logWarn = (message, params) => { console.log(chalk.yellow(message), params || ''); }
const log = (message, params) => { console.log(chalk.green(message), params || ''); }


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
    const query = `
        select * from ${tables.DV2_CHALLENGE_SUBMIT} cs left join ${tables.DEVELOPER_DETAIL} dd 
            on cs.user_id=dd.user_id 
        where cs.user_id not in ${getExcludedDevlopersList()}
            and challenge_id=375 
            and total_score_by_cases>=12 
            and submit_time>='${last_report_date}'
            and country_id not in (select id from ${tables.TPM_COUNTIES} where name in ${getStringifiedBannedCountriesList()})
    `;
    log('query:', query);
    const developersArray = await dbUtil.executeSQL(query);
    return developersArray.map(dev => dev.user_id)
};

const getExcludedDevlopersList = () => {
    return "("+excluded_developers_list.join(",")+")";
}

const getStringifiedBannedCountriesList = () => {
    return "('"+banned_countries_list.join("','")+"')";
}

run().then(() => {
    log('All done!');
    process.exit();
});
