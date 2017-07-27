# Gherkin Helper
This app exports Gherkin .feature files from User Stories.  

## Summary/Description
The "Export Gherkin..." menu item is a bulk menu item and will only be available if the configured "Acceptance Criteria Field" has any text in it.  
It assumes that the text is formatted correctly and does not apply any checks or additional formatting.  

This variation of the app will export a Feature file from the user story.  in the following format:

@<User Story Formatted ID>
@<Contents of configured Tags Field [Optional]>
Feature:  <User Story Name>
<User Story Description>

<Contents of configured Acceptance Criteria field>


"Use String Gherkin Format" = true App Behavior

The "Export Gherkin..." menu item is a bulk menu item and will only be available if the configured "Acceptance Criteria Field" has text
that meets the following criteria (case insensitive):

Scenario Outline: ...  Given: ... When: ... Then: ...

This app can handle multiple Given/When/Then clauses as well as And and Or inside of a Given/When or Then.  

Regardless of the format in the text field, the app will create a new line for each clause and any And or Or statements.  (To enforce a more strict Gherkin format, change the "strictFormatGherkin" configuration at that top of the app.js file to true)

For a story with the following field values (and a configured Acceptance criteria field of "Notes") :

FormattedID| US12
Name|  User can checkout with credit card
Description|  The user can checkout using a credit card from any valid bank  
Notes|  Scenario Outline:  Cart has a balance of $600 given: there are sufficient funds and the card is valid  
        when: the customer checks out with an american express card or a visa card then: the order should be submitted successfully and the customer should receive a confirmation
MultivalueField | somevalue1, someValue2         


Here is the expected file output:  

```
@US12
@someValue1
@someValue2
Feature: User can checkout with credit card
  The user can checkout using a credit card from any valid bank

  Scenario Outline:  Cart has a balance of $600

    Given: there are sufficient funds
      And the card is valid  

    When: the customer checks out with an american express card
      Or a visa card

    Then: the order should be submitted successfully
      And the customer should receive a confirmation   

```
### App Settings
#### Acceptance Criteria Field
Defaults to Notes.  Configure this field to any text field on the user story that will contain the Gherkin formatted text.  

#### Tags Field
Defaults to None.  Configure this field to any multi-value dropdown field on the user story that will contain tags for the Gherkin file.  These
will then be output at the top of the feature file as tags (See above)


## Development Notes


### First Load

If you've just downloaded this from github and you want to do development,
you're going to need to have these installed:

 * node.js
 * grunt-cli
 * grunt-init

Since you're getting this from github, we assume you have the command line
version of git also installed.  If not, go get git.

If you have those three installed, just type this in the root directory here
to get set up to develop:

  npm install

### Structure

  * src/javascript:  All the JS files saved here will be compiled into the
  target html file
  * src/style: All of the stylesheets saved here will be compiled into the
  target html file
  * test/fast: Fast jasmine tests go here.  There should also be a helper
  file that is loaded first for creating mocks and doing other shortcuts
  (fastHelper.js) **Tests should be in a file named <something>-spec.js**
  * test/slow: Slow jasmine tests go here.  There should also be a helper
  file that is loaded first for creating mocks and doing other shortcuts
  (slowHelper.js) **Tests should be in a file named <something>-spec.js**
  * templates: This is where templates that are used to create the production
  and debug html files live.  The advantage of using these templates is that
  you can configure the behavior of the html around the JS.
  * config.json: This file contains the configuration settings necessary to
  create the debug and production html files.  
  * package.json: This file lists the dependencies for grunt
  * auth.json: This file should NOT be checked in.  Create this to create a
  debug version of the app, to run the slow test specs and/or to use grunt to
  install the app in your test environment.  It should look like:
    {
        "username":"you@company.com",
        "password":"secret",
        "server": "https://rally1.rallydev.com"
    }

### Usage of the grunt file
####Tasks

##### grunt debug

Use grunt debug to create the debug html file.  You only need to run this when you have added new files to
the src directories.

##### grunt build

Use grunt build to create the production html file.  We still have to copy the html file to a panel to test.

##### grunt test-fast

Use grunt test-fast to run the Jasmine tests in the fast directory.  Typically, the tests in the fast
directory are more pure unit tests and do not need to connect to Rally.

##### grunt test-slow

Use grunt test-slow to run the Jasmine tests in the slow directory.  Typically, the tests in the slow
directory are more like integration tests in that they require connecting to Rally and interacting with
data.

##### grunt deploy

Use grunt deploy to build the deploy file and then install it into a new page/app in Rally.  It will create the page on the Home tab and then add a custom html app to the page.  The page will be named using the "name" key in the config.json file (with an asterisk prepended).

To use this task, you must create an auth.json file that contains the following keys:
{
    "username": "fred@fred.com",
    "password": "fredfredfred",
    "server": "https://us1.rallydev.com"
}

(Use your username and password, of course.)  NOTE: not sure why yet, but this task does not work against the demo environments.  Also, .gitignore is configured so that this file does not get committed.  Do not commit this file with a password in it!

When the first install is complete, the script will add the ObjectIDs of the page and panel to the auth.json file, so that it looks like this:

{
    "username": "fred@fred.com",
    "password": "fredfredfred",
    "server": "https://us1.rallydev.com",
    "pageOid": "52339218186",
    "panelOid": 52339218188
}

On subsequent installs, the script will write to this same page/app. Remove the
pageOid and panelOid lines to install in a new place.  CAUTION:  Currently, error checking is not enabled, so it will fail silently.

##### grunt watch

Run this to watch files (js and css).  When a file is saved, the task will automatically build, run fast tests, and deploy as shown in the deploy section above.

##### grunt --help  

Get a full listing of available targets.
