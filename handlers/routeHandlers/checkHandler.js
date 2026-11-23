const {
	types: { verify },
} = require("../../helpers/types");

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
	const { body, queryString } = requestProperties;
	const protocols = verify.protocols.check(body.protocols);
	const url = verify.url.check(body.url);
	const method = verify.method.check(body.method);
	const timeoutSec = verify.timeout.check(body.timeout);
	const successCodes = verify.successCodes.check(body.successCodes);
};
handler._check.get = (requestProperties, callback) => {};
handler._check.put = (requestProperties, callback) => {};
handler._check.delete = (requestProperties, callback) => {};
