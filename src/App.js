import React from 'react';
import './App.css';
import { Table, Tag } from 'antd';
import $ from 'jquery';

export default class App extends React.Component {
  state = {
    dataSource : [],
    columns : [],
  }
  
  renderGwan = (gwan, record)=>{
    if(!gwan){return}
    let color = 'blue';
    if(gwan.includes('Dead')) {
      color = 'red';
    }
    return (<Tag color={color} key={record}>{gwan}</Tag>)
  }

  renderMem = (mem, record)=>{
    if(!mem){return}
    let color = 'green';
    if(mem.includes('G')) {
      if(Number(mem.slice(0, mem.length - 2))>10) {
        color = 'red';
      }
    }
    return (<Tag color={color} key={record}>{mem}</Tag>)
  }

  maxNumber = 0;

  renderNumber = (value, record)=>{
    let color = 'green';
    if(!value) {
      color = 'red';
      return (<Tag color={color} key={record}>{'None'}</Tag>)
    }

    if(value > this.maxNumber) {
      this.maxNumber = value;
    }

    if(value< this.maxNumber - 10) {
      color = 'orange'
    }

    return (<Tag color={color} key={record}>{value}</Tag>)
  }

  info = ()=>{
    $.get(('http://localhost:8000/info'), function(result) {
      console.log(result)
      if(!result["dataSource"]) { return }
      result.columns[3].render = this.renderMem;
      result.columns[2].render = this.renderGwan;
      result.columns[4].render = this.renderNumber;

      this.setState({dataSource: result.dataSource, columns: result.columns})
    }.bind(this));
  }

  componentDidMount() {
    this.info()
    setInterval(this.info, 5000, null);
  }

  render() {
    const {dataSource, columns} = this.state;
    return (
      <div className="App">
        <div className="Head"></div>
        <div className="Body">
          <Table 
          size="small"
          dataSource={dataSource} columns={columns} className="Table" pagination={{ pageSize: 50 }} />
        </div>
      </div>
    )
  }
}

