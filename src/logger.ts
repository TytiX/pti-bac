require('dotenv').config()
import * as winston from 'winston';
import * as Airbrake from '@airbrake/node';

import * as fs from 'fs';

const prevObject = {
  type: process.env.GOOGLE_ACCOUNT_TYPE,
  project_id: process.env.GOOGLE_ACCOUNT_PROJECT_ID,
  private_key_id: process.env.GOOGLE_ACCOUNT_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  client_email: process.env.GOOGLE_ACCOUNT_CLIENT_EMAIL || '',
  client_id: process.env.GOOGLE_ACCOUNT_CLIENT_ID,
  auth_uri: process.env.GOOGLE_ACCOUNT_AUTH_URI,
  token_uri: process.env.GOOGLE_ACCOUNT_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_ACCOUNT_CLIENT_X509_CERT_URL
};
// create credential file
fs.writeFileSync('./credentials.json', JSON.stringify(prevObject, null, 2));

// Imports the Google Cloud client library for Winston
import { LoggingWinston } from '@google-cloud/logging-winston';

const loggingWinston = new LoggingWinston({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: './credentials.json',
});
// Create a Winston logger that streams to Stackdriver Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    // Add Stackdriver Logging
    loggingWinston,
  ],
});

const options = {
  "apiKey": process.env.AIRBRAKE_API_KEY,
  "projectId": Number(process.env.AIRBRAKE_PROJECT_ID),
};
if (options.apiKey) {
  new Airbrake.Notifier({
    projectId: options.projectId || 0,
    projectKey: options.apiKey || '',
    environment: 'production'
  });
}

export default logger;
