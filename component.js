import React from 'react';

export default class HelloWorld extends React.Component {
    render() {
        return (
            <div className="HelloWorld__root">
                <h1>{this.props.title}</h1>
                <p>{this.props.text}</p>
            </div>
        );
    }
}
