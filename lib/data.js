// ! Here we will make file system CRUD operations

//dependencies
const fs = require("fs");
const path = require("path");

const lib = {};

// base directory of the data folder
lib.baseDir = path.join(__dirname, "../.data");

// function to write data to a file
lib.create = (subfolder, file, data, callback) => {
	//here we can choose to not use "dir" we can directly use baseDir for file name
	//Open file for writing
	fs.open(`${lib.baseDir}/${subfolder}/${file}.json`, "wx", (err_file_open, fileDescriptor) => {
		//dir is optional parameter we can pass it as null or undefined

		//fs.open(file name, mode, callback(err, file descriptor(it returned by fs.open() if it can execute operation correctly) is error back pettern)

		if (!err_file_open && fileDescriptor) {
			const stringData = JSON.stringify(data); // convert data to string

			fs.writeFile(fileDescriptor, stringData, (err_file_write) => {
				if (!err_file_write) {
					fs.close(fileDescriptor, (err_file_close) => {
						if (!err_file_close) {
							callback(false, fileDescriptor);
						} else {
							callback(err_file_close, null);
						}
					});
				} else {
					callback(err_file_write, null);
				}
			});
		} else {
			callback(err_file_open, null);
		}
	});
};

/** 
	 Common file system flags (modes):
		r:   Read only; file must exist.
		r+:  Read and write; file must exist.
		w:   Write only; create file if it doesn't exist, truncate if it does.
    w+:  Read and write; create file if it doesn't exist, truncate if it does.
    a:   Append only; create file if it doesn't exist.
    a+:  Read and append; create file if it doesn't exist.
    wx:  Write only; create file if it doesn't exist, fail if it already exists.
    wx+: Read and write; create file if it doesn't exist, fail if it already exists.
    ax:  Append only menas existing file will be truncated; create file if it doesn't exist, fail if it already exists.
    ax+: Read and append; create file if it doesn't exist, fail if it already exists.
  	*/
lib.read = (subfolder, filename, callback) => {
	//read file
	fs.readFile(`${lib.baseDir}/${subfolder}/${filename}.json`, "utf-8", (err, data) => {
		//fs.readFile(pathOfFile,encoding,callback(err,data))
		if (!err && data) {
			callback(false, data);
		} else {
			callback(err, null);
		}
	});
};

lib.update = (subfolder, filename, data, callback) => {
	fs.open(`${lib.baseDir}/${subfolder}/${filename}.json`, "r+", (err, fileDescriptor) => {
		if (!err && fileDescriptor) {
			fs.readFile(fileDescriptor, "utf-8", (err, oldData) => {
				if (!err && oldData) {
					const oldDataObj = JSON.parse(oldData);
					const newDataObj = {
						...oldDataObj,
						...data,
					};
					const stringdata = JSON.stringify(newDataObj);

					fs.ftruncate(fileDescriptor, (err) => {
						if (!err) {
							fs.write(
								// here we are using fs.write() to update file cause fs.writeFile() is used to create new file and write data in it and it does not reset position of cursor to start after the empty characters after truncating
								fileDescriptor,
								stringdata,
								0,
								"utf-8",
								(err, written, string) => {
									if (!err) {
										fs.close(fileDescriptor, (err) => {
											if (!err) {
												callback(false, fileDescriptor);
											} else {
												callback(err, null);
											}
										});
									} else {
										callback(err, null);
									}
								},
							);
						} else {
							callback(err, null);
						}
					});
				} else {
					callback(err, null);
				}
			});
		} else {
			callback(err, null);
		}
	});
};
/* 
	fs.write(
	fileDescriptor,
	stringdata,
	position,
	encoding,
	callback(err, written, string) => {
		// Handle result
	}
	);
*/
lib.delete = (subfolder, file, callback) => {
	//fs.unlink(pathToFile, callback) used for delete file
	fs.unlink(`${lib.baseDir}/${subfolder}/${file}.json`, (err) => {
		if (!err) {
			callback(false);
		} else {
			callback(err);
		}
	});
};
lib.checkFileExists = (subfolder, file, callback) => {
	fs.access(`${lib.baseDir}/${subfolder}/${file}.json`, (err) => {
		if (!err) {
			callback(true);
		} else {
			callback(false);
		}
	});
};
module.exports = lib;
