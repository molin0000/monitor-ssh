import React from 'react';
import './App.css';
import { Table } from 'antd';
import $ from 'jquery';

export default class App extends React.Component {
  dataSource = [];
  columns = [];

  componentDidMount() {
    setInterval(()=>{
      $.get(('http://localhost:8000'), function(result) {
        console.log(result)
        if(!result["dataSource"]) { return }
        this.dataSource = result.dataSource;
        this.columns = result.columns;
      }.bind(this));
    }, 5000, null);
  }

  render() {
    return (
      <div className="App">
        <div className="Head"></div>
        <div className="Body">
          <Table dataSource={this.dataSource} columns={this.columns} className="Table" />
        </div>
      </div>
    )
  }
}

