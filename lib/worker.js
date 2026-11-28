const { verify } = require("../helpers/types");
const { parseJson } = require("../helpers/utilites");
const { filesList, read } = require("./data");
const url = require("url");
const http = require("http");
const https = require("https");

const worker = {};

worker.validateData = (checkdata) => {
	const check_data = verify(checkdata);
	check_data.state =
		typeof check_data.state === "string" && ["up", "down"].includes(check_data.state)
			? check_data.state
			: "down";
	check_data.last_checked =
		typeof check_data === "number" && check_data.last_checked > 0
			? check_data.last_checked
			: false;
	worker.performCheck(check_data);
};

worker.performCheck = (check_data) => {
	let check_outcome = {
		error: false,
		value: false,
	};
	let outcomesSent = false;
	//parse url
	parsedUrl = url.parse(`${check_data.protocol}://${check_data.url}`, true); //true for query string
	const hostname = parsedUrl.hostname;
	const path = parsedUrl.path;

	const requestOptions = {
		protocol: check_data.protocol + ":",
		hostname: hostname,
		method: check_data.method.toUpperCase(),
		path: path,
		timeout: check_data.timeout * 1000,
	};
	const requestProtocols = {
		http,
		https,
	};
	const req = requestProtocols[check_data.protocol].request(requestOptions, (res) => {
		let statusCode = res.statusCode;
		//update the check outcome
		check_outcome.resposeCode = statusCode;
		if (!outcomesSent) {
			worker.processCheckOutcome(check_data, check_outcome);
			outcomesSent = true;
		}
	});

	req.on("error", (e) => {
		check_outcome.error = true;
		check_outcome.value = e;
		if (!outcomesSent) {
			worker.processCheckOutcome(check_data, check_outcome);
			outcomesSent = true;
		}
	});

	req.on("timeout", () => {
		check_outcome.error = true;
		check_outcome.value = "timeout";
		if (!outcomesSent) {
			worker.processCheckOutcome(check_data, check_outcome);
			outcomesSent = true;
		}
	});
};
// TODO: write a function to save and update database and we left at 51:00
worker.gatherAllChecks = () => {
	filesList("checks", (err_file_list, files) => {
		if (!err_file_list && files) {
			files.forEach((f) => {
				read("checks", f, (err_read_check_data, check_data) => {
					if (!err_read_check_data && check_data) {
						const checkData = parseJson(check_data);
						if (checkData.id) {
							worker.validateData(checkData);
						} else {
							console.log("ID is missing");
						}
					} else {
						console.log(`Something went wrong while reading the check data for  ${f}`);
					}
				});
			});
		} else {
			console.log("Errors in fetching the files", err);
		}
	});
};

worker.loop = () => {
	setInterval(() => {
		worker.gatherAllChecks();
	}, 1000 * 60);
};

worker.init = () => {
	// execute every checks
	worker.gatherAllChecks();

	//call the loop so that checks will be checked every second and in any check times to check it will check
	// worker.loop();
};

module.exports = worker;
