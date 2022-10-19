const CronJob = require("node-cron");

exports.initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule("* 30 * * * *", () => {
    console.log("Teste de job");
    // Add your custom logic here
  });

  scheduledJobFunction.start();
}