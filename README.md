# Fiddler
Node port of Apps Script bmFiddler library

## More info 
See [fiddler](https://ramblings.mcpher.com/gassnippets2/afunctionalapproachtofiddlingwithsheetdata/) for more information and search mcpher.com for fiddler - there are lots of articles about things you can do with fiddler.

## gas-fakes
This uses built in Apps Script Services, so for running in Node, we need to simulate them with gas-fakes - see [gas-fakes](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/) for more information and related articles. 


## Getting started

Fiddler can be used without apps script services, but whenever you access sheets you'll also need gas-fakes on Node which emulates Apps Script built in services.

### To install fiddler

npm i @mcpher/fiddler

### To use with gas fakes

npm i @mcpher/gas-fakes

#### Authentication

If you are faking apps script services, you'll need to authenticate. Gas-fakes uses application default credentials. `test/shells/setaccount.sh` contains a prebaked script to handle setting all that up for you.

Your .env file should contain something like this - copy the `test/.env-template` file and modify as required.
````
# for testing authentication
GCP_PROJECT_ID=xxx

# for testing we can access drive - just add a drive file ID you have read access to here
DRIVE_TEST_FILE_ID=xxx

# using default application credentials
AC=default

# these are the scopes set by default - take some of these out if you want to minimize access
DEFAULT_SCOPES="https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/drive,openid,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/sqlservice.login"
EXTRA_SCOPES=",https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/spreadsheets"
````

##### Authenticate and authorize default credentials

 `bash setaccount.sh` will take you through an authentication dialog with your selected Google account, then run a test to ensure it has been set up properly.

Optionally, you can also `bash testtoken.sh` which will check the scopes you provided are enough to access the file whose ID you provided in your .env file.

There's a lot more about all this at [gas-fakes](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/) and [ADC](https://ramblings.mcpher.com/application-default-credentials-with-google-cloud-and-workspace-apis/) if you are interested in the detail.

# Usage with a test runner
If you are running tests, see `test/testinit.js` and `test/testsheets.js` for how to use with a test runner - I use [@mcpher/unit](https://ramblings.mcpher.com/unit-test-runner-for-both-node-and-apps-script/)


## usage

For details on using fiddler, see [fiddler](https://ramblings.mcpher.com/gassnippets2/afunctionalapproachtofiddlingwithsheetdata/) and  [related articles](https://ramblings.mcpher.com/?s=fiddler). These are written for Apps Script, but gas-fakes emulation on Node means it's exactly the same.

````js
  // create a fiddler for a given sheet
  const fiddler = new Fiddler(SpreadsheetApp.openById(myssid).getSheetByName("people"));

  // do things with the data
  fiddler.insertColumn("full name")
  fiddler.mapRows (row=> {
    row["full name"] = row["first name"] + " " + row["last name"]
    return row
  })
  
  // dump the data back to the sheet
  fiddler.dumpValues()

````

