var express = require('express');
var app = express();
var server = require('http').Server(app);
var SSH = require('simple-ssh');

const pemPath = "/Users/molin/nodes/tps.pem";
var ip = [
  "13.52.12.162",
  "54.193.41.100",
  "52.53.245.247",
  "54.215.193.195",
  "18.144.15.102",
  "52.53.233.40",
  "54.219.177.161",
  "54.183.80.85",
  "13.57.185.215",
  "52.53.181.70",
  "13.56.19.212",
  "13.57.20.253",
  "52.53.125.23",
  "13.57.9.249",
  "13.57.235.134",
  "54.241.183.167",
  "13.56.236.79",
  "13.56.12.163",
  "18.144.15.174",
  "52.53.181.113"
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