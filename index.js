/* 
Title: Uptime Monitoring Application
Description: A simple uptime monitoring application that tracks the uptime of a server.
Author: Md. Habib Ullah Rahat
Date: 14 Nov 2026
*/
/* 
We can add "nodemon" package to automatically restart the server when there are changes in the code.
To install nodemon,
run the following command in the terminal:
for specific project: pnpm add -D nodemon // uninstall : pnpm remove nodemon 
for global use: pnpm add -g nodemon // if we use this we don't need install nodemon for every project to uninstall it globally : pnpm remove -g nodemon
*/
/* 
srcipts in package.json
"scripts": {
	"start": "nodemon index" // if we use start we dont need use "run" word terminal: npm start
  "doe": "Hello World" // terminal : npm run doe || pnpm doe
}
*/

//Dependencies
const http = require("http"); //if it not work check the package.json cause there could be "type":"module" remove it
const { handleReqRes } = require("./helpers/handleReqRes");
const environment = require("./helpers/environment.js");
const data = require("./lib/data.js");
// app object - module scaffolding
const app = {};

data.delete(
	"test", //subfolder(it sould be already exist)
	"new_test_file", //it would be created if it not exist
	(err, data) => {
		console.log("Whatever happened success is:");
		console.log(err);
		console.log(data);
	},
);

//configuration
/*  app.config = {
	port: 3000, // good practice is use ENV value
};  */

//create server
app.createServer = () => {
	const server = http.createServer(app.hadleReqRes);
	server.listen(environment.port, () => {
		console.log(`env variable is ${process.env.NODE_ENV}`); // now if we run NODE_ENV=production it will print production
		console.log(`Server is running on port http://127.0.0.1:${environment.port}/`);
	});
};
/* ! Because our handle function became bigger so we will split into a helper file at handleReqRes.js it call code refactoring
//handle requests and responses
app.hadleReqRes = (req, res) => {
	//request handle
	//get the url and parse it
	const parsedUrl = url.parse(req.url, true); // syntax: url.parse(url, boolean value for gettng query string)

	//get the path
	const pathname = parsedUrl.pathname;
	const trimmePath = pathname.replace(/^\/+|$/g, ""); // ^: Start of string, \/: Escape forward slash, +: One or more occurrences, *: Zero or more occurrences, |: OR (alternation), $: End of string, /g: Global flag (match all occurrences).
	//method name
	const method = req.method.toLowerCase(); // toLowerCase() to convert the method name to lowercase cause it can be GET or get
	//query string
	const queryString = parsedUrl.query;
	//headers
	const headers = req.headers; //request meta data
	console.log(headers);
	//body -> before we leared decoding using buffer.toString(), now we will use Node.js preffered version which using StringDecoder class to decode the body
	const decoder = new StringDecoder("utf-8");
	let realData = "";
	req.on("data", (buffer) => {
		realData += decoder.write(buffer);
		// console.log(realData); //if data is small it will show here
	});
	req.on("end", () => {
		realData += decoder.end();
		console.log(`\nall data received, The realdata is: `, realData, "\n"); //data show full even though it is big cause it request.end() is called
		res.end("hello world, The realdata is: " + realData);
	});
	//ip
	const ip = req.connection.remoteAddress;
	//status code
	const statusCode = res.statusCode;
	//status message
	const statusMessage = res.statusMessage;
	//response handle
	res.end("Hello World, server is running!");
};
 */
app.hadleReqRes = handleReqRes;

//start the server
app.createServer();
