const http = require('http');
const express = require('express');
const app = express();

function Listen(){
    app.get("/", (request, response) => {
        console.log(Date.now() + " Ping Received");
        response.sendStatus(200);
      });
      app.listen(process.env.PORT);
      setInterval(() => {
        http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
      }, 280000);
}

module.exports.Listen = Listen;
