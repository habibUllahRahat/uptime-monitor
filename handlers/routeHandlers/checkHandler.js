const { verify, statusCode } = require("../../helpers/types");
const { parseJson, createRandomString } = require("../../helpers/utilites");
const { create, read, update, deleteFile, filesList, checkFileExists } = require("../../lib/data");
const {
	_token: { verify: verifyToken },
} = require("./tokenHandler");

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

								if (phone === user.phone) {
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
														const checks = verify.checks.check(
															user.checks,
														);
														checks.push(checkid);
														user.checks = checks;

														update(
															"user",
															user.phone,
															user,
															(err_update_user, updatedUser) => {
																if (
																	!err_update_user &&
																	updatedUser
																) {
																	callback(
																		statusCode.success.code,
																		user,
																	);
																} else {
																	callback(
																		statusCode
																			.internalServerError
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
										statusCode.unauthorized.code,
										statusCode.unauthorized.msg(),
									);
								}
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
handler._check.get = (requestProperties, callback) => {
	const { queryString, headers } = requestProperties;
	const id = verify.id.check(queryString.id);
	const token = verify.id.check(headers.token);
	console.log(token, id);
	if (id && token) {
		read("checks", id, (err_read_check, check_data) => {
			if (!err_read_check && check_data) {
				const checkData = parseJson(check_data);
				read("tokens", token, (err_read_token, token_data) => {
					const tokenData = parseJson(token_data);
					if (!err_read_token && token_data) {
						read("user", tokenData.phone, (err_read_user, user_data) => {
							const userData = parseJson(user_data);
							if (!err_read_user && user_data && userData.checks.includes(id) > -1) {
								verifyToken(token, tokenData.phone, (isValid) => {
									console.log(isValid);
									if (isValid) {
										callback(statusCode.success.code, checkData);
									} else {
										callback(
											statusCode.unauthorized.code,
											statusCode.unauthorized.msg(),
										);
									}
								});
							} else {
								callback(
									statusCode.badRequest.code,
									statusCode.badRequest.msg("User"),
								);
							}
						});
					} else {
						callback(statusCode.badRequest.code, statusCode.badRequest.msg("Token"));
					}
				});
			} else {
				callback(statusCode.notFound.code, statusCode.notFound.msg("Check"));
			}
		});
	} else {
		callback(statusCode.badRequest.code, statusCode.badRequest.msg("Token or Id"));
	}
};
handler._check.put = (requestProperties, callback) => {
	const { body } = requestProperties;
	const id = verify.id.check(body.id);
	const token = verify.token.check(requestProperties.headers.token);
	let keys = Object.keys(body);
	keys = keys.includes("id") > -1 ? keys.splice(keys.includes("id")) : keys;
	if (id) {
		read("checks", id, (err_read_check, check_data) => {
			if (!err_read_check && check_data) {
				const checkObj = parseJson(check_data);
				verifyToken(token, checkObj.phone, (is_token_valid) => {
					if (is_token_valid) {
						const dataToUpdate = {};
						let invalid = "{ ";
						keys.forEach((k) => {
							if (checkObj[k]) {
								dataToUpdate[k] = verify[k].check(body[k]) ? body[k] : checkObj[k];
							} else {
								invalid += `${k} : ${body[k]}, `;
							}
						});
						invalid += " }";
						if (dataToUpdate && !invalid) {
							update("checks", id, dataToUpdate, (err_update_check, check_data) => {
								if (!err_update_check) {
									callback(statusCode.success.code, check_data);
								} else {
									callback(
										statusCode.internalServerError.code,
										statusCode.internalServerError.msg(),
									);
								}
							});
						} else {
							callback(
								statusCode.badRequest.code,
								statusCode.badRequest.msg(`Invalid argument and value:${invalid}`),
							);
						}
					} else {
						callback(
							statusCode.badRequest.code,
							statusCode.badRequest.msg("Invalid Token"),
						);
					}
				});
			} else {
				callback(statusCode.badRequest.code, statusCode.badRequest.msg("reading check"));
			}
		});
	} else {
		callback(statusCode.badRequest.code, statusCode.badRequest.msg("ID"));
	}
};
handler._check.delete = (requestProperties, callback) => {
	const { body } = requestProperties;
	const id = verify.id.check(body.id);
	const token = verify.token.check(requestProperties.headers.token);
	if (id) {
		read("checks", id, (err_read_check, check_data) => {
			if (!err_read_check && check_data) {
				verifyToken(token, parseJson(check_data).phone, (isValid) => {
					if (isValid) {
						checkFileExists("checks", id, (exists) => {
							if (exists) {
								deleteFile("checks", id, (err_delete_check) => {
									if (!err_delete_check) {
										read(
											"user",
											parseJson(check_data).phone,
											(err_read_user, user_data) => {
												const userObj = parseJson(user_data);
												if (!err_read_user && user_data) {
													let checks = userObj.checks.filter(
														(check) => check !== id,
													);
													update(
														"user",
														parseJson(user_data).phone,
														{ checks },
														(err_update_user, update_data) => {
															if (!err_update_user && update_data) {
																callback(
																	statusCode.success.code,
																	update_data,
																);
															} else {
															}
														},
													);
												} else {
													callback(
														statusCode.internalServerError.code,
														statusCode.badRequest.msg("update"),
													);
												}
											},
										);
									} else {
										callback(
											statusCode.internalServerError.code,
											statusCode.badRequest.msg("delete"),
										);
									}
								});
							} else {
								callback(statusCode.noContent.code, statusCode.noContent.msg());
							}
						});
					} else {
						callback(statusCode.badRequest.code, statusCode.badRequest.msg("token"));
					}
				});
			} else {
				callback(statusCode.badRequest.code, statusCode.badRequest.msg("reading check"));
			}
		});
	} else {
		callback(statusCode.badRequest.code, statusCode.badRequest.msg("id"));
	}
};

module.exports = handler;
