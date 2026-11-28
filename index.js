/* 
Title: Uptime Monitoring Application
Description: A simple uptime monitoring application that tracks the uptime of a server.
Author: Md. Habib Ullah Rahat
Date: 14 Nov 2026
*/
const server = require("./lib/server");
const worker = require("./lib/worker.js");

const app = {};

app.init = () => {
	//start the server
	server.init();
	//start the worker
	worker.init();
};

app.init();
