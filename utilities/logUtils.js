import chalk from "chalk";
export const logError = (message, params) => {
  console.log(chalk.red(message), params || "");
};
export const logWarn = (message, params) => {
  console.log(chalk.yellow(message), params || "");
};
export const log = (message, params) => {
  console.log(chalk.green(message), params || "");
};

