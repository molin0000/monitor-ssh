var express = require('express');
var app = express();
var server = require('http').Server(app);
var SSH = require('simple-ssh');

//allow custom header and CORS
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.send(200);
  }
  else {
    next();
  }
});

app.use(express.static("build"));

let dataSource = [];

const columns = [
  {
    title: 'Index',
    dataIndex: 'key',
    key: 'key',
  },
  {
    title: 'IP Address',
    dataIndex: 'ip',
    key: 'ip',
  },
  {
    title: 'Gwan status',
    dataIndex: 'gwan',
    key: 'gwan',
  },
  {
    title: 'Memory Used',
    dataIndex: "memory",
    key: "memory",
  },
  {
    title: 'Number',
    dataIndex: "number",
    key: "number",
  },
  {
    title: 'Elapsed',
    dataIndex: "elapsed",
    key: "elapsed",
  },
  {
    title: 'Tx Count',
    dataIndex: "tx",
    key: "tx",
  },
];

app.get('/info', async function (req, res) {
  try {
    let info = {}
    info.columns = columns;
    info.dataSource = dataSource;
    res.send(info)
  } catch (error) {
    console.log(error)
    res.send(error)
  }
});

const port = 8000;
server.listen(port);
console.log('listening on port ', port);

var cmdPs = "ps -ef |grep -w gwan|grep -v grep|wc -l"
var cmdMemory = "free -h|awk '{print $3}'|sed -n '2p'"
var cmdNumber = "tail -n 100 out.log|grep Imported|awk '{print $12}'|sed -n \"\`tail -n 100 out.log|grep Imported|wc -l\`p\""
var cmdElapsed = "tail -n 100 out.log|grep Imported|awk '{print $14}'|sed -n \"\`tail -n 100 out.log|grep Imported|wc -l\`p\""
var cmdTx = "tail -n 100 out.log|grep Imported|awk '{print $8}'|sed -n \"\`tail -n 100 out.log|grep Imported|wc -l\`p\""


process.on('uncaughtException', function (err) {
  console.log(err.message);
});

var ip = [
  "54.183.96.28",
  "54.183.109.137",
  "13.52.177.69",
  "54.183.161.82",
  "13.57.201.142",
  "54.67.35.168",
  "54.67.21.114",
  "54.193.55.156",
  "54.219.168.113",
  "54.215.234.113",
  "54.215.139.110",
  "54.193.115.26",
  "54.183.221.51",
  "13.57.24.81",
  "54.241.154.82",
  "18.144.28.82",
  "54.183.231.67",
  "54.183.56.69",
  "13.52.187.84",
  "52.53.166.14",
  ]

for (let i = 0; i < ip.length; i++) {
  const ipAddr = ip[i];
  dataSource.push({ key: i, ip: ipAddr, gwan: 'Dead' })
}

var sshs = []
for (let i = 0; i < ip.length; i++) {
  const ipaddr = ip[i];
  var ssh = new SSH({
    host: ipaddr,
    user: "ubuntu",
    key: require('fs').readFileSync('/Users/molin/nodes/tps.pem')
  });

  sshs.push(ssh);
}

function getGwanAlive() {
  console.log('getGwanAlive')
  for (let i = 0; i < sshs.length; i++) {
    const ssh = sshs[i];
    ssh
      .exec(cmdPs, {
        out: function (stdout) {
          for (let i = 0; i < ip.length; i++) {
            if (dataSource[i].ip == ssh.host) {
              if (Number(stdout) >= 1) {
                dataSource[i].gwan = 'Alive'
              } else {
                dataSource[i].gwan = 'Dead'
              }
            }
          }
        }
      })
      .exec(cmdMemory, {
        out: function (stdout) {
          for (let i = 0; i < ip.length; i++) {
            if (dataSource[i].ip == ssh.host) {
              dataSource[i].memory = stdout;
            }
          }
        }
      })
      .exec(cmdNumber, {
        out: function (stdout) {
          for (let i = 0; i < ip.length; i++) {
            if (dataSource[i].ip == ssh.host) {
              if (stdout && stdout.length>5)
              dataSource[i].number = stdout.slice(7);
            }
          }
        }
      })
      .exec(cmdElapsed, {
        out: function (stdout) {
          for (let i = 0; i < ip.length; i++) {
            if (dataSource[i].ip == ssh.host) {
              if (stdout && stdout.length>5)
              dataSource[i].elapsed = stdout.slice(13);
            }
          }
        }
      })
      .exec(cmdTx, {
        out: function (stdout) {
          for (let i = 0; i < ip.length; i++) {
            if (dataSource[i].ip == ssh.host) {
              if (stdout && stdout.length>4)
              dataSource[i].tx = stdout.slice(4);
            }
          }
        }
      })
      .start()
  }
}

getGwanAlive();

setInterval(getGwanAlive, 30000, null);