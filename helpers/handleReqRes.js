// Dpendencies
const { StringDecoder } = require("string_decoder");
const url = require("url");

//handle object - module scaffolding
const handle = {};

handle.handleReqRes = (req, res) => {
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

module.exports = handle;
