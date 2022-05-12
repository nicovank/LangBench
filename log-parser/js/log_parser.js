const worker = require("worker_threads");
const fs = require("fs");
const readline = require("readline");

function assert(cond) {
	if (!cond) {
		throw new Error("badness");
	}
}

function time_diff(start, end) {
	let sec = end[0] - start[0];
	let nano = end[1] - start[1];
	return sec * 1e9 + nano;
}

let TokenType = Object.freeze({
	PLAIN: 0,
	VARIABLE: 1,
	WILDCARD: 2,
	PLAIN_WILDCARD: 3,
	VARIABLE_WILDCARD: 4,
});

class LogParser {
	constructor(files) {
		this.files = files;
		this.file_tables = new Array(files.length);
		this.formats = [];
		this.format_ids = {};
		this.variables = [];
		this.variable_ids = {};
	}

	index_spawn(i, lower, upper, count, resolve) {
		let w = new worker.Worker(__filename, {
			resourceLimits: {
				maxOldGenerationSizeMb: 32 * 1024,
				maxYoungGenerationSizeMb: 32 * 1024,
			},
		});
		w.on("error", (err) => {
			console.log("[error] worker_index", i, "error.");
			console.log(err);
		});
		w.on("exit", (code) => {
			console.log("[trace] worker_index", i, "terminated with", code);
		});
		let lp = this;
		w.on("message", (v) => {
			//console.log("[trace] LogParser.index_spawn got", value);
			let t0 = v.t0;
			let value = v.data;
			console.log("[trace] worker_index", i, "got data back took", Date.now() - t0, "ms,", size_of_file_structures(value), "bytes.");
			for (let [ i, file ] of Object.entries(value)) {
				for (let j = 0; j < file.formats.length; j++) {
					let str = file.formats[j];
					let id = lp.format_ids[str];
					if (id == undefined) {
						id = lp.formats.length;
						lp.formats.push(str);
						lp.format_ids[str] = id;
					}
					file.format_ids[str] = id;
				}
				for (let j = 0; j < file.variables.length; j++) {
					let str = file.variables[j];
					let id = lp.variable_ids[str];
					if (id == undefined) {
						id = lp.variables.length;
						lp.variables.push(str);
						lp.variable_ids[str] = id;
					}
					file.variable_ids[str] = id;
				}
				for (let j = 0; j < file.table.length; j++) {
					let line = file.table[j];
					line.format_id = file.format_ids[file.formats[line.format_id]];
					for (let k = 0; k < line.variables.length; k++) {
						line.variables[k] = file.variable_ids[file.variables[line.variables[k]]];
					}
				}
				lp.file_tables[i] = file.table;
			}
			count.value--;
			if (count.value == 0) {
				resolve(true);
			}
		});
		console.log("[trace] starting index worker", i, "at", Date.now());
		w.postMessage({
			action: "index",
			id: i,
			lower: lower,
			upper: upper,
			log_parser: this,
			t0: Date.now(),
		});
	}

	index(threads, callback) {
		let n = threads - 1;
		let partition = Math.floor(this.files.length / threads)
		let x = { value: threads };
		let p = new Promise((resolve, reject) => {
			for (let i = 0; i < n; i++) {
				this.index_spawn(i, i * partition, (i + 1) * partition, x, resolve);
			}
			this.index_spawn(n, n * partition, this.files.length, x, resolve);
		});
		p.then((success) => {
			assert(success);
			console.log("[info] done indexing.");
			callback();
		}).catch((reason) => {
			console.log("[error]", reason);
		});
	}

	format_matches_pattern(format, pattern_parts, pattern_types, pos, part, prev_is_wildcard, results, cur) {
		if (part >= pattern_parts.length) {
			results.push(cur);
			return;
		}
		let token = pattern_parts[part];
		let type = pattern_types[part];
		if (type == TokenType.PLAIN) {
			if (prev_is_wildcard) {
				while (pos < format.length) {
					if (token == format[pos]) {
						let new_cur = cur.slice();
						this.format_matches_pattern(format, pattern_parts, pattern_types, pos + 1, part + 1, false, results, new_cur);
					}
					pos++;
				}
			} else {
				if (token == format[pos]) {
					this.format_matches_pattern(format, pattern_parts, pattern_types, pos + 1, part + 1, false, results, cur);
				}
			}
			return;
		} else if (type == TokenType.VARIABLE || type == TokenType.VARIABLE_WILDCARD) {
			if (prev_is_wildcard) {
				while (pos < format.length) {
					if (string_is_digit(format[pos])) {
						let new_cur = cur.slice();
						new_cur.push({
							format_pos: parseInt(format[pos], 10),
							pattern_part: part,
						});
						this.format_matches_pattern(format, pattern_parts, pattern_types, pos + 1, part + 1, false, results, new_cur);
					}
					pos++;
				}
			} else {
				if (string_is_digit(format[pos])) {
					cur.push({
						format_pos: parseInt(format[pos]),
						pattern_part: part,
					});
					this.format_matches_pattern(format, pattern_parts, pattern_types, pos + 1, part + 1, false, results, cur);
				}
			}
			return;
		} else if (type == TokenType.WILDCARD) {
			this.format_matches_pattern(format, pattern_parts, pattern_types, pos, part + 1, true, results, cur);
		} else if (type == TokenType.PLAIN_WILDCARD) {
			let front_is_wildcard = (token.charAt(0) == "*");
			let str = front_is_wildcard ? token.substring(1) : token.substring(0, token.length - 1);
			let lp = this;
			function fn() {
				if (string_matches_wildcard(front_is_wildcard, format[pos], str)) {
					let new_cur = cur.slice();
					lp.format_matches_pattern(format, pattern_parts, pattern_types, pos + 1, part + 1, false, results, new_cur);
				} else if (string_is_digit(format[pos])) {
					let new_cur = cur.slice();
					new_cur.push({
						format_pos: parseInt(format[pos]),
						pattern_part: part,
					});
					lp.format_matches_pattern(format, pattern_parts, pattern_types, pos + 1, part + 1, false, results, new_cur);
				}
			}
			if (prev_is_wildcard) {
				while (pos < format.length) {
					fn();
					pos++;
				}
			} else {
				fn();
			}
			return;
		} else {
			assert(false);
		}
	}

	parse_pattern(pattern) {
		let parts = string_split(pattern);
		let part_types = [];
		//let number = /[0-9]/;
		for (let i = 0; i < parts.length; i++) {
			let str = parts[i];
			let wildcard = str.includes("*");
			//if (number.test(str)) {
			if (string_contains_number(str)) {
				part_types.push(wildcard ? TokenType.VARIABLE_WILDCARD : TokenType.VARIABLE);
			} else {
				if (wildcard) {
					part_types.push((str.length == 1) ? TokenType.WILDCARD : TokenType.PLAIN_WILDCARD);
				} else {
					part_types.push(TokenType.PLAIN);
				}
			}
		}
		let valid_variables = [];
		for (let i = 0; i < parts.length; i++) {
			valid_variables.push(new Set());
		}
		let wildcard_front_variables = {};
		let wildcard_back_variables = {};
		for (let i = 0; i < parts.length; i++) {
			if (part_types[i] == TokenType.VARIABLE) {
				let id = this.variable_ids[parts[i]];
				if (id == undefined) {
					return {
						valid: false,
						formats: null,
						variables: null,
					};
				}
				valid_variables[i].add(id);
			} else if (part_types[i] == TokenType.VARIABLE_WILDCARD || part_types[i] == TokenType.PLAIN_WILDCARD) {
				if (parts[i].charAt(0) == "*") {
					wildcard_front_variables[parts[i].substring(1)] = i;
				} else {
					wildcard_back_variables[parts[i].substring(0, parts[i].length - 1)] = i;
				}
			}
		}
		for (let i = 0; i < this.variables.length; i++) {
			let str = this.variables[i];
			for (let [ pattern, j ] of Object.entries(wildcard_front_variables)) {
				if (string_matches_wildcard(true, str, pattern)) {
					valid_variables[j].add(i);
				}
			}
			for (let [ pattern, j ] of Object.entries(wildcard_back_variables)) {
				if (string_matches_wildcard(false, str, pattern)) {
					valid_variables[j].add(i);
				}
			}
		}
		let valid_formats = {};
		for (let i = 0; i < this.formats.length; i++) {
			let f = this.formats[i];
			let format_parts = string_split(f);
			let results = [];
			let cur = [];
			this.format_matches_pattern(format_parts, parts, part_types, 0, 0, true, results, cur);
			if (results.length > 0) {
				valid_formats[i] = results;
			}
		}
		return {
			valid: true,
			formats: valid_formats,
			variables: valid_variables,
		};
	}

	search_spawn(i, lower, upper, pattern, parse, results, count, resolve) {
		let w = new worker.Worker(__filename);
		w.on("error", (err) => {
			console.log("[error] worker_search", i, "error.");
			console.log(err);
		});
		w.once("message", (v) => {
			//console.log("[trace] LogParser.search_spawn got", value);
			let t0 = v.t0;
			let value = v.data;
			console.log("[trace] worker_search", i, "got data back took", Date.now() - t0, "ms");
			for (let j = 0; j < value.length; j++) {
				results.push(value[i]);
			}
			count.value--;
			if (count.value == 0) {
				resolve(results);
			}
		});
		console.log("[trace] starting search worker", i, "at", Date.now());
		w.postMessage({
			action: "search",
			id: i,
			lower: lower,
			upper: upper,
			log_parser: this,
			pattern: pattern,
			parse: parse,
			t0: Date.now(),
		});
	}

	search(threads, pattern, callback) {
		let parse = this.parse_pattern(pattern);
		if (!parse.valid) {
			callback([]);
			return;
		}
		let n = threads - 1;
		let partition = Math.floor(this.files.length / threads)
		let results = [];
		let x = { value: threads };
		let p = new Promise((resolve, reject) => {
			for (let i = 0; i < n; i++) {
				this.search_spawn(i, i * partition, (i + 1) * partition, pattern, parse, results, x, resolve);
			}
			this.search_spawn(n, n * partition, this.files.length, pattern, parse, results, x, resolve);
		});
		p.then((results) => {
			callback(results);
		}).catch((reason) => {
			console.log("[error]", reason);
		});
	}

	search_regex_spawn(i, lower, upper, pattern, results, count, resolve) {
		let w = new worker.Worker(__filename);
		w.on("error", (err) => {
			console.log("[error] worker_search_regex", i, "error.");
			console.log(err);
		});
		w.once("message", (v) => {
			let t0 = v.t0;
			let value = v.data;
			console.log("[trace] worker_search_regex", i, "got data back took", Date.now() - t0, "ms");
			for (let j = 0; j < value.length; j++) {
				results.push(value[i]);
			}
			count.value--;
			if (count.value == 0) {
				resolve(results);
			}
		});
		console.log("[trace] starting search_regex worker", i, "at", Date.now());
		w.postMessage({
			action: "search_regex",
			id: i,
			lower: lower,
			upper: upper,
			log_parser: this,
			pattern: pattern,
			t0: Date.now(),
		});
	}

	search_regex(threads, pattern, callback) {
		let n = threads - 1;
		let partition = Math.floor(this.files.length / threads)
		let results = [];
		let x = { value: threads };
		let p = new Promise((resolve, reject) => {
			for (let i = 0; i < n; i++) {
				this.search_regex_spawn(i, i * partition, (i + 1) * partition, pattern, results, x, resolve);
			}
			this.search_regex_spawn(n, n * partition, this.files.length, pattern, results, x, resolve);
		});
		p.then((results) => {
			callback(results);
		}).catch((reason) => {
			console.log("[error]", reason);
		});
	}

	search_spooky_spawn(i, lower, upper, results, count, resolve) {
		let w = new worker.Worker(__filename);
		w.on("error", (err) => {
			console.log("[error] worker_spooky", i, "error.");
			console.log(err);
		});
		w.once("message", (value) => {
			for (let j = 0; j < value.length; j++) {
				results.push(value[i]);
			}
			count.value--;
			if (count.value == 0) {
				resolve(results);
			}
		});
		w.postMessage({
			action: "search_spooky",
			id: i,
			lower: lower,
			upper: upper,
			log_parser: this,
			t0: Date.now(),
		});
	}

	search_spooky(threads, callback) {
		let n = threads - 1;
		let partition = Math.floor(this.files.length / threads)
		let results = [];
		let x = { value: threads };
		let p = new Promise((resolve, reject) => {
			for (let i = 0; i < n; i++) {
				this.search_spooky_spawn(i, i * partition, (i + 1) * partition, results, x, resolve);
			}
			this.search_spooky_spawn(n, n * partition, this.files.length, results, x, resolve);
		});
		p.then((results) => {
			callback(results);
		}).catch((reason) => {
			console.log("[error]", reason);
		});
	}
}

function string_split(str) {
	let parts = [];
	let begin = 0;
	while (true) {
		while ((begin < str.length) && (str.charAt(begin) == " ")) {
			begin++;
		}
		if (begin == str.length) {
			break;
		}
		let end = str.indexOf(" ", begin);
		if (end < 0) {
			parts.push(str.substring(begin));
			break;
		}
		parts.push(str.substring(begin, end));
		begin = end + 1;
	}
	return parts;
}

function string_contains_number(str) {
	let zero = '0'.charCodeAt(0);
	let nine = '9'.charCodeAt(9);
	for (let i = 0; i < str.length; i++) {
		let ch = str.charCodeAt(i);
		if ((zero <= ch) && (ch <= nine)) {
			return true;
		}
	}
	return false;
}

function size_of_file_structures(value) {
	let size = 0;
	for (let [ i, file ] of Object.entries(value)) {
		// i: double
		size += 8;
		for (let j = 0; j < file.formats.length; j++) {
			size += file.formats[j].length;
		}
		for (let [ str, j ] of Object.entries(file.format_ids)) {
			size += 8;
			size += str.length;
		}
		for (let j = 0; j < file.variables.length; j++) {
			size += file.variables[j].length;
		}
		for (let [ str, j ] of Object.entries(file.variable_ids)) {
			size += 8;
			size += str.length;
		}
		for (let j = 0; j < file.table.length; j++) {
			size += 8;
			size += file.table[j].variables.length * 8;
		}
	}
	return size;
}

function string_matches_wildcard(front_is_wildcard, str, pattern) {
	return (front_is_wildcard && str.endsWith(pattern)) || (!front_is_wildcard && str.startsWith(pattern));
}

function string_is_digit(str) {
	let ch = str.charCodeAt(0);
	return ("0".charCodeAt(0) <= ch) && (ch <= "9".charCodeAt(0));
}

function rebuild_line(log_parser, i, j) {
	let line = log_parser.file_tables[i][j];
	let parts = string_split(log_parser.formats[line.format_id]);
	let line_str = "";
	for (let k = 0; k < parts.length; k++) {
		if (k > 0) {
			line_str += " ";
		}
		let str = parts[k];
		if (string_is_digit(str)) {
			line_str += log_parser.variables[line.variables[parseInt(str, 10)]];
		} else {
			line_str += str;
		}
	}
	return line_str;
}

function process_file(i, files, file_structures, count, resolve) {
	let formats = [];
	let format_ids = {};
	let variables = [];
	let variable_ids = {};
	let table = [];

	//let number = /[0-9]/;
	let space = / +/;

	let reader = readline.createInterface({
		input: fs.createReadStream(files[i]),
	});
	let z = 0;
	let t = Date.now();
	reader.on("line", (line) => {
		/*
		z++;
		if (z % (10 * 1000) == 0) {
			let t2 = Date.now();
			console.log("[trace] process_file", i, "at", z, "lines", t2 - t, "ms.");
			t = t2;
		}
		*/
		let parts = string_split(line);
		let row = {
			format_id: null,
			variables: [],
		};
		let f = "";
		let n = 0;
		for (let i = 0; i < parts.length; i++) {
			let str = parts[i];
			if (i > 0) {
				f += " ";
			}
			//if (number.test(str)) {
			if (string_contains_number(str)) {
				let id = variable_ids[str];
				if (id == undefined) {
					id = variables.length;
					variables.push(str);
					variable_ids[str] = id;
				}
				row.variables.push(id);
				f += n.toString();
				n++;
			} else {
				f += str;
			}
		}
		let id = format_ids[f];
		if (id == undefined) {
			id = formats.length;
			formats.push(f);
			format_ids[f] = id;
		}
		row.format_id = id;
		table.push(row);
	});
	reader.on("close", () => {
		file_structures[i] = {
			formats: formats,
			format_ids: format_ids,
			variables: variables,
			variable_ids: variable_ids,
			table: table,
		};
		count.value--;
		//console.log("[trace] process_file", i, "done in", Date.now() - t, "ms,", count.value, "files remaining.");
		if (count.value == 0) {
			resolve(true);
		}
	});
}

function worker_index(id, lower, upper, files, callback) {
	console.log("[trace] worker_index id:", id, "lower:", lower, "upper:", upper);
	let file_structures = {};
	let x = { value: (upper - lower) };
	if (x.value == 0) {
		callback(file_structures);
		return;
	}
	let p = new Promise((resolve, reject) => {
		for (let i = lower; i < upper; i++) {
			process_file(i, files, file_structures, x, resolve);
		}
	});
	p.then((success) => {
		assert(success);
		//console.log("[trace] worker_index", id, "callback data back at", Date.now());
		callback(file_structures);
	}).catch((reason) => {
		console.log("[error]", reason);
	});
}

function search_file(i, log_parser, results, pattern, parse) {
	let table = log_parser.file_tables[i];
	let t = Date.now();
	for (let j = 0; j < table.length; j++) {
		/*
		if (j % 1000 == 0) {
			let t2 = Date.now();
			console.log("[trace] search_file at", j, "lines", t2 - t, "ms.");
			t = t2;
		}
		*/
		let line = table[j];
		let pattern_variables = parse.formats[line.format_id];
		if (pattern_variables == undefined) {
			continue;
		}
		for (let k = 0; k < pattern_variables.length; k++) {
			let badness = false;
			for (let l = 0; l < pattern_variables[k].length; l++) {
				let pv = pattern_variables[k][l];
				let s = parse.variables[pv.pattern_part];
				if (!s.has(line.variables[pv.format_pos])) {
					badness = true;
					break;
				}
			}
			if (!badness) {
				results.push({
					file: i,
					line: j,
					str: rebuild_line(log_parser, i, j),
				});
				break;
			}
		}
	}
}

function worker_search(id, lower, upper, log_parser, pattern, parse, callback) {
	console.log("[trace] worker_search id:", id, "lower:", lower, "upper:", upper);
	let results = [];
	for (let i = lower; i < upper; i++) {
		search_file(i, log_parser, results, pattern, parse);
	}
	callback(results);
}

function search_regex_file(i, log_parser, results, pattern) {
	let table = log_parser.file_tables[i];
	for (let j = 0; j < table.length; j++) {
		let line = rebuild_line(log_parser, i, j);
		if (pattern.test(line)) {
			results.push({
				file: i,
				line: j,
				str: line,
			});
		}
	}
}

function search_spooky_file(i, log_parser, results) {
	let table = log_parser.file_tables[i];
	for (let j = 0; j < table.length; j++) {
		let line = rebuild_line(log_parser, i, j);
		if (line.length < 4) {
			results.push({
				file: i,
				line: j,
				str: line,
			});
		}
	}
}

function worker_search_regex(id, lower, upper, log_parser, pattern, callback) {
	console.log("[trace] worker_search_regex id:", id, "lower:", lower, "upper:", upper);
	let re = new RegExp(pattern);
	let results = [];
	for (let i = lower; i < upper; i++) {
		search_regex_file(i, log_parser, results, re);
	}
	callback(results);
}

function worker_search_spooky(id, lower, upper, log_parser, callback) {
	console.log("[trace] worker_search_spooky id:", id, "lower:", lower, "upper:", upper);
	let results = [];
	for (let i = lower; i < upper; i++) {
		search_spooky_file(i, log_parser, results);
	}
	callback(results);
}

function worker_main() {
	worker.parentPort.once("message", (value) => {
		//console.log("[trace] worker_main got", value);
		console.log("[trace] worker_main id:", value.id, "action:", value.action, "took:", Date.now() - value.t0, "ms");
		if (value.action == "index") {
			worker_index(value.id, value.lower, value.upper, value.log_parser.files, (file_structures) => {
				console.log("[trace] worker_index", value.id, "sending data back at", Date.now());
				//worker.parentPort.postMessage({ data: {}, t0: Date.now() });
				worker.parentPort.postMessage({ data: file_structures, t0: Date.now() });
				//worker.parentPort.postMessage(file_structures);
			});
		} else if (value.action == "search") {
			worker_search(value.id, value.lower, value.upper, value.log_parser, value.pattern, value.parse, (results) => {
				console.log("[trace] worker_search", value.id, "sending data back at", Date.now());
				worker.parentPort.postMessage({ data: results, t0: Date.now() });
			});
		} else if (value.action == "search_regex") {
			worker_search_regex(value.id, value.lower, value.upper, value.log_parser, value.pattern, (results) => {
				console.log("[trace] worker_search_regex", value.id, "sending data back at", Date.now());
				worker.parentPort.postMessage({ data: results, t0: Date.now() });
			});
		} else if (value.action == "search_spooky") {
			worker_search_spooky(value.id, value.lower, value.upper, value.log_parser, (results) => {
				worker.parentPort.postMessage(results);
			});
		} else {
			assert(false);
		}
	});
}

function print_results(results) {
	/*
	for (let i = 0; i < results.length; i++) {
		console.log("[found]", results[i].str);
	}
	*/
	console.log("[info]", results.length, "results.");
}

function do_indexed_searches(lp, num_threads, searches, i) {
	if (i >= searches.length) {
		return;
	}
	let s = searches[i]
	console.log("[info] indexed search %d: %s", i, s);
	let t0 = process.hrtime();
	lp.search(num_threads, s, (results) => {
		let t1 = process.hrtime();
		console.log("[info] indexed search %d took: %d", i, time_diff(t0, t1));
		print_results(results);
		do_indexed_searches(lp, num_threads, searches, i + 1);
	});
}

function do_regex_searches(lp, num_threads, regexes, i) {
	if (i >= regexes.length) {
		return;
	}
	let re = regexes[i]
	console.log("[info] regex search %d: %s", i, re);
	let t0 = process.hrtime();
	lp.search_regex(num_threads, re, (results) => {
		let t1 = process.hrtime();
		console.log("[info] regex search %d took: %d", i, time_diff(t0, t1));
		print_results(results);
		do_regex_searches(lp, num_threads, regexes, i + 1);
	});
}

function do_spooky_search(lp, num_threads) {
	let t0 = process.hrtime();
	lp.search_spooky(num_threads, (results) => {
		let t1 = process.hrtime();
		console.log("[info] spooky search took: %d", time_diff(t0, t1));
		print_results(results);
	});
}

function main(args) {
	if (args.length < 4) {
		console.log("[usage] node log_parser.js <num threads> <searches> <files> <indexed|regex|spooky>\n");
		process.exit(1)
	}
	console.log("[trace] start:", Date.now());
	let num_threads = parseInt(args[0], 10);
	let type = args[3];
	let searches = [];
	let searches_reader = readline.createInterface({
		input: fs.createReadStream(args[1]),
	});
	let files = [];
	let files_reader = readline.createInterface({
		input: fs.createReadStream(args[2]),
	});
	let done = 2;
	let p = new Promise((resolve, reject) => {
		searches_reader.on("line", (line) => {
			searches.push(line);
		});
		searches_reader.on("close", () => {
			done--;
			if (done == 0) {
				resolve(true);
			}
		});
		files_reader.on("line", (line) => {
			files.push(line);
		});
		files_reader.on("close", () => {
			done--;
			if (done == 0) {
				resolve(true);
			}
		});
	});
	p.then((success) => {
		assert(success);
		let lp = new LogParser(files);
		let t0 = process.hrtime();
		lp.index(num_threads, () => {
			let t1 = process.hrtime();
			console.log("[info] indexing:", time_diff(t0, t1));
			if (type == "indexed") {
				do_indexed_searches(lp, num_threads, searches, 0);
			} else if (type == "regex") {
				do_regex_searches(lp, num_threads, searches, 0);
			} else if (type == "spooky") {
				do_spooky_search(lp, num_threads);
			} else {
				process.exit(1);
			}
		});
	}).catch((reason) => {
		console.log("[error]", reason);
	});
}

if (worker.isMainThread) {
	if (!module.parent) {
		main(process.argv.slice(2));
	}
} else {
	worker_main();
}
