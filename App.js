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
      accelerometerData: {},
      gyroscopeData: {},
      dataRunName: '',
      recordButtonText: false
    }

  }

//    // Toggle the state every second
//    setInterval(() => {
//      this.setState(previousState => {
//        return { showText: !previousState.showText };
//      });
//    }, 1000);

//  state = {
//    accelerometerData: {},
//    gyroscopeData: {},
//    dataRunName: '',
//    recordStatus: false
//  }

  _recordButtonText() {
    if(this.state.recordStatus==true) {
      return 'Stop';
    } else {
      return 'Record';
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
      this.state.recordStatus = true;
    } else {
      this._accelerometerSubscribe();
      this.state.recordStatus = false;
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

  _timeIndex = 0;

  _accelerometerSubscribe = () => {
    // ms
    Accelerometer.setUpdateInterval(33);

    this._accelerometerSubscription = Accelerometer.addListener((result) => {
      this.setState({accelerometerData: result});

      // add current data to the historical array
      this._currentTrialData.accelerometer.push([this._timeIndex, result.x, result.y, result.z]);

      // update the time index - letting the accelerometer routine handle
      this._timeIndex += 1;
    });
  }

  _gyroscopeSubscribe = () => {
    Gyroscope.setUpdateInterval(33);

    this._gyroscopeSubscription = Gyroscope.addListener((result) => {
      this.setState({gyroscopeData: result});

      // add current data to the historical array
      this._currentTrialData.gyroscope.push([this._timeIndex, result.x, result.y, result.z]);
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

  _currentTrialData = {
    accelerometer: [],
    gyroscope: [],
  }

  _clearCurrentTrialData = () => {
    this._currentTrialData.accelerometer = [];
    this._currentTrialData.gyroscope = [];
    this._timeIndex = 0;
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
        trialData: this._currentTrialData,
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


    //let { x, y, z } = this.state.accelerometerData;
    //<Text>x: {round(x)} y: {round(y)} z: {round(z)}</Text>
//        <Text>Accelerometer:</Text>
//        <Text>X: {this.state.accelerometerData.x}</Text>
//        <Text>Y: {this.state.accelerometerData.y}</Text>
//        <Text>Z: {this.state.accelerometerData.z}</Text>
//        <Text>N: {this._currentTrialData.accelerometer.length}</Text>
//        <Text>Gyroscope:</Text>
//        <Text>X: {this.state.gyroscopeData.x}</Text>
//        <Text>Y: {this.state.gyroscopeData.y}</Text>
//        <Text>Z: {this.state.gyroscopeData.z}</Text>
//        <Text>N: {this._currentTrialData.gyroscope.length}</Text>
//          <TouchableOpacity onPress={this._slow} style={[styles.button, styles.middleButton]}>
//            <Text>Slow</Text>
//          </TouchableOpacity>
//          <TouchableOpacity onPress={this._fast} style={styles.button}>
//            <Text>Fast</Text>
//          </TouchableOpacity>

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
        <Text>X: {this.state.accelerometerData.x}</Text>
        <Text>Y: {this.state.accelerometerData.y}</Text>
        <Text>Z: {this.state.accelerometerData.z}</Text>
        <Text>N: {this._currentTrialData.accelerometer.length}</Text>
        <Text style={styles.sectionHeaderText}>Gyroscope:</Text>
        <Text>X: {this.state.gyroscopeData.x}</Text>
        <Text>Y: {this.state.gyroscopeData.y}</Text>
        <Text>Z: {this.state.gyroscopeData.z}</Text>
        <Text>N: {this._currentTrialData.gyroscope.length}</Text>
        <Text></Text>
        <Text>TI: {this._timeIndex}</Text>
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
            <Text>{this._recordButtonText()}</Text>
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
