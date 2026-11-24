const { verify, statusCode } = require("../../helpers/types");
const { parseJson, createRandomString } = require("../../helpers/utilites");
const { create, read, update, deleteFile, filesList } = require("../../lib/data");

//Dependencies
const handler = {};
handler._check = {};
handler.checkHandler = (requestProperties, callback) => {
	const acceptedMethods = ["get", "post", "put", "delete"];
	if (acceptedMethods.includes(requestProperties.method) > -1) {
		handler._check[requestProperties.method](requestProperties, callback);
	} else {
		callback(404, { message: "Method is not allowed" });
	}
};

handler._check.post = (requestProperties, callback) => {
	const { body, headers } = requestProperties;
	const protocol = verify.protocol.check(body.protocol);
	const url = verify.url.check(body.url);
	const method = verify.method.check(body.method);
	const timeout = verify.timeout.check(body.timeout);
	const successCodes = verify.successCodes.check(body.successCodes);
	const bodydata = { protocol, url, method, successCodes, timeout };
	if (protocol && url && method && timeout && successCodes) {
		// start of checking data validity

		const token = verify.token.check(headers.token);

		if (token) {
			// start of token check before reading token
			read("tokens", token, (err_read_token, data) => {
				// start of reading token data
				if (!err_read_token && data) {
					// start of reading token data if else
					const tokenData = parseJson(data);
					const phone = tokenData.phone;

					if (token && phone) {
						read("user", phone, (err_read_user, userData) => {
							if (!err_read_user && userData) {
								const user = parseJson(userData);

								filesList("user", (err_file_list, list) => {
									if (!err_file_list && list) {
										console.log("checks folders file list:", list);
										let checkid = createRandomString(20);
										while (list.includes(checkid)) {
											checkid = createRandomString(20);
											console.log(
												"Random string created successfully at tokenHandler",
											);
										}
										const checkobj = {
											id: checkid,
											phone,
											protocol,
											url,
											method,
											successCodes,
											timeout,
										};

										create(
											"checks",
											checkid,
											checkobj,
											(err_create_check, data) => {
												if (!err_create_check && data) {
													const checks = verify.checks.check(user.checks);
													checks.push(checkid);
													user.checks = checks;

													update(
														"user",
														user.phone,
														user,
														(err_update_user, updatedUser) => {
															if (!err_update_user && updatedUser) {
																callback(
																	statusCode.success.code,
																	user,
																);
															} else {
																callback(
																	statusCode.internalServerError
																		.code,
																	statusCode.internalServerError.msg(),
																);
															} //end of update if else
														},
													); //end of update user
												} else {
													callback(
														statusCode.internalServerError.code,
														statusCode.internalServerError.msg(),
													);
												} // end of create check if else
											},
										); //end of create check
									} else {
										callback(
											statusCode.internalServerError.code,
											statusCode.internalServerError.msg(),
										);
									} // end of file exists if else
								}); //end of file exists
							} else {
								callback(
									statusCode.badRequest.code,
									statusCode.badRequest.msg("Token or Phone"),
								);
							} // end of user data reading if else
						}); // end of user data reading
					} else {
						callback(
							statusCode.badRequest.code,
							statusCode.badRequest.msg("Token or Phone"),
						); //end of token and phone check before reading user
					}
				} else {
					callback(statusCode.badRequest.code, statusCode.badRequest.msg("Token"));
				} // end of reading token data if else
			}); // end of reading token data
		} else {
			callback(statusCode.badRequest.code, statusCode.badRequest.msg("Token"));
		} // end of token check before reading token
	} else {
		const invalidFields = Object.entries(bodydata)
			.filter(([key, value]) => value === null)
			.map(([key]) => key);

		if (invalidFields.length > 0) {
			return callback(
				statusCode.badRequest.code,
				statusCode.badRequest.msg(invalidFields.join(", ")),
			);
		}
	} // end of checking data validity
};
handler._check.get = (requestProperties, callback) => {};
handler._check.put = (requestProperties, callback) => {};
handler._check.delete = (requestProperties, callback) => {};

module.exports = handler;
