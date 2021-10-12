/* eslint-disable @typescript-eslint/no-var-requires */

const { exec } = require('child_process');
const chalk = require('chalk');

const isPostgresReadyCommand =
  'docker exec -i stubby-integration-tests pg_isready';

let maxAttempts = 5;
let attempts = 0;

const checkTheConnection = () => {
  exec(isPostgresReadyCommand, (err) => {
    attempts++;

    if (err) {
      if (attempts <= maxAttempts) {
        console.log(chalk.yellow('Failed to connect! Trying again ...'));

        setTimeout(() => {
          checkTheConnection();
        }, 1000);

        exec(isPostgresReadyCommand);
      } else {
        console.log(
          chalk.red('Failed to connect! Check your connection state.'),
        );
      }
    } else {
      console.log(chalk.green('Successfully connected!'));
    }
  });
};

checkTheConnection();
