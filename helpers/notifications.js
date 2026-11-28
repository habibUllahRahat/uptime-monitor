const https = require("https");
const { verify, statusCode } = require("./types.js");
const { twilio } = require("./environment.js");
const queryString = require("querystring");
const notifications = {};

notifications.sendTwilioSms = (phone, msg, callback) => {
	const userPhone = verify.phone.check(phone);
	const userMsg = verify.userMsg.check(msg);
	if (userPhone && userMsg) {
		//Twilo API call configuration
		const payload = {
			From: twilio.fromPhone,
			To: userPhone,
			Body: userMsg,
		};
		//stringify the payload;
		const stringifiedPayload = queryString.stringify(payload);
		//Twilio API call
		// TODO: Sign up for Twilio API key and SID at twilio.com
		const requestDetails = {
			hostname: "api.twilio.com",
			method: "POST",
			path: `/2010-04-01/Acounts/${twilio.accountSid}/Messages.json`,
			auth: `${twilio.accountSid}:${twilio.authToken}`,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		};
		const req = https.request(requestDetails, (res) => {
			//get the status code
			const status = res.statusCode;
			// callback successfully if the request went through
			if (status === 200 || status === 201) {
				callback(null, { message: "Message sent successfully" });
			} else {
				callback(`Status code: ${status}`);
			}
		});
		req.on("error", (e) => {
			callback(e);
		});
		req.write(stringifiedPayload);
		req.end();
	} else {
		callback(404, { message: "Invalid phone number or message" });
	}
};
module.exports = notifications;
