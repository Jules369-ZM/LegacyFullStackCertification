/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  // Ensure at least one book exists before the example test runs
  suiteSetup(function(done) {
    chai.request(server)
      .post('/api/books')
      .send({ title: 'Seed Book For Tests' })
      .end(function() { done(); });
  });

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book Title' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'book should contain _id');
            assert.property(res.body, 'title', 'book should contain title');
            assert.equal(res.body.title, 'Test Book Title', 'title should match submitted title');
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field title', 'response should indicate missing title');
            done();
          });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            res.body.forEach(function(book) {
              assert.property(book, '_id', 'each book should contain _id');
              assert.property(book, 'title', 'each book should contain title');
              assert.property(book, 'commentcount', 'each book should contain commentcount');
              assert.isNumber(book.commentcount, 'commentcount should be a number');
            });
            done();
          });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/000000000000000000000000')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists', 'response should indicate book does not exist');
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        // First create a book, then retrieve it by id
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Book For GET Test' })
          .end(function(err, postRes) {
            const bookId = postRes.body._id;
            chai.request(server)
              .get('/api/books/' + bookId)
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isObject(res.body, 'response should be an object');
                assert.property(res.body, '_id', 'book should contain _id');
                assert.property(res.body, 'title', 'book should contain title');
                assert.property(res.body, 'comments', 'book should contain comments');
                assert.isArray(res.body.comments, 'comments should be an array');
                assert.equal(res.body._id, bookId, '_id should match');
                done();
              });
          });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        // First create a book, then add a comment
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Book For Comment Test' })
          .end(function(err, postRes) {
            const bookId = postRes.body._id;
            chai.request(server)
              .post('/api/books/' + bookId)
              .send({ comment: 'This is a test comment' })
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isObject(res.body, 'response should be an object');
                assert.property(res.body, '_id', 'book should contain _id');
                assert.property(res.body, 'title', 'book should contain title');
                assert.property(res.body, 'comments', 'book should contain comments');
                assert.isArray(res.body.comments, 'comments should be an array');
                assert.include(res.body.comments, 'This is a test comment', 'comments should include new comment');
                done();
              });
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        // First create a book, then try to add empty comment
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Book For Empty Comment Test' })
          .end(function(err, postRes) {
            const bookId = postRes.body._id;
            chai.request(server)
              .post('/api/books/' + bookId)
              .send({})
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'missing required field comment', 'response should indicate missing comment');
                done();
              });
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
          .post('/api/books/000000000000000000000000')
          .send({ comment: 'Comment on nonexistent book' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists', 'response should indicate book does not exist');
            done();
          });
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        // First create a book, then delete it
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Book To Delete' })
          .end(function(err, postRes) {
            const bookId = postRes.body._id;
            chai.request(server)
              .delete('/api/books/' + bookId)
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'delete successful', 'response should confirm deletion');
                done();
              });
          });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai.request(server)
          .delete('/api/books/000000000000000000000000')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists', 'response should indicate book does not exist');
            done();
          });
      });

    });

  });

});
