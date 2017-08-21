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
  TouchableWithoutFeedback,
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
      currentAccelerometerReading: ['---','---','---','---'],
      currentGyroscopeReading: ['---','---','---','---'],
      dataRunName: 'alexi data run #',
      pollingRateMs: 33,
      numberOfSamples: 1500,
      startRecordDelaySeconds: 15,
      postUrl: 'http://posttestserver.com/post.php?dir=alexi',
      recordStatus: false,
      recordButtonText: 'Record'
    }

  }

  trialDataAccelerometer = [];
  trialDataGyroscope = [];

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
      this.state.recordStatus = false;
    } else {
      this._accelerometerSubscribe();
      this.state.recordStatus = true;
    }
    if (this._gyroscopeSubscription) {
      this._gyroscopeUnsubscribe();
    } else {
      this._gyroscopeSubscribe();
    }
  }

  _accelerometerSubscribe = () => {
    Accelerometer.setUpdateInterval(this.state.pollingRateMs);

    this._accelerometerSubscription = Accelerometer.addListener((result) => {
      // add current data to the historical array
      this.state.currentTrialData.accelerometer.push([this.state.timeIndex, result.x, result.y, result.z]);

      // update the time index - letting the accelerometer routine handle
      var newTimeIndex = ++this.state.timeIndex || 1;
      this.setState({timeIndex: newTimeIndex});
    });
  }

  _gyroscopeSubscribe = () => {
    Gyroscope.setUpdateInterval(this.state.pollingRateMs);

    this._gyroscopeSubscription = Gyroscope.addListener((result) => {
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
    this.setState({currentTrialData: {accelerometer: [], gyroscope: []} });
    this.setState({timeIndex: 0});
  }

  _postToServer = () => {
    fetch(this.state.postUrl, {
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.sensor}>
        <Text style={styles.sectionHeaderText}>Accelerometer:</Text>
        <Text>X: {lastElement(this.state.currentTrialData.accelerometer)[1]}</Text>
        <Text>Y: {lastElement(this.state.currentTrialData.accelerometer)[2]}</Text>
        <Text>Z: {lastElement(this.state.currentTrialData.accelerometer)[3]}</Text>
        <Text>N: {this.state.currentTrialData.accelerometer.length}</Text>
        <Text style={styles.sectionHeaderText}>Gyroscope:</Text>
        <Text>X: {lastElement(this.state.currentTrialData.gyroscope)[1]}</Text>
        <Text>Y: {lastElement(this.state.currentTrialData.gyroscope)[2]}</Text>
        <Text>Z: {lastElement(this.state.currentTrialData.gyroscope)[3]}</Text>
        <Text>N: {this.state.currentTrialData.gyroscope.length}</Text>
        <Text></Text>
        <Text>Current Time Index: {this.state.timeIndex}</Text>
        <Text></Text>
        <Text>Server Response: {this._serverResponse}</Text>

        <TextInput
          style={{height: 40, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(dataRunName) => this.setState({dataRunName})}
          onSubmitEditing={Keyboard.dismiss}
          value={this.state.dataRunName}
        />
        <TextInput
          style={{height: 40, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(pollingRateMs) => this.setState({pollingRateMs})}
          onSubmitEditing={Keyboard.dismiss}
          keyboardType='numeric'
          value={this.state.pollingRateMs.toString()}
        />
        <TextInput
          style={{height: 40, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(numberOfSamples) => this.setState({numberOfSamples})}
          onSubmitEditing={Keyboard.dismiss}
          keyboardType='numeric'
          value={this.state.numberOfSamples.toString()}
        />
        <Text>Approx Run Time(s): {(this.state.numberOfSamples * this.state.pollingRateMs)/1000}</Text>
        <TextInput
          style={{height: 40, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(startRecordDelaySeconds) => this.setState({startRecordDelaySeconds})}
          onSubmitEditing={Keyboard.dismiss}
          keyboardType='numeric'
          value={this.state.startRecordDelaySeconds.toString()}
        />
        <TextInput
          style={{height: 40, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(postUrl) => this.setState({postUrl})}
          onSubmitEditing={Keyboard.dismiss}
          value={this.state.postUrl}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={this._toggle} style={styles.button}>
            <Text>{this.state.recordStatus ? 'Stop' : 'Record'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._clearCurrentTrialData} style={styles.button}>
            <Text>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._postToServer} style={[styles.button]}>
            <Text>Post</Text>
          </TouchableOpacity>
        </View>

      </View>
      </TouchableWithoutFeedback>
    );
  }
}

function lastElement(arr) {
  if(typeof(arr) != undefined && arr.length >= 1) {
    return arr[arr.length-1];
  } else {
    return ['---','---','---','---'];
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
