import React from 'react';

export default class HelloWorld extends React.Component {
    constructor() {
        super();
        this.render = this.render.bind(this);
    }

    sendCoverage(url) {
        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(window.__coverage__));
    }

    render() {
        return (
            <div className="HelloWorld__root">
                <h1>{this.props.title}</h1>
                <p>{this.props.text}</p>
                <h2>Save Coverage</h2>
                <button onClick={this.sendCoverage.bind(null, '/save')}>Save Coverage to file</button>
                <h2>View Coverage</h2>
                <fieldset>
                    <button onClick={this.sendCoverage.bind(null, '/coverage/client')}>Send coverage to server</button>
                    <a href="/coverage">View Coverage (after sending coverage)</a>
                </fieldset>
            </div>
        );
    }
}
