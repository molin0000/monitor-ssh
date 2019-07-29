import React from 'react';
import './App.css';
import { Table, Tag, Button, Modal } from 'antd';
import $ from 'jquery';
import { stringify } from 'querystring';

const { confirm } = Modal;

function showInfo(infoDisplay) {
  Modal.info({
    title: 'Return Info',
    content: (
      <div>
        <p>{JSON.stringify(infoDisplay)}</p>
      </div>
    ),
    onOk() {},
  });
}

export default class App extends React.Component {
  state = {
    dataSource: [],
    columns: [],
  }

  renderGwan = (gwan, record) => {
    if (!gwan) { return }
    let color = 'blue';
    if (gwan.includes('Dead')) {
      color = 'red';
    }
    return (<Tag color={color} key={record}>{gwan}</Tag>)
  }

  renderMem = (mem, record) => {
    if (!mem) { return }
    let color = 'green';
    if (mem.includes('G')) {
      if (Number(mem.slice(0, mem.length - 2)) > 10) {
        color = 'red';
      }
    }
    return (<Tag color={color} key={record}>{mem}</Tag>)
  }

  maxNumber = 0;

  renderNumber = (value, record) => {
    let color = 'green';
    if (!value) {
      color = 'red';
      return (<Tag color={color} key={record}>{'None'}</Tag>)
    }

    if (value > this.maxNumber) {
      this.maxNumber = value;
    }

    if (value < this.maxNumber - 10) {
      color = 'orange'
    }

    return (<Tag color={color} key={record}>{value}</Tag>)
  }

  renderElapsed = (value, record) => {
    let color = 'green';
    if (!value) {
      color = 'red';
      return (<Tag color={color} key={record}>{'None'}</Tag>)
    }

    if (value >= 5) {
      color = 'orange'
    }
    return (<Tag color={color} key={record}>{value}</Tag>)
  }

  renderTx = (value, record) => {
    let color = 'green';
    if (!value) {
      color = 'red';
      return (<Tag color={color} key={record}>{'None'}</Tag>)
    }

    if (value < 4000) {
      color = 'orange'
    }
    return (<Tag color={color} key={record}>{value}</Tag>)
  }

  info = () => {
    $.get(('http://localhost:8000/info'), function (result) {
      console.log(result)
      if (!result["dataSource"]) { return }
      result.columns[3].render = this.renderMem;
      result.columns[2].render = this.renderGwan;
      result.columns[4].render = this.renderNumber;
      result.columns[5].render = this.renderElapsed;
      result.columns[6].render = this.renderTx;


      this.setState({ dataSource: result.dataSource, columns: result.columns })
    }.bind(this));
  }

  componentDidMount() {
    this.info()
    setInterval(this.info, 5000, null);
  }

  handleStart = () => {
    this.showConfirm('start')
  }

  handleStop = () => {
    this.showConfirm('stop')
  }

  handleClean = () => {
    this.showConfirm('clean')
  }

  handleUpdate = () => {
    this.showConfirm('update')
  }

  handleSendTxs = () => {
    this.showConfirm('sendTx')
  }

  handleStopTxs = () => {
    this.showConfirm('stopTx')
  }

  handleShowTxsLog = () => {
    this.showConfirm('txlog')
  }

  showConfirm = (type) => {
    confirm({
      title: 'Do you want to ' + type + " all nodes?",
      content: 'Do you want to ' + type + " all nodes?",
      onOk() {
        $.get(('http://localhost:8000/'+type), function (result) {
          console.log(result);
          showInfo(result);
        });
      },
      onCancel() { },
    });
  }

  render() {
    const { dataSource, columns } = this.state;
    return (
      <div className="App">
        <div className="Head"></div>
        <div className="Body">
          <Button className="bt" onClick={this.handleStop}>Stop All</Button> 
          <Button className="bt" onClick={this.handleStart}>Start All</Button> 
          <Button className="bt" onClick={this.handleClean}>Clean All</Button> 
          <Button className="bt" onClick={this.handleUpdate}>Update All</Button> 
          <Button className="bt" onClick={this.handleSendTxs}>Send Txs</Button> 
          <Button className="bt" onClick={this.handleStopTxs}>Stop Txs</Button> 
          <Button className="bt" onClick={this.handleShowTxsLog}>Get Txs Log</Button> 
          <Table
            size="small"
            dataSource={dataSource} columns={columns} className="Table" pagination={{ pageSize: 50 }} />
        </div>
      </div>
    )
  }
}

