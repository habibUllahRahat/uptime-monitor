const types = {};
types.verify = {
	url: {
		type: "string",
		check(url) {
			return typeof url === this.type && url.trim().length > 0 ? url : null;
		},
	},
	protocol: {
		type: "string",
		values: ["http", "https"],
		check(protocols) {
			return typeof protocols === this.type && this.values.includes(protocols)
				? protocols
				: null;
		},
	},
	method: {
		type: "array",
		values: ["get", "post", "put", "delete"],
		check(value) {
			return Array.isArray(value) &&
				value.length > 0 &&
				value.every(
					(method) =>
						typeof method === "string" && this.values.includes(method.toLowerCase()),
				)
				? value.map((method) => method.toLowerCase())
				: null;
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
				? successCode.every((value) => typeof value === "number" && value > 0 && value < 5)
					? successCode
					: null
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
	token: {
		type: "string",
		length: 20,
		check(value) {
			return typeof value === this.type && value.trim().length === this.length
				? value.trim()
				: null;
		},
	},
	checks: {
		type: "object",
		check(value) {
			return Array.isArray(value) && value.length > 0 ? value : [];
		},
	},
	checkObj: {
		type: "object",
		check(value) {
			if (typeof value !== this.type || value === null || Array.isArray(value)) {
				return null;
			}

			const check = {
				id: types.verify.id.check(value.id),
				protocol: types.verify.protocols.check(value.protocol),
				method: Array.isArray(value.method)
					? value.method.map((method) => types.verify.method.check(method))
					: null,
				successCodes: types.verify.successCodes.check(value.successCodes),
				timeout: types.verify.timeout.check(value.timeout),
				url: types.verify.url.check(value.url),
				phone: types.verify.phone.check(value.phone),
			};

			return Object.values(check).every((item) => item !== null) ? check : null;
		},
	},
	userMsg: {
		type: "string",
		check(value) {
			return typeof value === "string" && value.trim() > 0 && value.trim() < 1601
				? value
				: null;
		},
	},
};

types.statusCode = {
	success: {
		code: 200,
		msg(resource = "Request") {
			return { message: `${resource} completed successfully.` };
		},
	},

	created: {
		code: 201,
		msg(resource = "Resource") {
			return { message: `${resource} created successfully.` };
		},
	},

	accepted: {
		code: 202,
		msg(resource = "Request") {
			return { message: `${resource} accepted successfully.` };
		},
	},

	noContent: {
		code: 204,
		msg() {
			return { message: "Request completed successfully." };
		},
	},

	badRequest: {
		code: 400,
		msg(resource = "Request") {
			return { message: `Invalid ${resource.toLowerCase()} data.` };
		},
	},

	unauthorized: {
		code: 401,
		msg() {
			return { message: "Authentication is required." };
		},
	},

	forbidden: {
		code: 403,
		msg() {
			return {
				message: "You do not have permission to perform this action.",
			};
		},
	},

	notFound: {
		code: 404,
		msg(resource = "Resource") {
			return { message: `${resource} not found.` };
		},
	},

	conflict: {
		code: 409,
		msg(resource = "Resource") {
			return { message: `${resource} already exists.` };
		},
	},

	unprocessableEntity: {
		code: 422,
		msg() {
			return { message: "The provided data failed validation." };
		},
	},

	internalServerError: {
		code: 500,
		msg() {
			return { message: "An unexpected server error occurred." };
		},
	},
};
module.exports = types;
