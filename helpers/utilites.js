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

utilites.createRandomString = (length) => {
	if (typeof length === "number" && length > 0) {
		const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123";
		let output = "";
		for (let i = 0; i < length; i++) {
			const randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
			output += randomChar;
		}
		return output;
	} else {
		return null;
	}
};
module.exports = utilites;
