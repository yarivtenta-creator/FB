"use strict";

var path = require("path");
var testCases = require("./test_cases.json");

var GREEN  = "\x1b[32m";
var RED    = "\x1b[31m";
var YELLOW = "\x1b[33m";
var RESET  = "\x1b[0m";
var BOLD   = "\x1b[1m";

var passed = 0;
var failed = 0;

function normalizeChecks(tc) {
  var checks = [];
  var exp = tc.expect;
  if (!exp) return checks;
  Object.keys(exp).forEach(function(key) {
    var val = exp[key];
    if (key.endsWith("_min")) checks.push({ field: key.slice(0,-4), op: "gte", value: val });
    else if (key.endsWith("_max")) checks.push({ field: key.slice(0,-4), op: "lte", value: val });
    else if (Array.isArray(val)) checks.push({ field: key, op: "in", value: val });
    else checks.push({ field: key, op: "eq", value: val });
  });
  return checks;
}

function evalCheck(result, check) {
  var actual = result[check.field];
  if (check.op === "eq") return actual === check.value;
  if (check.op === "in") return Array.isArray(check.value) && check.value.indexOf(actual) !== -1;
  if (check.op === "gte") return typeof actual === "number" && actual >= check.value;
  if (check.op === "lte") return typeof actual === "number" && actual <= check.value;
  return false;
}

console.log("\n" + BOLD + "=== ScaleXL ClientFlow Agent Pack - Test Runner ===" + RESET + "\n");

for (var i = 0; i < testCases.length; i++) {
  var tc = testCases[i];
  var agentPath = path.join(__dirname, "..", "agents", tc.agent, "agent.js");
  var agent;
  try { agent = require(agentPath); } catch(e) {
    console.log(RED + "❌ FAIL" + RESET + " [" + tc.id + "] " + tc.name + " - load error: " + e.message);
    failed++; continue;
  }
  var result;
  try { result = agent.run(tc.input); } catch(e) {
    console.log(RED + "❌ FAIL" + RESET + " [" + tc.id + "] " + tc.name + " - run error: " + e.message);
    failed++; continue;
  }
  var checks = normalizeChecks(tc);
  var failures = [];
  for (var c = 0; c < checks.length; c++) {
    if (!evalCheck(result, checks[c])) {
      failures.push(checks[c].field + ": expected " + checks[c].op + " " + JSON.stringify(checks[c].value) + ", got " + JSON.stringify(result[checks[c].field]));
    }
  }
  if (failures.length === 0) {
    console.log(GREEN + "✅ PASS" + RESET + " [" + tc.id + "] " + tc.name);
    passed++;
  } else {
    console.log(RED + "❌ FAIL" + RESET + " [" + tc.id + "] " + tc.name);
    failures.forEach(function(f) { console.log("   " + f); });
    console.log("   Result: " + JSON.stringify(result));
    failed++;
  }
}

console.log("\n" + BOLD + passed + "/" + testCases.length + " tests passed" + RESET);
if (failed === 0) { console.log("\n" + GREEN + BOLD + "ALL TESTS PASSED" + RESET); process.exit(0); }
else if (passed >= 5) { console.log("\n" + YELLOW + BOLD + "PARTIAL" + RESET); process.exit(1); }
else { console.log("\n" + RED + BOLD + "FAIL" + RESET); process.exit(1); }
