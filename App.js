import React, { Component } from 'react';
import {
  Accelerometer,
  Gyroscope,
  Speech
} from 'expo';
import {
  AppRegistry,
  TextInput,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default class AccelerometerSensor extends React.Component {

  constructor(props) {
    super(props);
    //this.state = {showText: true};
    this.state = {
      currentTrialData: {
        accelerometer: [],
        gyroscope: [],
      },
      currentAccelerometerData: {},
      currentGyroscopeData: {},
      dataRunName: '',
      recordButtonText: 'Record'
    }

  }

  componentDidMount() {
    //this._toggle();
  }

  componentWillUnmount() {
    this._accelerometerUnsubscribe();
    this._gyroscopeUnsubscribe();
  }

  _toggle = () => {
    this._speak();
    if (this._accelerometerSubscription) {
      this._accelerometerUnsubscribe();
      this.state.recordButtonText = 'Record';
    } else {
      this._accelerometerSubscribe();
      this.state.recordButtonText = 'Stop';
    }
    if (this._gyroscopeSubscription) {
      this._gyroscopeUnsubscribe();
    } else {
      this._gyroscopeSubscribe();
    }
  }

  _slow = () => {
    Accelerometer.setUpdateInterval(1000);
  }

  _fast = () => {
    Accelerometer.setUpdateInterval(16);
  }

  _accelerometerSubscribe = () => {
    // ms
    Accelerometer.setUpdateInterval(33);

    this._accelerometerSubscription = Accelerometer.addListener((result) => {
      this.setState({currentAccelerometerData: result});

      // add current data to the historical array
      this.state.currentTrialData.accelerometer.push([this.state.timeIndex, result.x, result.y, result.z]);

      // update the time index - letting the accelerometer routine handle
      this.state.timeIndex += 1;
    });
  }

  _gyroscopeSubscribe = () => {
    Gyroscope.setUpdateInterval(33);

    this._gyroscopeSubscription = Gyroscope.addListener((result) => {
      this.setState({currentGyroscopeData: result});

      // add current data to the historical array
      this.state.currentTrialData.gyroscope.push([this.state.timeIndex, result.x, result.y, result.z]);
    });
  }

  _accelerometerUnsubscribe = () => {
    this._accelerometerSubscription && this._accelerometerSubscription.remove();
    this._accelerometerSubscription = null;
  }

  _gyroscopeUnsubscribe = () => {
    this._gyroscopeSubscription && this._gyroscopeSubscription.remove();
    this._gyroscopeSubscription = null;
  }

  _clearCurrentTrialData = () => {
    this.state.currentTrialData.accelerometer = [];
    this.state.currentTrialData.gyroscope = [];
    this.state.timeIndex = 0;
  }

  _postToServer = () => {
    fetch('http://posttestserver.com/post.php?dir=alexi', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dataRunName: this.state.dataRunName,
        trialData: this.state.currentTrialData,
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this._serverResponse = responseJson.toString();
    })
    .catch((error) => {
      this._serverResponse = 'post failed :(';
    })
  }

  _serverResponse = '';


  _speak = () => {
    const start = () => {
      this.setState({ speechInProgress: true });
    };
    const complete = () => {
      this.state.speechInProgress && this.setState({ speechInProgress: false });
    };

    Speech.speak('hello world', {
      language: 'en',
      pitch: 1,
      rate: 0.75,
      onStart: start,
      onDone: complete,
      onStopped: complete,
      onError: complete,
    });
  };

  _stopSpeaking = () => {
    Speech.stop();
  };

  render() {

    return (
      <View style={styles.sensor}>
        <Text style={styles.sectionHeaderText}>Accelerometer:</Text>
        <Text>X: {this.state.currentAccelerometerData.x}</Text>
        <Text>Y: {this.state.currentAccelerometerData.y}</Text>
        <Text>Z: {this.state.currentAccelerometerData.z}</Text>
        <Text>N: {this.state.currentTrialData.accelerometer.length}</Text>
        <Text style={styles.sectionHeaderText}>Gyroscope:</Text>
        <Text>X: {this.state.currentGyroscopeData.x}</Text>
        <Text>Y: {this.state.currentGyroscopeData.y}</Text>
        <Text>Z: {this.state.currentGyroscopeData.z}</Text>
        <Text>N: {this.state.currentTrialData.gyroscope.length}</Text>
        <Text></Text>
        <Text>TI: {this.state.timeIndex}</Text>
        <Text></Text>
        <Text>Server Response: {this._serverResponse}</Text>
        <TextInput
          style={{height: 40, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(dataRunName) => this.setState({dataRunName})}
          onSubmitEditing={Keyboard.dismiss}
          value={this.state.dataRunName}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={this._toggle} style={styles.button}>
            <Text>{this.state.recordButtonText}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._clearCurrentTrialData} style={styles.button}>
            <Text>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._postToServer} style={[styles.button]}>
            <Text>Post</Text>
          </TouchableOpacity>
        </View>

      </View>
    );
  }
}

function lastElement(arr) {
  arr[arr.length-1];
}

function round(n) {
  if (!n) {
    return 0;
  }

  return Math.floor(n * 100) / 100;
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  sectionHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  sensor: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
});
