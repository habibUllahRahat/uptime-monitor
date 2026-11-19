const environments = {};
environments.staging = {
	port: 3000,
	envName: "staging",
};
environments.production = {
	port: 5000,
	envName: "production",
};

// determine which environment was passed, here process.env will be bring which environment is passed in the command line or like npm run production || npm start if production then it run on environments.production else statging object will be passed in the environment object
const currentEnvironment =
	typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";

// expot corresponding environment object
const environmentToExport =
	typeof environments[currentEnvironment] === "object"
		? environments[currentEnvironment]
		: environments.staging;

module.exports = environmentToExport;
