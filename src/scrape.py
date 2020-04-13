import json
import sys
import requests
import shutil
from datetime import datetime;

CODEFORCES_URL = "https://codeforces.com"
AGGREGATE = "aggregate.json"
DETAILS = "details.json"
AGG_SAMPLE = "aggregate-sample.json"
DET_SAMPLE = "details-sample.json"

def join_path(path, file):
	return "/".join((path, file))

# Initializes log with default values 
if len(sys.argv) < 2:
	print("Usage: scrape.py WORKDIR")
	sys.exit(0)

WORKDIR = sys.argv[1]

if len(sys.argv) > 2 and sys.argv[2] == "r":
	shutil.copy(AGG_SAMPLE, join_path(WORKDIR, AGGREGATE))
	shutil.copy(DET_SAMPLE, join_path(WORKDIR, DETAILS))
	sys.exit(0)

# ---------------------------------------------------------------
def load_file(filename):
	with open(filename, "r") as f:
		return json.load(f)

def get_current_status():
	return requests.get(CODEFORCES_URL).status_code

def save_json(filename, log):
	with open(filename, "w") as j_file:
		json.dump(log, j_file)

def secs_from_midnight(time):
	return time.hour * 3600 + time.minute * 60 + time.second

def last_date(log):
	if len(log) > 0:
		return log[-1]["date"];
	else:
		return "0000-00-00";

def get_time_repr(time):
	return time.date().isoformat()

def calc_aggregate(records):
	res = {"downtime": 0, "uptime": 0}
	last = 0
	for record in records:
		if(record["status"] >= 200 and record["status"] < 300):
			res["uptime"] += (record["time"] - last)
		else:
			res["downtime"] += (record["time"] - last)
		last = record["time"]

	# Convert to min
	for key in res.keys():
		res[key] = int((res[key] + 59) // 60)
	return {
			"date": last_date(records),
			"homepage": res
			}

# ----------------------------------------------------------


aggregate = load_file(join_path(WORKDIR, AGGREGATE))
details = load_file(join_path(WORKDIR, DETAILS))
time = datetime.today()
status = get_current_status()

# Set current status
aggregate["status"] = status;

# Remove partial info about today if present
if len(aggregate["records"]) > 0:
	aggregate["records"].pop()

# Compress last day
if get_time_repr(time) != last_date(details["today"]):
	if len(details["today"]):
		aggregate["records"].append(calc_aggregate(details["today"]))
	# Clear today history
	details["today"].clear()

secs = secs_from_midnight(time)
details["today"].append({"date": get_time_repr(time), "time": secs, "status": status})
aggregate["records"].append(calc_aggregate(details["today"]))


save_json(join_path(WORKDIR, AGGREGATE), aggregate)
save_json(join_path(WORKDIR, DETAILS), details)

