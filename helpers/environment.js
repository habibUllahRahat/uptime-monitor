const environments = {};
environments.development = {
	port: 3000,
	envName: "development",
	secretKey: "asdfasfdaghhjrtwrtymndfgth",
	twilio: {
		fromPhone: "",
		accountSid:"",
		authToken:"",
	},
};
environments.staging = {
	port: 4000,
	envName: "staging",
	secretKey: "sdfasgghsdfghsdfgsdfgwerty",
	twilio: {
		fromPhone: "",
		accountSid:"",
		authToken:"",
	},
};
environments.production = {
	port: 5000,
	envName: "production",
	secretKey: "sdfasggsdffuiruthjioerjtoi",
	twilio: {
		fromPhone: "",
		accountSid:"",
		authToken:"",
	},
};

// determine which environment was passed, here process.env will be bring which environment is passed in the command line or like npm run production || npm start if production then it run on environments.production else statging object will be passed in the environment object
const currentEnvironment =
	typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "development";

// expot corresponding environment object
const environmentToExport =
	typeof environments[currentEnvironment] === "object"
		? environments[currentEnvironment]
		: environments.staging;

module.exports = environmentToExport;
