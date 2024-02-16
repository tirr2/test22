const net = require('net');
const https = require('https');
const fs = require('fs')
const WebSocketServer = require("ws").Server

const http = require('http');
const url = require('url');

let server = http.createServer((req,res)=>{
  if(req.url == '/') req.url = '/index.html'

  if(req.url.includes('/message')){
    console.log('new message: ', req.headers['x-forwarded-for'])
    console.log(req.url.split('?')[1])
    console.log(decodeURIComponent(req.url.split('?')[1]))
    return response.end('ok', 'utf-8');
  }

  fs.readFile(__dirname + req.url, function (err,data) {
    if (err) return res.writeHead(404).end(JSON.stringify(err));
    res.setHeader("Content-Type","text/html");
    res.writeHead(200);

    res.end(data);
  });
})
server.listen(process.env.PORT)


let peers = {}
new WebSocketServer({server}).on("connection", (ws, req)=>{

  console.log("ws connection open "+req.url, req.headers['x-forwarded-for'])

  peers[req.url] = peers[req.url] || []
  if(peers[req.url].length <= 2){ //max 2 viewer + streamer
    peers[req.url].push(ws)
    peers[req.url].forEach( ws => ws.send(`{"peers": ${peers[req.url].length-1}}`))
  }else{
    console.log('room limit vvv')
    return
  }

  ws.on("close", ()=>{
    peers[req.url] = peers[req.url].filter(i => i != ws)
    peers[req.url].forEach( ws => ws.send(`{"peers": ${peers[req.url].length-1}}`))
  })
  
  ws.on("message", (data)=>{
    peers[req.url].filter(i => i != ws).forEach( ws => ws.send(data))
  })
})


