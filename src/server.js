var express = require('express');
var app = express();
var server = require('http').Server(app);
var SSH = require('simple-ssh');

const pemPath = "/Users/molin/nodes/tps.pem";
var ip = [
  "13.52.12.162",
  "13.57.17.171",
  "54.153.73.29",
  "52.53.170.147",
  "54.183.75.104",
  "54.215.206.244",
  "54.193.70.232",
  "54.67.125.24",
  "54.183.108.21",
  "13.57.184.169",
  "52.53.208.49",
  "18.144.7.50",
  "52.53.187.21",
  "54.193.4.120",
  "54.215.237.101",
  "13.52.104.84",
  "54.183.245.167",
  "52.8.159.41",
  "54.183.81.113",
  "54.183.58.115"
]

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
let retInfo = ""
function bootnodeRun(cmd, callback) {
  console.log(cmd);
  retInfo = ""
  var ssh = new SSH({
    host: ip[0],
    user: "ubuntu",
    key: require('fs').readFileSync(pemPath)
  });
  console.log("cd tpsTest &&" + cmd)
  ssh.exec("cd tpsTest &&" + cmd, {
    out: function (stdout) {
      console.log(stdout);
      retInfo+=stdout;
    },
    exit: function(code) {
      console.log(code); // 69
      callback(retInfo);
    }
  }).start();
}

app.get('/curl', async function (req, res) {
  try {
    bootnodeRun('curl ifconfig.me', (info)=>{
      let ret = {}
      ret.info = info;
      res.send(ret);
    })
  } catch (error) {
    console.log(error)
    res.send(error)
  }
});

app.get('/start', async function (req, res) {
  try {
    bootnodeRun('./start.sh',  (info)=>{
      let ret = {}
      ret.info = info;
      res.send(ret);
    })
  } catch (error) {
    console.log(error)
    res.send(error)
  }
});

app.get('/stop', async function (req, res) {
  try {
    bootnodeRun('./stop.sh',  (info)=>{
      let ret = {}
      ret.info = info;
      res.send(ret);
    })
  } catch (error) {
    console.log(error)
    res.send(error)
  }
});

app.get('/clean', async function (req, res) {
  try {
    bootnodeRun('./clean.sh',  (info)=>{
      let ret = {}
      ret.info = info;
      res.send(ret);
    })
  } catch (error) {
    console.log(error)
    res.send(error)
  }
});

app.get('/update', async function (req, res) {
  try {
    bootnodeRun('./update.sh',  (info)=>{
      let ret = {}
      ret.info = info;
      res.send(ret);
    })
  } catch (error) {
    console.log(error)
    res.send(error)
  }
});

app.get('/sendTx', async function (req, res) {
  try {
    bootnodeRun('./sendTx.sh',  (info)=>{
      let ret = {}
      ret.info = info;
      res.send(ret);
    })
  } catch (error) {
    console.log(error)
    res.send(error)
  }
});

app.get('/stopTx', async function (req, res) {
  try {
    bootnodeRun('./txStop.sh',  (info)=>{
      let ret = {}
      ret.info = info;
      res.send(ret);
    })
  } catch (error) {
    console.log(error)
    res.send(error)
  }
});

app.get('/txlog', async function (req, res) {
  try {
    bootnodeRun('./txlog.sh',  (info)=>{
      let ret = {}
      ret.info = info;
      res.send(ret);
    })
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
    key: require('fs').readFileSync(pemPath)
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
              if (stdout && stdout.length > 5)
                dataSource[i].number = stdout.slice(7);
            }
          }
        }
      })
      .exec(cmdElapsed, {
        out: function (stdout) {
          for (let i = 0; i < ip.length; i++) {
            if (dataSource[i].ip == ssh.host) {
              if (stdout && stdout.length > 5)
                dataSource[i].elapsed = stdout.slice(13);
            }
          }
        }
      })
      .exec(cmdTx, {
        out: function (stdout) {
          for (let i = 0; i < ip.length; i++) {
            if (dataSource[i].ip == ssh.host) {
              if (stdout && stdout.length > 4)
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