const { generateHash, parseJson, createRandomString } = require("../../helpers/utilites.js");

const lib = require("../../lib/data.js");
const handler = {};
handler._token = {};

handler.tokenHandler = (requestProperties, callback) => {
	const acceptedMethods = ["get", "post", "put", "delete"];

	if (acceptedMethods.includes(requestProperties.method)) {
		handler._token[requestProperties.method](requestProperties, callback);
	} else {
		callback(405, {
			message: "Request method not allowed",
		});
	}
};
//Token based is used for authentication, user uses token to access data for each request securely cause token is unique and can be verified by server. this was made for reduce authentication and authorization every time user login and access data. we will provide token in header of request and server will verify it and allow access to data. this is used for secure data access and prevent unauthorized access to data.

handler._token.post = (requestProperties, callback) => {
	const user = requestProperties.body;
	const password =
		typeof user.password === "string" && user.password.trim().length > 0
			? user.password.trim()
			: null;
	const phone =
		typeof user.phone === "string" && user.phone.trim().length == 11 ? user.phone : null;

	if (phone && password) {
		lib.read("user", phone, (err, data) => {
			if (!err && data) {
				const user = { ...parseJson(data) };
				const hash = generateHash(password);
				if (user.password === hash) {
					lib.filesList("tokens", (err, files) => {
						if (!err && files) {
							let temptoken = createRandomString(20);
							while (files.includes(temptoken)) {
								temptoken = createRandomString(20);
							}
							const tokenObj = {
								phone,
								id: temptoken,
								expires: Date.now() + 60 * 60 * 1000,
							};
							lib.create("tokens", temptoken, tokenObj, (err_tc) => {
								if (!err_tc) {
									callback(200, tokenObj);
								} else {
									callback(500, {
										message: "There is a problem with server side",
									});
								}
							});
						}
					});
				}
			} else {
				callback(400, {
					message: "Phone or Password is invalid",
				});
			}
		});
	} else {
		callback(400, {
			message: "Invalid phone number or password",
		});
	}
};

// Here we used GET method to get token value cause browser will need to verify token

handler._token.get = (requestProperties, callback) => {
	const { id } = requestProperties.queryString;
	const token = typeof id === "string" && id.trim().length === 20 ? id : null;
	if (token) {
		lib.read("tokens", token, (err, data) => {
			const tokenObj = parseJson(data);

			if (!err && data) {
				if (tokenObj.expires < Date.now()) {
					callback(200, { message: "Token Expired" });
				} else {
					callback(200, tokenObj);
				}
			} else {
				callback(404, { message: "Token not found" });
			}
		});
	} else {
		callback(404, { message: "Invalid token" });
	}
};

handler._token.put = (requestProperties, callback) => {
	const req = requestProperties.body;
	const id = typeof req.id === "string" && req.id.trim().length === 20 ? req.id : null;
	const extend = typeof req.extend === "boolean" && req.extend === true;
	if (id && extend) {
		lib.read("tokens", id, (err, data) => {
			if (!err && data) {
				const tokenObj = parseJson(data);
				if (tokenObj.expires < Date.now()) {
					callback(200, { message: "Token Expired" });
				} else {
					const expires = Date.now() + 60 * 60 * 1000;
					lib.update("tokens", id, { expires }, (err, data) => {
						if (!err && data) {
							callback(200, {
								message: "Token updated",
								new_expire: new Date(expires).toLocaleString(),
							});
						} else {
							callback(500, { message: "There is some error with Server Site" });
						}
					});
				}
			} else {
				callback(404, { message: "Token not found" });
			}
		});
	} else {
		callback(404, { message: "Invalid token" });
	}
};

handler._token.delete = (requestProperties, callback) => {
	const req = requestProperties.queryString;
	const id = typeof req.id === "string" && req.id.trim().length === 20 ? req.id : null;
	if (id) {
		lib.checkFileExists("tokens", id, (exists) => {
			if (exists) {
				lib.delete("tokens", id, (err) => {
					if (!err) {
						callback(200, { message: `${id} deleted success fully` });
					} else {
						callback(500, { message: "There is some error with Server Site" });
					}
				});
			} else {
				callback(404, { message: "Invalid Token" });
			}
		});
	} else {
		callback(404, { message: "Invalid Token" });
	}
};

handler._token.verify = (id, phone, callback) => {
	const token = typeof id === "string" && id.trim().length > 0 ? id : null;
	const token_phone = typeof phone === "string" && phone.trim().length === 11 ? phone : null;

	if (!token || !token_phone) return callback(false);

	lib.read("tokens", token, (err, tokenData) => {
		const tokenObj = parseJson(tokenData);

		if (!err && tokenObj) {
			if (token_phone === tokenObj.phone && tokenObj.expires > Date.now()) {
				callback(true);
			} else {
				callback(false);
			}
		} else {
			callback(false);
		}
	});
};

module.exports = handler;
