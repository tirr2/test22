const net = require('net');
const https = require('https');
const fs = require('fs')
const WebSocketServer = require("ws").Server

const http = require('http');
const url = require('url');

let server = http.createServer((req,res)=>{
  if(req.url == '/') req.url = '/index.html'
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

  peers[req.url] = peers[req.url] || []
  peers[req.url].push(ws)
  peers[req.url].forEach( ws => ws.send(`{"peers": ${peers[req.url].length-1}}`))
  console.log("ws connection open "+req.url, req.headers['x-forwarded-for'])

  ws.on("close", ()=>{
    peers[req.url] = peers[req.url].filter(i => i != ws)
    peers[req.url].forEach( ws => ws.send(`{"peers": ${peers[req.url].length-1}}`))
  })
  
  ws.on("message", (data)=>{
    peers[req.url].filter(i => i != ws).forEach( ws => ws.send(data))
  })
})


