# 3308SP21_015_8

**APPLICATION OVERVIEW**

An online blackjack application where a user can bet any amount on a blackjack hand against an automatic dealer. Users can view their account information, update their balance, and see how they stand against other users on a public leaderboard.

The application is developed with node.js and uses express and express-sessions. When a user creates an account, their login information is stored in a database table which allows them to access their account again in the future. Passwords are hashed before being stored using bcrypt. In a separate table, a user’s balance and total wins/losses are stored. This table is used for calculating rankings and displaying them on a leaderboard. 

When a user logs in it saves it into a session created by express-sessions. The app is entirely auth-secured so you can not access the account page and the blackjack page if you are not logged in. 

All the pages of the frontend are displayed using server side rendering with EJS. The actual blackjack game itself functions by using an array of 52 elements to represent a single deck, which is shuffled at the start of each play using an algorithm.

The app is hosted and deployed using Heroku. The app is integrated with its database using the Heroku Postgres add-on. Queries to the database are made using pg-promise. 


**REPOSITORY ORGANIZATION**

The repository is split into 4 files. The first, Milestone Submissions, contains milestone documents as well as documents from TA meetings. The second folder, resources, contains the javascript and css files for our project. The third folder, test, contains the mocha tests for our project. And finally, the fourth folder, views, contains the EJS files for the our website.

**HOW TO RUN**

In order to run the application you first need to run the following line:

`npm install`

To install the node modules.

Also, you need to run a postgres database instance on your computer using 

`psql -U postgres`

and then create a passwords.js file in the root directory using the passwords-example.js file that contains the password to your database. 

Then you can run

`npm start`

To run the application (as long as you have a running postgres database instance linked in server.js)

Also you can run the test suite by running

`npm run test`
