// Imports the server.js file to be tested.
let serverImports = require("../server");
//Assertion (Test Driven Development) and Should, Expect(Behaviour driven development) library
let chai = require("chai");
// Chai HTTP provides an interface for live integration testing of the API's.
let chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);
const { expect } = chai;
var assert = chai.assert;

describe("Server!", () => {
  it("Displays home page", (done) => {
    chai
      .request(serverImports.server)
      .get("/")
      .end((err, res) => {
        expect(res).to.have.status(200);
        assert;
        done();
      });
  });
  it("Displays account page", (done) => {
    chai
      .request(serverImports.server)
      .get("/account")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("Displays blackjack page", (done) => {
    chai
      .request(serverImports.server)
      .get("/blackjack")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("Displays leaderboard page", (done) => {
    chai
      .request(serverImports.server)
      .get("/leaderboard")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("Displays register page", (done) => {
    chai
      .request(serverImports.server)
      .get("/register")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("Displays login page", (done) => {
    chai
      .request(serverImports.server)
      .get("/login")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it("POST /register/register_user creates a new user in the database", (done) => {
    chai
      .request(serverImports.server)
      .post("/register/register_user")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({ username: "mochaUsername", name: "mochaName", email: "mochaEmail@gmail.com", password: "mochaPassword" })
      .end(async (err, res) => {
        expect(res).to.have.status(200);
        var userQuery = "SELECT * FROM public.users WHERE user_name='mochaUsername';";
        var deleteQuery = "DELETE FROM public.users WHERE user_name='mochaUsername';";
        await serverImports.db
          .task("check if newly registered user exists", (task) => {
            return task.batch([task.any(userQuery), task.any(deleteQuery)]);
          })
          .then((data) => {
            assert.exists(data[0][0].name, "has the property name");
            assert.strictEqual(data[0][0].name, "mochaName", "property name is equal to mochaName");
            assert.exists(data[0][0].user_name, "has the property user_name");
            assert.strictEqual(data[0][0].user_name, "mochaUsername", "property user_name is equal to mochaUsername");
            assert.exists(data[0][0].email, "has the property email");
            assert.strictEqual(data[0][0].email, "mochaEmail@gmail.com", "property email is equal to mochaEmail@gmail.com");
            assert.exists(data[0][0].password, "has the property password");
            assert.exists(data[0][0].user_id, "has the property user_id");
          })
          .catch((err) => {
            console.log("error", err);
          });
        done();
      });
  });
});
