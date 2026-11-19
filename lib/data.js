//dependencies
const fs = require("fs");
const path = require("path");

const lib = {};

// base directory of the data folder
lib.baseDir = path.join(__dirname, "../.data");

// function to write data to a file
lib.create = (dir, file, data, callback) => {
	//here we can choose to not use "dir" we can directly use baseDir for file name
	//Open file for writing
	fs.open(`${lib.baseDir}/${dir}/${file}.json`, "wx", (err_file_open, fileDescriptor) => {
		//dir is optional parameter we can pass it as null or undefined

		//fs.open(file name, mode, callback(err, file descriptor(it returned by fs.open() if it can execute operation correctly) is error back pettern)

		if (!err_file_open && fileDescriptor) {
			const stringData = JSON.stringify(data); // convert data to string

			fs.writeFile(fileDescriptor, stringData, (err_file_write) => {
				if (!err_file_write) {
					fs.close(fileDescriptor, (err_file_close) => {
						if (!err_file_close) {
							callback(false);
						} else {
							callback(" Create file: Error while closing file", err_file_close);
						}
					});
				} else {
					callback("Create file: Error while writing file" + err_file_write);
				}
			});
		} else {
			callback(
				" Create file: Could not create new file, it may already exist." + err_file_open,
			);
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
lib.read = (dir, filename, callback) => {
	//read file
	fs.readFile(`${lib.baseDir}/${dir}/${filename}.json`, "utf-8", (err, data) => {
		//fs.readFile(pathOfFile,encoding,callback(err,data))
		if (!err && data) {
			callback(data);
		} else {
			callback("\nReading file : Error while reading file :", err);
		}
	});
};

/* 
START
  |
  v
lib.update(dir, filename, data, callback)
  |
  v
fs.open(`${lib.baseDir}/${dir}/${filename}.json`, "r+", callback)
  |
  v
Is there an error AND is fileDescriptor available?
  |
  +---- NO / ERROR ------------------------------+
  |                                              |
  v                                              |
fs.readFile(fileDescriptor, "utf-8", callback)   |
  |                                              |
  v                                              |
Is there an error AND is oldData available?      |
  |                                              |
  +---- YES / ERROR                              |
  |       |                                      |
  |       v                                      |
  |   callback("Error while reading file", err)  |
  |                                              |
  +---- NO / SUCCESS                             |
          |                                      |
          v                                      |
    JSON.parse(oldData)                          |
          |                                      |
          v                                      |
    oldDataObj                                   |
          |                                      |
          v                                      |
    Merge oldDataObj + data                      |
          |                                      |
          v                                      |
    const newDataObj = {                         |
      ...oldDataObj,                             |
      ...data                                    |
    }                                            |
          |                                      |
          v                                      |
    JSON.stringify(newDataObj)                   |
          |                                      |
          v                                      |
    const stringdata                             |
          |                                      |
          v                                      |
    fs.ftruncate(fileDescriptor, callback)       |
          |                                      |
          v                                      |
    Is there an error?                           |
          |                                      |
          +---- YES                              |
          |     |                                |
          |     v                                |
          | callback("Error while truncating")   |
          |                                      |
          +---- NO                               |
                |                                |
                v                                |
        fs.write(fileDescriptor,                 |
                 stringdata,                     |
                 0,                              |
                 "utf-8",                        |
                 callback)                       |
                |                                |
                v                                |
        Is there an error?                       |
                |                                |
                +---- YES                        |
                |     |                          |
                |     v                          |
                | callback("Error while writing")|
                |                                |
                +---- NO                         |
                      |                          |
                      v                          |
              fs.close(fileDescriptor, callback) |
                      |                          |
                      v                          |
              Is there a closing error?          |
                      |                          |
                      +---- YES                  |
                      |     |                    |
                      |     v                    |
                      | callback("Closing error")|
                      |                          |
                      +---- NO                   |
                            |                    |
                            v                    |
                      callback(false)            |
                            |                    |
                            v                    |
                           END                   |
                                                 |
  +----------------------------------------------+
  |
  v
END
*/

lib.update = (dir, filename, data, callback) => {
	fs.open(`${lib.baseDir}/${dir}/${filename}.json`, "r+", (err, fileDescriptor) => {
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
							fs.write(
								fileDescriptor,
								stringdata,
								0,
								"utf-8",
								(err, written, string) => {
									if (!err) {
										fs.close(fileDescriptor, (err) => {
											if (!err) {
												callback(false);
											} else {
												callback("Error while closing file:", err);
											}
										});
									} else {
										callback("Error while writing file:", err);
									}
								},
							);
						} else {
							callback(
								"\nUpdating file : Error while truncating existing file :",
								err,
							);
						}
					});
				} else {
					callback("\nUpdating file : Error while reading file :", err);
				}
			});
		} else {
			callback("\nUpdating file : Error while opening file :", err);
		}
	});
};
lib.delete = (dir, file, callback) => {
	//fs.unlink(pathToFile, callback) used for delete file
	fs.unlink(`${lib.baseDir}/${dir}/${file}.json`, (err) => {
		if (!err) {
			callback(false);
		} else {
			callback(err);
		}
	});
};
module.exports = lib;
