// Replace with your folder ID
const FOLDER_ID = 'YOUR_FOLDER_ID_HERE';

// Replace with your email address
const EMAIL_ADDRESS = 'YOUR_EMAIL_ADDRESS_HERE';

// OAuth2 credentials (from Google Cloud Console)
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';

// Property key for storing the last run timestamp
const LAST_RUN_KEY = 'lastRunTimestamp';

// Initialize OAuth2 library
function getOAuthService() {
  return OAuth2.createService('google')
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    .setClientId(CLIENT_ID)
    .setClientSecret(CLIENT_SECRET)
    .setScope('https://www.googleapis.com/auth/drive.activity.readonly https://www.googleapis.com/auth/gmail.send')
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties());
}

// Handle OAuth2 callback
function authCallback(request) {
  const service = getOAuthService();
  const authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Authorization successful!');
  } else {
    return HtmlService.createHtmlOutput('Authorization failed.');
  }
}

// Authorize the script
function authorize() {
  const service = getOAuthService();
  if (!service.hasAccess()) {
    const authorizationUrl = service.getAuthorizationUrl();
    Logger.log(`Open the following URL to authorize the script:\n${authorizationUrl}`);
  } else {
    Logger.log('Script is already authorized.');
  }
}

// Track changes in Google Slides files
function trackDriveActivity() {
  const service = getOAuthService();
  if (!service.hasAccess()) {
    Logger.log('Script is not authorized. Run the authorize() function first.');
    return;
  }

  // Get the last run timestamp
  const properties = PropertiesService.getUserProperties();
  const lastRunTimestamp = properties.getProperty(LAST_RUN_KEY);

  // If this is the first run, set the last run timestamp and exit
  if (!lastRunTimestamp) {
    const currentTimestamp = new Date().toISOString();
    properties.setProperty(LAST_RUN_KEY, currentTimestamp);
    Logger.log(`First run detected. Last run timestamp set to: ${currentTimestamp}`);
    return;
  }

  // Fetch all Google Slides files in the folder
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFilesByType(MimeType.GOOGLE_SLIDES);

  // Collect changes
  const changes = [];

  while (files.hasNext()) {
    const file = files.next();
    const fileId = file.getId();
    const fileName = file.getName();
    const fileUrl = file.getUrl();

    // Fetch activity for the file
    const url = `https://driveactivity.googleapis.com/v2/activity:query`;
    const payload = {
      ancestorName: `items/${fileId}`,
      filter: `time >= "${lastRunTimestamp}"`
    };
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: `Bearer ${service.getAccessToken()}`
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true // To see the full error response
    };

    try {
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();

      if (responseCode === 200) {
        const activity = JSON.parse(responseText);

        // Log the full activity response for debugging
        Logger.log(`Activity response for ${fileName}: ${JSON.stringify(activity)}`);

        // Process the activity
        if (activity.activities && activity.activities.length > 0) {
          for (const activityItem of activity.activities) {
            const action = activityItem.primaryActionDetail;

            // Check if the activity is an "edit"
            if (action && action.edit) {
              // Add the file to the changes list
              changes.push({ name: fileName, url: fileUrl });
              Logger.log(`Edit detected in ${fileName} at ${activityItem.timestamp}`);
              break; // Stop after the first edit activity
            }
          }
        } else {
          Logger.log(`No activities found for ${fileName}.`);
        }
      } else {
        Logger.log(`Error fetching activity for ${fileName}. Response code: ${responseCode}, Response: ${responseText}`);
      }
    } catch (e) {
      Logger.log(`Error processing file ${fileName}: ${e.toString()}`);
    }
  }

  // Update the last run timestamp
  const currentTimestamp = new Date().toISOString();
  properties.setProperty(LAST_RUN_KEY, currentTimestamp);
  Logger.log(`Last run timestamp updated to: ${currentTimestamp}`);

  // Send a single email with all changes
  if (changes.length > 0) {
    sendSummaryEmail(changes);
  } else {
    Logger.log('No changes detected since the last run.');
  }
}

// Send a single email summarizing all changes
function sendSummaryEmail(changes) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const folderName = folder.getName(); // Get the name of the Google Drive folder
  const numChanges = changes.length; // Number of files changed

  // Update the email subject
  const subject = `${numChanges} file(s) changed in folder "${folderName}"`;

  // Build the email body
  let body = 'The following files were changed since the last run:\n\n';

  // Add each file's name and URL in the format "문서이름(링크)"
  for (const change of changes) {
    body += `- ${change.name}(${change.url})\n`; // Format: 문서이름(링크)
  }

  // Send the email
  GmailApp.sendEmail(EMAIL_ADDRESS, subject, body);
}
