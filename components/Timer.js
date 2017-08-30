import React, { Component } from 'react';
import {
  StyleSheet,
  Text
} from 'react-native';
import {
  Font,
} from 'expo';

//export class RegularText extends React.Component {
//  render() {
//    return (
//      <Text {...this.props} style={[this.props.style, styles.regular]} />
//    );
//  }
//}

export class Timer extends React.Component {

    // This is called before our render function. The object that is
    // returned is assigned to this.state, so we can use it later.
//    getInitialState() {
//      return { elapsed: 0 };
//    }

    constructor(props) {
      super(props);

      this.state = {
        elapsed: 0
      }
    }

    render() {
      return (
        <Text>Hello World Timer Component {this.props.start}</Text>
      );
    }
}

//    // componentDidMount is called by react when the component
//    // has been rendered on the page. We can set the interval here:
//    componentDidMount() {
//      this.timer = setInterval(this.tick, 50);
//    }
//
//    // This method is called immediately before the component is removed
//    // from the page and destroyed. We can clear the interval here:
//    componentWillUnmount() {
//        clearInterval(this.timer);
//    }
//
//    // This function is called every 50 ms. It updates the
//    // elapsed counter. Calling setState causes the component to be re-rendered
//    tick() {
//      this.setState({elapsed: new Date() - this.props.start});
//    }
//
//    render() {
//      // Calculate elapsed to tenth of a second:
//      var elapsed = Math.round(this.state.elapsed / 100);
//
//      // This will give a number with one digit after the decimal dot (xx.x):
//      var seconds = (elapsed / 10).toFixed(1);
//
//      // Although we return an entire <p> element, react will smartly update
//      // only the changed parts, which contain the seconds variable.
//
//      return <p>This example was started <b>{seconds} seconds</b> ago.</p>;
//    }

//  render() {
//    return (
//      <Text {...this.props} style={[this.props.style, styles.regular]} />
//    );
//  }
//}
