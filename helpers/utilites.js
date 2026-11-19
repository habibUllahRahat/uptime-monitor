const crypto = require("crypto");
const environment = require("./environment");

const utilites = {};
//parse json string to object
utilites.parseJson = (jsonString) => {
	try {
		return JSON.parse(jsonString);
	} catch (error) {
		return jsonString;
	}
};

utilites.generateHash = (str) => {
	if (typeof str === "string" && str.trim().length > 0) {
		const hash = crypto.createHmac("sha256", environment.secretKey).update(str).digest("hex");
		return hash;
	} else {
		return null;
	}
};

module.exports = utilites;
