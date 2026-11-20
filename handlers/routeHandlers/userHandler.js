//Dependencies
const { generateHash, parseJson } = require("../../helpers/utilites.js");
const {
	_token: { verify },
} = require("./tokenHandler.js");
const lib = require("../../lib/data.js");
// sampleHandler object - module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
	const acceotedMethods = ["get", "post", "put", "delete"];

	if (acceotedMethods.includes(requestProperties.method)) {
		handler._user[requestProperties.method](requestProperties, callback);
	} else {
		callback(405, {
			//satus code : 405 = Method Not Allowed
			message: "Request method not allowed",
		});
	}
};

//an object is made to contain our methods functions
handler._user = {}; // here _user stand for private properties of the handler

/* 
# The user will have:
firstName
lastName
password
phone
tosAgreement boolean
 */

handler._user.get = (requestProperties, callback) => {
	const phone =
		typeof requestProperties.queryString.phone === "string" &&
		requestProperties.queryString.phone.trim().length === 11
			? requestProperties.queryString.phone
			: null;

	const headers = requestProperties.headers;
	const { token } = headers;
	if (phone) {
		verify(token, phone, (verified) => {
			if (verified) {
				lib.read("user", phone, (err, data) => {
					if (!err && data) {
						const user = { ...parseJson(data) };
						const password = new String("#", user.password.length);
						delete user.password;
						user.password = password;
						callback(200, user);
					} else {
						callback(404, {
							message: "User not found while reading file",
							error: err,
						});
					}
				});
			} else {
				callback(403, { message: "Not authorized" });
			}
		});
	}
};

handler._user.post = (requestProperties, callback) => {
	const user = requestProperties.body;
	const firstName =
		typeof user.firstName === "string" && user.firstName.trim().length > 0
			? user.firstName.trim()
			: null;
	const lastName =
		typeof user.lastName === "string" && user.lastName.trim().length > 0
			? user.lastName.trim()
			: null;
	const password =
		typeof user.password === "string" && user.password.trim().length > 0
			? user.password.trim()
			: null;
	const phone =
		typeof user.phone === "string" && user.phone.trim().length == 11 ? user.phone : null;
	const tosAgreement = typeof user.tosAgreement === "boolean" ? user.tosAgreement : false;

	if (firstName && lastName && password && phone) {
		lib.checkFileExists("user", `${phone}`, (exists) => {
			if (!exists) {
				const userObj = {
					firstName,
					lastName,
					phone,
					password: generateHash(password),
					tosAgreement,
				};
				lib.create("user", `${phone}`, userObj, (err_create) => {
					if (err_create) {
						callback(500, {
							message: "There was a problem in server side could not create user",
						});
					} else {
						callback(200, {
							message: "User created successfully",
						});
					}
				});
			} else {
				callback(400, {
					message: "User already exists",
				});
			}
		});
	} else {
		callback(400, {
			message: "Missing required fields",
		});
	}
};

handler._user.put = (requestProperties, callback) => {
	lib.checkFileExists("user", `${requestProperties.body.phone}`, (exists) => {
		if (exists) {
			const token =
				typeof requestProperties.headers.token === "string"
					? requestProperties.headers.token.trim()
					: false;
			const phone =
				typeof requestProperties.body.phone === "string" &&
				requestProperties.body.phone.trim().length === 11
					? requestProperties.body.phone
					: false;

			verify(token, phone, (verified) => {
				if (verified) {
					lib.update(
						"user",
						`${requestProperties.body.phone}`,
						requestProperties.body,
						(err) => {
							if (!err) {
								callback(200, {
									message: "User updated successfully",
								});
							} else {
								callback(500, {
									message: "There was a problem in server side ",
								});
							}
						},
					);
				} else {
					callback(403, { message: "Unauthicated request" });
				}
			});
		} else {
			callback(400, {
				message: "User does not exist or invalid phone number",
			});
		}
	});
};

handler._user.delete = (requestProperties, callback) => {
	const phone =
		typeof requestProperties.queryString.phone === "string" &&
		requestProperties.queryString.phone.trim().length === 11
			? requestProperties.queryString.phone
			: null;
	lib.checkFileExists("user", phone, (exists) => {
		if (exists) {
			lib.delete("user", phone, (err) => {
				if (!err) {
					callback(200, {
						message: "User deleted successfully",
					});
				} else {
					callback(500, {
						message: "There was a problem in server side ",
					});
				}
			});
		} else {
			callback(400, {
				message: "User does not exist",
			});
		}
	});
};
module.exports = handler;
/**
 * All status code
 * 100 Continue
 * 101 Switching Protocols
 * 103 Early Hints
 * 200 OK
 * 201 Created
 * 202 Accepted
 * 203 Non-Authoritative Information
 * 204 No Content
 * 205 Reset Content
 * 206 Partial Content
 * 207 Multi-Status
 * 208 Already Reported
 * 226 IM Used
 * 300 Multiple Choices
 * 301 Moved Permanently
 * 302 Found
 * 303 See Other
 * 304 Not Modified
 * 307 Temporary Redirect
 * 308 Permanent Redirect
 * 400 Bad Request
 * 401 Unauthorized
 * 402 Payment Required
 * 403 Forbidden
 * 404 Not Found
 * 405 Method Not Allowed
 * 406 Not Acceptable
 * 407 Proxy Authentication Required
 * 408 Request Timeout
 * 409 Conflict
 * 410 Gone
 * 411 Length Required
 * 412 Precondition Failed
 * 413 Content Too Large
 * 414 URI Too Long
 * 415 Unsupported Media Type
 * 416 Range Not Satisfiable
 * 417 Expectation Failed
 * 418 I'm a teapot
 * 421 Misdirected Request
 * 422 Unprocessable Content
 * 423 Locked
 * 424 Failed Dependency
 * 425 Too Early
 * 426 Upgrade Required
 * 428 Precondition Required
 * 429 Too Many Requests
 * 431 Request Header Fields Too Large
 * 451 Unavailable For Legal Reasons
 * 500 Internal Server Error
 * 501 Not Implemented
 * 502 Bad Gateway
 * 503 Service Unavailable
 * 504 Gateway Timeout
 * 505 HTTP Version Not Supported
 * 506 Variant Also Negotiates
 * 507 Insufficient Storage
 * 508 Loop Detected
 * 510 Not Extended
 * 511 Network Authentication Required
 */
