// Dpendencies
const { StringDecoder } = require("string_decoder");
const url = require("url");
const routes = require("../routes.js");
//handle object - module scaffolding
const handle = {};

handle.handleReqRes = (req, res) => {
	const parsedUrl = url.parse(req.url, true); // syntax: url.parse(url, boolean value for gettng query string, slashesDenoteHost?: boolean)

	const pathname = parsedUrl.pathname; //get the path
	const trimmedPath = pathname.replace(/^\/+|$/g, "");
	/* 
	First /		Starts the regex
	^					Start of string
	\/				Matches a literal forward slash /
	+					One or more occurrences
	\|				OR (alternation)
	$					End of string
	Last /		Ends the regex
	g					Global flag to match all occurrences of the pattern in the string
	!Remember: The first and last / are delimiters. They are not part of the matching pattern.
	*/
	const method = req.method.toLowerCase(); // toLowerCase() to convert the method name to lowercase cause it can be GET or get
	const queryString = parsedUrl.query; //get query string
	const headers = req.headers; //headers has request meta data
	console.log(headers);
	//# body -> before we leared decoding using buffer.toString(), now we will use Node.js preffered version which using StringDecoder class to decode the body
	const decoder = new StringDecoder("utf-8");
	let realData = "";
	req.on("data", (buffer) => {
		realData += decoder.write(buffer);
		// console.log(realData); //if data is small it will show here
	});
	req.on("end", () => {
		realData += decoder.end();
		console.log(`\nall data received, The realdata is: `, realData, "\n"); //data show full even though it is big cause it request.end() is called
		chosenHandler(requestProperties, (statusCode, payload) => {
			statusCode = statusCode || 500;
			payload = typeof payload === "object" ? payload : { message: payload };

			const payloadString = JSON.stringify(payload);

			//final response
			res.setHeader("Content-Type", "application/json");
			res.writeHead(statusCode, { "Content-Type": "application/json" });
			res.end(payloadString);
		});
		// res.end("hello world, The realdata is: " + realData);
	});
	const requestProperties = {
		parsedUrl,
		pathname,
		trimmedPath,
		method,
		queryString,
		headers,
	};
	const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : routes.notFound;

	/* 
	//ip
	const ip = req.connection.remoteAddress;
	//status code
	const statusCode = res.statusCode;
	//status message
	const statusMessage = res.statusMessage;
	//response handle
	res.end("Hello World, server is running!");
	*/
};

module.exports = handle;
