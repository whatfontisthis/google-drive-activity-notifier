# Google Drive Activity Tracker

I collaborate with a team on shared documents stored in Google Drive. To stay updated on changes, I created this script to automatically notify me whenever edits are made.

This script tracks changes to Google Slides files in a specified Google Drive folder and sends an email summary of the modifications. It leverages Google Apps Script and the Google Drive Activity API to monitor activity and provide timely updates.

## Prerequisites

1. **Google Account**: You need a Google account to use Google Apps Script and Google Drive.
2. **Google Cloud Project**: You need to create a Google Cloud Project to enable the required APIs and get OAuth2 credentials.
3. **Google Drive Folder**: You need a Google Drive folder containing Google Slides files that you want to track.

## Setup Instructions

### Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable the following APIs for your project:
   - **Google Drive Activity API**
   - **Gmail API**
4. Create OAuth2 credentials:
   - Go to **APIs & Services > Credentials**.
   - Click **Create Credentials > OAuth Client ID**.
   - Choose **Web Application** as the application type.
   - Add `https://script.google.com` as an authorized redirect URI.
   - Save the **Client ID** and **Client Secret**.

### Step 2: Copy the Script
1. Open the [Google Apps Script Editor](https://script.google.com/).
2. Create a new project.
3. Replace the default code with the provided script.

### Step 3: Configure the Script
1. Replace the following placeholders in the script with your own values:
   - `YOUR_FOLDER_ID_HERE`: The ID of the Google Drive folder you want to track.
   - `YOUR_EMAIL_ADDRESS_HERE`: The email address where you want to receive notifications.
   - `YOUR_CLIENT_ID_HERE`: The OAuth2 Client ID from your Google Cloud Project.
   - `YOUR_CLIENT_SECRET_HERE`: The OAuth2 Client Secret from your Google Cloud Project.
2. Save the script.

### Step 4: Authorize the Script
1. Run the `authorize` function in the Apps Script editor.
2. Follow the authorization link and grant the necessary permissions.
3. After authorization, the script will be ready to use.

### Step 5: Run the Script
1. Run the `trackDriveActivity` function to start tracking changes.
2. The script will send an email summary of changes made to Google Slides files in the specified folder.

## Schedule Daily Notifications

To receive daily notifications at 3 PM, follow these steps:

1. Open your Google Apps Script project.
2. Click on the clock icon in the left sidebar (Triggers).
3. Click **+ Add Trigger**.
4. Configure the trigger as follows:
   - **Function to run**: `trackDriveActivity`
   - **Deployment**: `Head`
   - **Event source**: `Time-driven`
   - **Type of time-based trigger**: `Day timer`
   - **Time of day**: `3pm to 4pm`
5. Click **Save**.

Once set up, the script will automatically run at 3 PM every day and send an email summary of changes made to Google Slides files in the specified folder.
**You can now skip the above steps and run `createDailyTrigger()` to make add scheduler. Run `deleteTriggers()` to delete scheduler.

## How It Works
- The script checks for changes made to Google Slides files in the specified folder since the last run.
- If changes are detected, it sends an email with a list of modified files and their links.
- The script stores the last run timestamp to avoid duplicate notifications.

## Customization
- You can modify the script to track other file types by changing the `MimeType.GOOGLE_SLIDES` parameter.
- You can also customize the email subject and body in the `sendSummaryEmail` function.

## License
This project is open-source and available under the [MIT License](LICENSE).

---

Feel free to contribute or report issues!
