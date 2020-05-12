import * as winston from 'winston';
import * as Airbrake from '@airbrake/node';
// import * as wairbreake from 'winston-airbrake';

const options = {
  "apiKey": process.env.AIRBRAKE_API_KEY,
  "projectId": Number(process.env.AIRBRAKE_PROJECT_ID),
};
new Airbrake.Notifier({
  projectId: options.projectId || 0,
  projectKey: options.apiKey || '',
  environment: 'production'
});
// winston.add(Console);
// winston.add(wairbreake.Airbrake, options);

export default winston;
