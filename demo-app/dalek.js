module.exports = {
    'Page title is correct': function (test) {
      test
        .open('http://localhost:9000/demo-app')
        .execute(function () {
            var request = new XMLHttpRequest();
            request.open('POST', '/save', true);
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(window.__coverage__));
        })
        .assert.title().is('Test', 'It has title')
        .done();
    }
};
