const types = {};
types.verify = {
	url: {
		type: "string",
		check(url) {
			return typeof url === this.type && url.trim().length > 0 ? url : null;
		},
	},
	protocols: {
		type: "string",
		values: ["http", "https"],
		check(protocols) {
			return typeof protocols === this.type && this.values.includes(protocols)
				? protocols
				: null;
		},
	},
	method: {
		type: "string",
		values: ["get", "post", "put", "delete"],
		check(method) {
			return typeof method === this.type && this.values.includes(method) ? method : null;
		},
	},
	timeout: {
		type: "number",
		remaineder: "1",
		check(timeout) {
			return typeof timeout === this.type && timeout > 0 && timeout < 5 && timeout % 1 === 0
				? timeout
				: null;
		},
	},
	successCodes: {
		type: "object",
		check(successCode) {
			return typeof successCode === "object" &&
				successCode.length > 0 &&
				successCode instanceof Array
				? successCode
				: null;
		},
	},
	id: {
		type: "string",
		check(id) {
			return typeof id === this.type && id.trim().length === 20 ? id : null;
		},
	},
	phone: {
		type: "string",
		check(phone) {
			return type;
		},
	},
	firstName: {
		type: "string",
		check(value) {
			return typeof value === this.type && value.trim().length > 0 ? value.trim() : null;
		},
	},

	lastName: {
		type: "string",
		check(value) {
			return typeof value === this.type && value.trim().length > 0 ? value.trim() : null;
		},
	},

	password: {
		type: "string",
		check(value) {
			return typeof value === this.type && value.trim().length > 0 ? value.trim() : null;
		},
	},

	phone: {
		type: "string",
		length: 11,
		check(value) {
			return typeof value === this.type && value.trim().length === this.length
				? value.trim()
				: null;
		},
	},

	tosAgreement: {
		type: "boolean",
		default: false,
		check(value) {
			return typeof value === this.type ? value : this.default;
		},
	},
};
types.statusCode = {
	success: {
		code: 200,
		msg(resource = "Request") {
			return `${resource} completed successfully.`;
		},
	},
	created: {
		code: 201,
		msg(resource = "Resource") {
			return `${resource} created successfully.`;
		},
	},
	accepted: {
		code: 202,
		msg(resource = "Request") {
			return `${resource} accepted successfully.`;
		},
	},
	noContent: {
		code: 204,
		msg() {
			return "Request completed successfully.";
		},
	},
	badRequest: {
		code: 400,
		msg(resource = "Request") {
			return `Invalid ${resource.toLowerCase()}.`;
		},
	},
	unauthorized: {
		code: 401,
		msg() {
			return "Authentication is required.";
		},
	},
	forbidden: {
		code: 403,
		msg() {
			return "You do not have permission to perform this action.";
		},
	},
	notFound: {
		code: 404,
		msg(resource = "Resource") {
			return `${resource} not found.`;
		},
	},
	conflict: {
		code: 409,
		msg(resource = "Resource") {
			return `${resource} already exists.`;
		},
	},
	internalServerError: {
		code: 500,
		msg() {
			return "An unexpected server error occurred.";
		},
	},
};
module.exports = types;
