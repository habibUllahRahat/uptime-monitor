//Dependencies

// sampleHandler object - module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
	console.log("This is Sample route\n", requestProperties);
	callback(200, {
		name: "sample handler",
	});
};

module.exports = handler;
