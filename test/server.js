require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;

const port = process.env.PORT || 3000;

chai.use(chaiHttp);

require('../server');

describe('Server Status', () => {
  after(() => {
    console.log('Tests complete.');
    process.exit(0);
  });

  it('Main Page', done => {
    chai
      .request(`http://localhost:${port}`)
      .get('/')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });

  it('Check-Ins Page', done => {
    chai
      .request(`http://localhost:${port}`)
      .get('/checkins')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });

  it('firebase data should be an array', done => {
    chai
      .request(`http://localhost:${port}`)
      .get('/api')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('Array').that.is.not.empty;
        done();
      });
  });

  it('firebase data should have a timestamp', done => {
    chai
      .request(`http://localhost:${port}`)
      .get('/api')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body[0]).to.have.property('timestamp');
        done();
      });
  });

  it('firebase data should have air quality data', done => {
    chai
      .request(`http://localhost:${port}`)
      .get('/api')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body[0]).to.have.property('airQuality');
        done();
      });
  });

  it('firebase data should have a latitude', done => {
    chai
      .request(`http://localhost:${port}`)
      .get('/api')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body[0]).to.have.property('lat');
        done();
      });
  });

  it('firebase data should have a longitude', done => {
    chai
      .request(`http://localhost:${port}`)
      .get('/api')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body[0]).to.have.property('long');
        done();
      });
  });

  it('firebase data should have a place', done => {
    chai
      .request(`http://localhost:${port}`)
      .get('/api')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body[0]).to.have.property('place');
        done();
      });
  });

  it('firebase data should have weather information', done => {
    chai
      .request(`http://localhost:${port}`)
      .get('/api')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body[0]).to.have.property('weather');
        done();
      });
  });
});
