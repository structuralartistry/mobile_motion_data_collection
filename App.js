import React, { Component } from 'react';
import {
  Accelerometer,
  Gyroscope,
  Magnetometer,
  Speech,
  KeepAwake
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
        accelerometer: [Date.now,0,0,0],
        gyroscope: [Date.now,0,0,0],
        magnetometer: [Date.now,0,0,0]
      },
      dataRunName: 'mobile motion data run ' + Date.now().toString(),
      pollingRateMs: 33,
      numberOfSamples: 1500,
      startRecordDelaySeconds: 15,
      postUrl: 'http://posttestserver.com/post.php?dir=alexi',
      trialInProgressStatus: false,
      dataCaptureStatus: false,
      recordButtonText: 'Record',
      startTrialTime: 0,
      startCaptureTime: 0,
      currentTime: Date.now
    }

  }

  componentDidMount() {
    //this._toggle();
  }

  componentWillUnmount() {
    this._accelerometerUnsubscribe();
    this._gyroscopeUnsubscribe();
    this._magnetometerUnsubscribe();
  }

  _toggle = () => {
    if (this._accelerometerSubscription) {
      this._accelerometerUnsubscribe();
      this.setState({trialInProgressStatus: false});
      this.setState({dataCaptureStatus: false});
      this._speak('Recording complete. You may stop now.');
    } else {
      this._accelerometerSubscribe();
      this.setState({trialInProgressStatus: true});
      this._speak('Beginning trial. Begin walking.');
    }
    if (this._gyroscopeSubscription) {
      this._gyroscopeUnsubscribe();
    } else {
      this._gyroscopeSubscribe();
    }
    if (this._magnetometerSubscription) {
      this._magnetometerUnsubscribe();
    } else {
      this._magnetometerSubscribe();
    }
  }

  _accelerometerSubscribe = () => {
    Accelerometer.setUpdateInterval(this.state.pollingRateMs);

    this.manageTrialStart();

    this._accelerometerSubscription = Accelerometer.addListener((result) => {

      if(this.manageTrialStatus() == true) {
        // add current data to the historical array
        this.state.currentTrialData.accelerometer.push([Date.now()-this.state.startCaptureTime, result.x, result.y, result.z]);

        // update the time index - letting the accelerometer routine handle
        var newTimeIndex = ++this.state.timeIndex || 1;
        this.setState({timeIndex: newTimeIndex});
      }
    });
  }

  _gyroscopeSubscribe = () => {
    Gyroscope.setUpdateInterval(this.state.pollingRateMs);

    this._gyroscopeSubscription = Gyroscope.addListener((result) => {
      // add current data to the historical array
      if(this.state.dataCaptureStatus == true) {
        this.state.currentTrialData.gyroscope.push([Date.now, result.x, result.y, result.z]);
      }
    });
  }
  _magnetometerSubscribe = () => {
    Magnetometer.setUpdateInterval(this.state.pollingRateMs);

    this._magnetometerSubscription = Magnetometer.addListener((result) => {
      // add current data to the historical array
      if(this.state.dataCaptureStatus == true) {
        this.state.currentTrialData.magnetometer.push([Date.now, result.x, result.y, result.z]);
      }
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

  _magnetometerUnsubscribe = () => {
    this._magnetometerSubscription && this._magnetometerSubscription.remove();
    this._magnetometerSubscription = null;
  }


  manageTrialStart = () => {
    this.setState({startTrialTime: Date.now()});
    // set capture start time if delay
    this.setState({startRecordAt: Date.now()+(this.state.startRecordDelaySeconds*1000)});
  }

  manageTrialStatus = () => {
    // update current time to keep state updating so that pre-capture elapsed time shows via state update
    this.setState({currentTime: Date.now()});

    // don't push data to the history array unless countdown over
    if(this.state.dataCaptureStatus == true || this.state.startRecordAt <= Date.now()) {

      if(this.state.dataCaptureStatus==false) {
        this.setState({dataCaptureStatus: true});
        this.setState({startCaptureTime: Date.now()});
        this._speak('Beginning to capture data.');
      }

      // end if desired sample size reached
      if(this.state.currentTrialData.accelerometer.length >= this.state.numberOfSamples) {
        this._speak('Number of samples reached.');
        this._toggle();
      }
    }

    return this.state.dataCaptureStatus;
  }

  _clearCurrentTrialData = () => {
    const baseData = [Date.now,0,0,0];
    this.setState({currentTrialData: {accelerometer: [baseData], gyroscope: [baseData], magnetometer: [baseData]} });
    this.setState({timeIndex: 0});
    this.setState({startTrialTime: 0});
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


  _speak = (sentence) => {
    const start = () => {
      this.setState({ speechInProgress: true });
    };
    const complete = () => {
      this.state.speechInProgress && this.setState({ speechInProgress: false });
    };

    Speech.speak(sentence, {
      language: 'en',
      pitch: 0.8,
      rate: 0.5,
      onStart: start,
      onDone: complete,
      onStopped: complete,
      onError: complete,
    });
  };

  _stopSpeaking = () => {
    Speech.stop();
  };

  friendlyStatusText = () => {
    if(this.state.trialInProgressStatus) {
      return 'Trial in Progress...';
    }

    if(this.state.dataCaptureStatus) {
      return 'Capturing Data...';
    }

    return 'Not Running...';
  };

  render() {

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View>
        <Text>Hello world!</Text>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <KeepAwake />
          <Text>{this.friendlyStatusText()}</Text>
          <Text style={styles.counter}>
            <Text style={this.state.dataCaptureStatus ? styles.red : styles.green}>Elapsed: {Date.now()-this.state.startTrialTime}</Text>
          </Text>
          <Text>Current Time Index: {this.state.timeIndex}</Text>
        </View>
        <View style={{flex: 1, flexDirection: 'column'}}>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text></Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>X</Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>Y</Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>Z</Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>N</Text>
          </View>
        </View>
        <View style={{flex: 1, flexDirection: 'column'}}>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>Acc</Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>{round(lastElement(this.state.currentTrialData.accelerometer)[1])}</Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>{round(lastElement(this.state.currentTrialData.accelerometer)[2])}</Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>{round(lastElement(this.state.currentTrialData.accelerometer)[3])}</Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>{this.state.currentTrialData.accelerometer.length}</Text>
          </View>
        </View>
        <View style={{flex: 1, flexDirection: 'column'}}>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>Acc</Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>{round(lastElement(this.state.currentTrialData.gyroscope)[1])}</Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>{round(lastElement(this.state.currentTrialData.gyroscope)[2])}</Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>{round(lastElement(this.state.currentTrialData.gyroscope)[3])}</Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>{this.state.currentTrialData.gyroscope.length}</Text>
          </View>
        </View>
        <View style={{flex: 1, flexDirection: 'column'}}>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>Acc</Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>{round(lastElement(this.state.currentTrialData.magnetometer)[1])}</Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>{round(lastElement(this.state.currentTrialData.magnetometer)[2])}</Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>{round(lastElement(this.state.currentTrialData.magnetometer)[3])}</Text>
          </View>
          <View style={{width: 50, height: 50, backgroundColor: 'powderblue'}}>
            <Text>{this.state.currentTrialData.magnetometer.length}</Text>
          </View>
        </View>
        <View style={styles.sensor}>
          <Text></Text>
          <Text></Text>
          <Text>Server Response: {this._serverResponse}</Text>

          <TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1}}
            onChangeText={(dataRunName) => this.setState({dataRunName})}
            value={this.state.dataRunName}
          />
          <TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1}}
            onChangeText={(pollingRateMs) => this.setState({pollingRateMs})}
            keyboardType='numeric'
            value={this.state.pollingRateMs.toString()}
          />
          <TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1}}
            onChangeText={(numberOfSamples) => this.setState({numberOfSamples})}
            keyboardType='numeric'
            value={this.state.numberOfSamples.toString()}
          />
          <Text>Approx Run Time(s): {(this.state.numberOfSamples * this.state.pollingRateMs)/1000}</Text>
          <TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1}}
            onChangeText={(startRecordDelaySeconds) => this.setState({startRecordDelaySeconds})}
            keyboardType='numeric'
            value={this.state.startRecordDelaySeconds.toString()}
          />
          <TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1}}
            onChangeText={(postUrl) => this.setState({postUrl})}
            value={this.state.postUrl}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={this._toggle} style={styles.button}>
              <Text>{this.state.trialInProgressStatus ? 'Stop' : 'Record'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this._clearCurrentTrialData} style={styles.button}>
              <Text>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this._postToServer} style={[styles.button]}>
              <Text>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </TouchableWithoutFeedback>
    );
  }
}

function lastElement(arr) {
  return arr[arr.length-1];
//  if(typeof(arr) != undefined && arr.length >= 1) {
//  } else {
//    return ['---','---','---','---'];
//  }
}

function round(n) {
  if (!n) {
    return 0;
  }

  return Math.floor(n * 100) / 100;
}

const styles = StyleSheet.create({
  counter: {
    fontSize: 20,
  },
  red: {
    color: 'red'
  },
  green: {
    color: 'green'
  },
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

