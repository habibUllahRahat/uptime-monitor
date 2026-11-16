//Dependencies
const { sampleHandler } = require("./handlers/routeHandlers/sampleHandler");
const { notFoundHandler } = require("./handlers/routeHandlers/notFoundHandler");

// routes object - module scaffolding
const routes = {
	sample: sampleHandler,
	notFound: notFoundHandler,
};

module.exports = routes;
