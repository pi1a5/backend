/* eslint-disable linebreak-style */
/* eslint-disable no-console */

const CronJob = require('node-cron');

exports.initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule('* * 1 * * *', () => {
    console.log('Teste de job');
    // Add your custom logic here
  });

  scheduledJobFunction.start();
};
