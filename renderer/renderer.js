// In renderer process (web page).

//electron consts
const remote = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
var sys_info = remote.getGlobal('sys_info');

// var socket         = io();
var socket = require('socket.io-client')('http://localhost:3000');
var frp            = require('frpjs'),
    input          = frp.dom.select('input'),
    submitEvents   = frp.dom.onSubmit(frp.dom.select('form')),
    filteredEvents = frp.filter(submitEvents, () => !!input.value.length)

function handleSend (argument) {
	console.log('handle send:'+argument)
}
function handleRecieve (argument) {
	console.log('handle send:'+argument)
}

filteredEvents(e => {
    socket.emit('chat message', input.value)
    handleSend(input.value);
    input.value = ''
    e.preventDefault()
})

socket.on('chat message', msg => {
    frp.dom.select('ul').appendChild(frp.dom.create('li', msg))
    handleRecieve(msg)	
})

  // socket.on('connect', function(){});
  // socket.on('event', function(data){});
  // socket.on('disconnect', function(){});

ipcRenderer.on('asynchronous-reply', function(event, arg) {
  console.log(`async reply with value: ${arg}.`); // prints "pong"
});

window.onload = function(e){ 
  console.log('window loaded');
}


