//Dependencies
const { sampleHandler } = require("./handlers/routeHandlers/sampleHandler");
const { notFoundHandler } = require("./handlers/routeHandlers/notFoundHandler");
const { userHandler } = require("./handlers/routeHandlers/userHandler");

// routes object - module scaffolding
const routes = {
	sample: sampleHandler,
	user: userHandler,
	notFound: notFoundHandler,
};

module.exports = routes;
