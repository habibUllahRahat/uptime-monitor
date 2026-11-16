//Not Found Handler 404
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
	callback(404, {
		message: "Your request was not found",
	});
};

module.exports = handler;
