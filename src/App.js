import React, { Component } from 'react';
import logo from './logo.svg';
import Clock from 'react-live-clock';
import {Tabs, Tab, ControlledTabs} from 'react-bootstrap';
import Datetime from 'react-datetime';

import './App.css';

var sessionKey = "";
var reportName = "defaultReport";

class App extends Component {

  constructor(props){
    super(props);

    this.login = this.login.bind(this);
    this.queryForTerminals = this.queryForTerminals.bind(this);
    this.tabChange = this.tabChange.bind(this);
  }

  componentWillMount() {
    //not doing anything here, it's too soon in the lifecycle
  }

  componentDidMount() {

  }

  tabChange(key) {
    alert(`selected ${key}`);
    this.setState({ key });
  }

  queryForTerminals() {
    console.log("Attempting to query...");

    try {
      var requestPayload = "username=admin&password=admin"
      var requestURL = "https://10.42.32.109/xos/summary/getlist/terminals/"

      var xhttp = new XMLHttpRequest();
      //xhttp.setDisableHeaderCheck(true);

      //xhttp.responseText, responseXML, status, statusText, readyState
      xhttp.onreadystatechange = function() {
        console.log("RESPONSE===" + this.responseText);
      };

      xhttp.open("GET", requestURL);
      xhttp.setRequestHeader("Cookie", "sessionid=" + sessionKey);
      xhttp.send();

    } catch (ex) { console.log("ERRROR IN QUERY::: " + ex) }

    console.log("Completed query...");
  }

  login(){
    console.log("Attempting to login...");

    try {
      var requestPayload = "username=admin&password=admin"
      var requestURL = "https://10.42.32.109/xos/auth/login/"

      var xhttp = new XMLHttpRequest();

      var that = this;

      //xhttp.responseText, responseXML, status, statusText, readyState
      xhttp.onreadystatechange = function() {

        console.log("RESPONSE===" + this.responseText);
        console.log("Session Key===" + this.responseText.substring(this.responseText.indexOf("sessionkey")+12, this.responseText.indexOf("\"", this.responseText.indexOf("sessionkey")+12)));

        if (this.responseText.indexOf("sessionkey") > -1) {
          sessionKey = this.responseText.substring(this.responseText.indexOf("sessionkey") + 12, this.responseText.indexOf("\"", this.responseText.indexOf("sessionkey") + 12 ));
          that.queryForTerminals();
        }


        if (this.readyState == 4 && this.status == 200) {
          //var xmlMsg = this.responseXML;
          //xmlMsg.getElementsByTagName('USERDETAIL')
        }
      };

      xhttp.open("POST", requestURL, "admin", "admin");
      //xhttp.setRequestHeader("Access-Control-Allow-Origin", "http://localhost:3000");
      //xhttp.setRequestHeader("Access-Control-Allow-Credentials", "true");
      xhttp.send(requestPayload);

    } catch (ex) { console.log("ERROR IN LOGIN::: " + ex) }

    console.log("Completed login...");
  }


  render() {
      { if (sessionKey === "") this.login() }

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

                <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
                  <Tab eventKey={1} title="Report 1">
                    <div className="Report-title">
                      <h3>Flight Report 1</h3>
                    </div>

                    <div className="Report-options">

                        <font className="Report-title">Start Date:</font><Datetime ID="report1Start" input="false"/>
                        <font className="Report-title">End Date:</font> <Datetime ID="report1End" />

                    </div>

                    <div className="Report-content">

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

            </div>
        </div>

    );
  }
}



export default App;
