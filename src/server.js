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

process.on('uncaughtException', function (err) {
  console.log(err.message);
});

var ip = [
  "54.183.96.28",
  "54.183.109.137",
  "13.52.177.69",
  "18.208.157.240",
  "54.164.117.182",
  "54.209.25.73",
  "13.250.111.85",
  "54.255.206.98",
  "3.1.84.27",
  "35.178.249.98",
  "18.130.18.224",
  "18.130.232.161",
  "35.182.126.155",
  "99.79.49.226",
  "13.114.142.169",
  "13.231.238.48",
  "54.183.161.82",
  "54.254.175.138",
  "35.183.180.3",
  "54.238.164.38",
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
      .start()
  }
}

getGwanAlive();

setInterval(getGwanAlive, 30000, null);