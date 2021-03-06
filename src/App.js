import React, { Component } from 'react';
import logo from './logo.svg';
import Clock from 'react-live-clock';
import {Button, Form, FormControl, Col, InputGroup, FormGroup, ControlLabel, Tabs, Tab, ControlledTabs} from 'react-bootstrap';
import Datetime from 'react-datetime';
import ReactTable from 'react-table';
import Parser from 'json2csv';
import Loadable from 'react-loading-overlay';
import download from 'downloadjs';
import './App.css';

var sessionKey = "";
var reportName = "defaultReport";

class App extends Component {

  constructor(props){
    super(props);

    this.state = {
      data: [],
      loading: false
    };

    this.login = this.login.bind(this);
    this.tabChange = this.tabChange.bind(this);
  }

  componentWillMount() {
    //not doing anything here, it's too soon in the lifecycle
  }

  componentDidMount() {

    if (this.state.data === null || this.state.data === undefined)
      this.setState({data: []});
  }

  onStartDateChange = (e) => {
    this.setState({startdate: e._d});
  }

  onEndDateChange = (e) => {
    this.setState({enddate: e._d});
  }

  processFlightReport(e) {
    const startdate = this.state.startdate;
    const enddate = this.state.enddate;

    if (enddate < startdate) {
      alert('End Date cannot be before Start Date.');
    } else {
      this.queryForFlightReport1(startdate, enddate);
    }

    //when changing form field values, capture the state
    // var state = this.state;
    // state[e.target.name].value = e.target.value;
    // this.setState(state);
  }

  exportToCSV(e) {
    try {
      if (this.state.data === undefined || this.state.data.length === 0) {
          alert('No data to export');
      } else {
        const fields = [{label: 'Time (UTC)',value: 'time'},{label: 'Longitude',value: 'long'},{label: 'Latitude',value: 'lat'},{label: 'Altitude',value: 'alt'},{label: 'Satellite_orbital_position',value: 'orbitalPosition'},{label: 'Satellite_inclination',value: 'inclination'},{label: 'Antenna_Azimuth',value: 'azimuth'},{label: 'Antenna_Elevation',value: 'elevation'},{label: 'Antenna_Polarization',value: 'polarization'},{label: 'Aircraft_Pitch_Axis',value: 'pitch'},{label: 'Aircraft_Roll_Axis',value: 'roll'},{label: 'Aircraft_Yaw_Axis',value: 'yaw'},{label: 'Antenna_Hunt_frequency',value: 'huntFreq'},{label: 'MODEM_running_code – MBC/OPER',value: 'modemRunningCode'},{label: 'MODEM_uptime (3 OIDs)',value: 'modemUptime'},{label: 'MODEM_RX_lock',value: 'modemRxLock'},{label: 'MODEM_SYNC_status',value: 'modemSyncStatus'},{label: 'MODEM_L2_status',value: 'modemL2Status'},{label: 'MODEM_L3_status',value: 'modemL3Status'},{label: 'MODEM_RX_level',value: 'modemRxLevel'},{label: 'MODEM_Noise_level',value: 'modemNoiseLevel'},{label: 'MODEM_TX_capability A',value: 'modemTxCapA'},{label: 'MODEM_TX_capability B',value: 'modemTxCapB'},{label: 'MODEM_TX_capability C',value: 'modemTxCapC'},{label: 'MODEM_TX_SYNC_power',value: 'modemTxSyncPower'},{label: 'MODEM_CPU_utilization current',value: 'modemCPUCurrent'},{label: 'MODEM_CPU_utilization last 5 minutes',value: 'modemCPULastFive'},{label: 'MODEM_RF_cluster_code',value: 'modemRFCluster'},{label: 'MODEM_Packet_received_from_satellite',value: 'modemPacketRx'},{label: 'MODEM_Packet_transmit_from_satellite',value: 'modemPacketTx'},{label: 'MODEM_Bytes_received_from_satellite',value: 'modemBytesRx'},{label: 'MODEM_Bytes_transmit_from_satellite',value: 'modemBytesTx'},{label: 'MODEM_packet_drops',value: 'modemPacketDrops'},{label: 'Last_openAMIP_`B`_message',value: 'openAMIPB'},{label: 'Last_openAMIP_`E`_message',value: 'openAMIPE'},{label: 'Last_openAMIP_`H`_message',value: 'openAMIPH'},{label: 'Last_openAMIP_`I`_message',value: 'openAMIPI'},{label: 'Last_openAMIP_`K`_message',value: 'openAMIPK'},{label: 'Last_openAMIP_`L`_message',value: 'openAMIPL'},{label: 'Last_openAMIP_`P`_message',value: 'openAMIPP'},{label: 'Last_openAMIP_`S`_message',value: 'openAMIPS'},{label: 'Last openAMIP_`T`_message',value: 'openAMIPT'},{label: 'Last openAMIP_`i`_message',value: 'openAMIPLoweri'},{label: 'Last openAMIP_`s`_message',value: 'openAMIPLowers'},{label: 'Last openAMIP_`w`_message',value: 'openAMIPw'},{label: 'Last openAMIP_`X`_message',value: 'openAMIPX'},{label: 'Last openAMIP_`A`_message',value: 'openAMIPA'},{label: 'MODEM TX Mute (0/Mute cause)',value: 'modemTxMute'},{label: 'All MODEM Discrete lines Input and outputs status',value: 'modemAllDiscrete'},{label: 'KANDU TX Mute status (0 / Mute cause)',value: 'kanduTxMute'},{label: 'Elevator trim offset',value: 'elevatorTrimOffset'},{label: 'Establish Homing',value: 'establishHoming'},{label: 'Last Homing step errors',value: 'lastHomingStepErrors'}];

        // let's export some stuff
        const Json2csvParser = require('json2csv').Parser;
        const csvParser = new Json2csvParser({fields});
        const csv = csvParser.parse(this.state.data, {fields});

        download(csv, "MACU_FlightReport1_" + this.state.startdate + "_" + this.state.enddate + ".csv", "text/csv");
      }
    } catch (ex) { console.log("ERROR IN EXPORT TO CSV::: " + ex) }
  }

  tabChange(key) {
    alert(`selected ${key}`);
    this.setState({ key });
  }

  queryForFlightReport1(startdate, enddate) {
    
    console.log("Attempting to query...");

    try {

      this.setState({loading: true});

      var requestPayload = "<QUERY_PARAMS START_DATE='" + startdate + "' END_DATE='" + enddate + "' ROWS='10000' />"
      var requestURL = "https://10.42.32.109/xos/poll/summary/flightreport1/"
      //var requestURL = "http://127.0.0.1:8000/xos/summary/flightreport1/"

      var xhttp = new XMLHttpRequest(); 
      //xhttp.setDisableHeaderCheck(true);

      var that = this; // ugh

      //xhttp.responseText, responseXML, status, statusText, readyState
      xhttp.onreadystatechange = function() {
        if (this.responseText === "" || this.responseText === undefined) {
          // something happened or it's just a blank request
        } else {
          var jsonResponse = {};

          try {
            jsonResponse = JSON.parse(this.responseText);
          } catch (ex) { console.log("ERROR PARSING JSON::: " + ex) }

          console.log("RESPONSE===" + jsonResponse);

          if (jsonResponse !== {} && jsonResponse !== undefined) {
            if (jsonResponse.response !== undefined) {
              if (jsonResponse.response.status === "ok")
                that.setState({data: jsonResponse.response.data, loading: false});
              else
                console.log("ERROR IN JSON RESPONSE::: " + jsonResponse.response.data)
            } // end if jsonResponse.response !== undefined
          } // end if jsonResponse !== {}
        }
      };

      xhttp.open("POST", requestURL);
      //xhttp.setRequestHeader("Cookie", "sessionid=" + sessionKey);
      xhttp.send(requestPayload);

    } catch (ex) { console.log("ERROR IN QUERY::: " + ex) }

    console.log("Completed query...");
    
  }

  login() {
    console.log("Attempting to login...");

    try {
      var requestPayload = "username=admin&password=admin"
      //var requestURL = "http://127.0.0.1:8000/xos/auth/login/"
      var requestURL = "https://10.42.32.109/xos/auth/login/"

      var xhttp = new XMLHttpRequest();

      var that = this;

      //xhttp.responseText, responseXML, status, statusText, readyState
      xhttp.onreadystatechange = function() {

        console.log("RESPONSE===" + this.responseText);
        console.log("Session Key===" + this.responseText.substring(this.responseText.indexOf("sessionkey")+12, this.responseText.indexOf("\"", this.responseText.indexOf("sessionkey")+12)));

        if (this.responseText.indexOf("sessionkey") > -1) {
          sessionKey = this.responseText.substring(this.responseText.indexOf("sessionkey") + 12, this.responseText.indexOf("\"", this.responseText.indexOf("sessionkey") + 12 ));
          //that.queryForTerminals();
        }

        if (this.readyState == 4 && this.status == 200) {
          //var xmlMsg = this.responseXML;
          //xmlMsg.getElementsByTagName('USERDETAIL')
        }
      };

      xhttp.open("POST", requestURL, "admin", "admin");
      xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
      //xhttp.setRequestHeader("Access-Control-Allow-Origin", "http://localhost:3000");
      xhttp.setRequestHeader("Access-Control-Allow-Credentials", "true");
      xhttp.send(requestPayload);

    } catch (ex) { console.log("ERROR IN LOGIN::: " + ex) }

    console.log("Completed login...");
  }


  render() {
    { if (sessionKey === "") this.login() }

    {
      if (this.state.data === null || this.state.data === undefined)
        this.setState({data: []});
    }

    const columns = [
    {
      Header: 'Time (UTC)',
      accessor: 'time',
      width: 175
    }, {
      Header: 'Longitude',
      accessor: 'long'
    }, {
      Header: 'Latitude',
      accessor: 'lat'
    }, {
      Header: 'Altitude',
      accessor: 'alt'
    }, {
      Header: 'Satellite_orbital_position',
      accessor: 'orbitalPosition'
    }, {
      Header: 'Satellite_inclination',
      accessor: 'inclination'
    }, {
      Header: 'Antenna_Azimuth',
      accessor: 'azimuth'
    }, {
      Header: 'Antenna_Elevation',
      accessor: 'elevation'
    }, {
      Header: 'Antenna_Polarization',
      accessor: 'polarization'
    }, {
      Header: 'Aircraft_Pitch_Axis',
      accessor: 'pitch'
    }, {
      Header: 'Aircraft_Roll_Axis',
      accessor: 'roll'
    }, {
      Header: 'Aircraft_Yaw_Axis',
      accessor: 'yaw'
    }, {
      Header: 'Antenna_Hunt_frequency',
      accessor: 'huntFreq'
    }, {
      Header: 'MODEM_running_code – MBC/OPER',
      accessor: 'modemRunningCode'
    }, {
      Header: 'MODEM_uptime (3 OIDs)',
      accessor: 'modemUptime'
    }, {
      Header: 'MODEM_RX_lock',
      accessor: 'modemRxLock'
    }, {
      Header: 'MODEM_SYNC_status',
      accessor: 'modemSyncStatus'
    }, {
      Header: 'MODEM_L2_status',
      accessor: 'modemL2Status'
    }, {
      Header: 'MODEM_L3_status',
      accessor: 'modemL3Status'
    }, {
      Header: 'MODEM_RX_level',
      accessor: 'modemRxLevel'
    }, {
      Header: 'MODEM_Noise_level',
      accessor: 'modemNoiseLevel'
    }, {
      Header: 'MODEM_TX_capability A',
      accessor: 'modemTxCapA'
    }, {
      Header: 'MODEM_TX_capability B',
      accessor: 'modemTxCapB'
    }, {
      Header: 'MODEM_TX_capability C',
      accessor: 'modemTxCapC'
    }, {
      Header: 'MODEM_TX_SYNC_power',
      accessor: 'modemTxSyncPower'
    }, {
      Header: 'MODEM_CPU_utilization current',
      accessor: 'modemCPUCurrent'
    }, {
      Header: 'MODEM_CPU_utilization last 5 minutes',
      accessor: 'modemCPULastFive'
    }, {
      Header: 'MODEM_RF_cluster_code',
      accessor: 'modemRFCluster'
    }, {
      Header: 'MODEM_Packet_received_from_satellite',
      accessor: 'modemPacketRx'
    }, {
      Header: 'MODEM_Packet_transmit_from_satellite',
      accessor: 'modemPacketTx'
    }, {
      Header: 'MODEM_Bytes_received_from_satellite',
      accessor: 'modemBytesRx'
    }, {
      Header: 'MODEM_Bytes_transmit_from_satellite',
      accessor: 'modemBytesTx'
    }, {
      Header: 'MODEM_packet_drops',
      accessor: 'modemPacketDrops'
    }, {
      Header: 'Last_openAMIP_`B`_message',
      accessor: 'openAMIPB'
    }, {
      Header: 'Last_openAMIP_`E`_message',
      accessor: 'openAMIPE'
    }, {
      Header: 'Last_openAMIP_`H`_message',
      accessor: 'openAMIPH'
    }, {
      Header: 'Last_openAMIP_`I`_message',
      accessor: 'openAMIPI'
    }, {
      Header: 'Last_openAMIP_`K`_message',
      accessor: 'openAMIPK'
    }, {
      Header: 'Last_openAMIP_`L`_message',
      accessor: 'openAMIPL'
    }, {
      Header: 'Last_openAMIP_`P`_message',
      accessor: 'openAMIPP'
    }, {
      Header: 'Last_openAMIP_`S`_message',
      accessor: 'openAMIPS'
    }, {
      Header: 'Last openAMIP_`T`_message',
      accessor: 'openAMIPT'
    }, {
      Header: 'Last openAMIP_`i`_message',
      accessor: 'openAMIPLoweri'
    }, {
      Header: 'Last openAMIP_`s`_message',
      accessor: 'openAMIPLowers'
    }, {
      Header: 'Last openAMIP_`w`_message',
      accessor: 'openAMIPw'
    }, {
      Header: 'Last openAMIP_`X`_message',
      accessor: 'openAMIPX'
    }, {
      Header: 'Last openAMIP_`A`_message',
      accessor: 'openAMIPA'
    }, {
      Header: 'MODEM TX Mute (0/Mute cause)',
      accessor: 'modemTxMute'
    }, {
      Header: 'All MODEM Discrete lines Input and outputs status',
      accessor: 'modemAllDiscrete'
    }, {
      Header: 'KANDU TX Mute status (0 / Mute cause)',
      accessor: 'kanduTxMute'
    }, {
      Header: 'Elevator trim offset',
      accessor: 'elevatorTrimOffset'
    },{
      Header: 'Establish Homing',
      accessor: 'establishHoming'
    }, {
      Header: 'Last Homing step errors',
      accessor: 'lastHomingStepErrors'
    } ]


    return (

          <div className="App">

            <header className="App-header">
              <div className="App-header-nav">

              </div>

              <div className="App-header-clock">
                <Clock format={'MMMM DD, YYYY hh:mm:ss z'} ticking={true} timezone={'UTC'} />
              </div>
            </header>

            <div className="App-header-content-spacer">&nbsp;</div>

            <div className="App-content">
              <Loadable active ={ this.state.loading } spinner spinnerSize='200px' text='Loading.... Please wait'>
                <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
                  <Tab eventKey={1} title="Report 1">
                    <div className="Report-title">
                      <h3>Flight Report 1</h3>
                    </div>

                    <div>

                      <Form componentClass="fieldset" inline>
                        <FormGroup controlId="formValidationWarning4" validationState="warning">
                          <Datetime ID="report1Start" input="false" onChange={this.onStartDateChange} inputProps={{ placeholder: 'Enter Start date'}}/>
                        </FormGroup>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <FormGroup controlId="formValidationWarning4" validationState="warning">
                          <Datetime ID="reportEnd" input="false" onChange={this.onEndDateChange} inputProps={{ placeholder: 'Enter End date'}}/>
                        </FormGroup>

                        <FormGroup>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <ControlLabel><div className="Report-options"></div></ControlLabel>
                          <Button bsStyle="primary" type="button" onClick={() =>{this.processFlightReport()}}>Generate</Button>
                          &nbsp;&nbsp;&nbsp;
                          <ControlLabel><div className="Report-options"></div></ControlLabel>
                          <Button bsStyle="primary" type="button" onClick={() =>{this.exportToCSV()}}>Export To CSV</Button>

                        </FormGroup>
                      </Form>

                    </div>

                    <div className="Report-content">
                      <br />
                      <ReactTable data={this.state.data} columns={columns} defaultPageSize={10} className="-highlight"/>
                    </div>
                  </Tab>
                  <Tab eventKey={2} title="Report 2">
                    <div className="Report-content">

                      Flight Report 2

                    </div>
                  </Tab>
                  <Tab eventKey={3} title="Report 3">
                    <div className="Report-content">

                      Flight Report 3

                    </div>
                  </Tab>
                   <Tab eventKey={4} title="Report 4">
                    <div className="Report-content">

                      Flight Report 4

                    </div>
                  </Tab>
                   <Tab eventKey={5} title="Report 5">
                    <div className="Report-content">

                      Flight Report 5

                    </div>
                  </Tab>
                </Tabs>
              </Loadable>
            </div>
        </div>

    );
  }
}



export default App;
