# Blackjack

Site is running at:
https://theocho-015-08.herokuapp.com/

This is a project I made in one of my classes. It is a fully functional blackjack web application that features account creation, loggin in, editing account details, depositing balance, and removing balance when money is lost while playing.

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
