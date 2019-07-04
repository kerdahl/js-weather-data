require('dotenv').config();
let expect = require('chai').expect;
let request = require('request');

const port = process.env.PORT || 3000;

// eslint-disable-next-line no-unused-vars
let app = require('../server');

describe('Server Status', () => {
  after(() => {
    console.log("Tests complete.");
    process.exit(0);
  });

  it('Main Page', (done) => {
    // eslint-disable-next-line no-unused-vars
    request(`http://localhost:${port}`, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it('Check-Ins Page', (done) => {
    // eslint-disable-next-line no-unused-vars
    request(`http://localhost:${port}/checkins`, (err, response, body) => {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });
});