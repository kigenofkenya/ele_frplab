'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const config = require('./config.json');

global.config_main = config.config_main;
global.sys_info = {
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
    }
};

var windowCache = {};
var windowTmpls= {
  mainWindow:{
    file:'renderer/index.html',
    params:{width: 800, height: 600}
  },
  onlinestatusWindow:{
    file:'utils/online-status.html',
    params:{width: 0, height: 0, show: false}
  }  
};
  // onlineStatusWindow = new BrowserWindow({ width: 0, height: 0, show: false });
  // onlineStatusWindow.loadURL(`file://${__dirname}/online-status.html`);
  // mainWindow.loadURL(`file://${__dirname}/${config.file}`);
function createWindow (thisWin) {
  var winObj=windowTmpls[thisWin];
  var winFile=winObj.file;
  var winParams=winObj.params;
  windowCache[thisWin] = new BrowserWindow(winParams);
  windowCache[thisWin].loadURL('file://' + __dirname + '/'+winFile);
  // if (thisWin.devtools_enabled === true) {
  //   thisWin.webContents.openDevTools();
  // }
  windowCache[thisWin].on('closed', function() {
    windowCache[thisWin] = null;
  });
}

//object heler to reference direct function calls.
var funcRef = {
  test1:function (params,callback) {
    console.log('test 1 func called');
    callback('func with params:'+params);
  }
};

ipcMain.on('remoteFunc', function(event, args) {
  // console.log(args);  // prints "ping"
  funcRef[args.ref](args.params,function(rets) {
    event.sender.send(args.reply, rets);
  });
});

ipcMain.on('asynchronous-message', function(event, arg) {
  console.log('async message');
  console.log(arg);  // prints "ping"
  event.sender.send('asynchronous-reply', 'pong');
});

ipcMain.on('synchronous-message', function(event, arg) {
  console.log(arg);  // prints "ping"
  event.returnValue = 'pong';
});

ipcMain.on('online-status-changed', function(event, status) {
  console.log("internet connection is: "+status);
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (windowCache.mainWindow === null) {
    createWindow('mainWindow');
  }
});

app.on('ready', function() {
  createWindow('onlinestatusWindow');
  createWindow('mainWindow');
  if (config.devtools_enabled === true) {
    mainWindow.webContents.openDevTools();
  }    
});
