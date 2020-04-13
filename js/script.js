const dataUrl = 'https://cauldron.liquoricemage.it/codefrocesstatus/status-data.json';

const daysToShow = 90;
const minutesPerDay = 24 * 60;
const msPerDay = minutesPerDay * 60 * 1000;

function minutesToTime(minutes) {
	const hours = ('0' + Math.floor(minutes / 60)).slice(-2);
	minutes = ('0' + (minutes % 60)).slice(-2);
	return `${hours}:${minutes}`;
}

function dateonly(date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Finds the first day to display
function findFirstDay(data) {
	let curDate = new Date(dateonly(new Date()) - (daysToShow-1) * msPerDay);
	let start;
	for (start = 0; start < data.length && data[start].date < curDate; start++);
	return start;
}

function addStatusRow(data, measureType) {
	const row = document.getElementById('status-row-template').content.cloneNode(true);
	const dayTemplate = document.getElementById('day-status-template');

	const rowDays = row.querySelector('.days');
	let curDate = new Date(dateonly(new Date()) - (daysToShow-1) * msPerDay);
	let start = findFirstDay(data);
	for (let i = 0; i < daysToShow; i++, curDate = new Date(curDate.getTime() + msPerDay)) {
		let color = 'nothing';
		let text;
		if (start < data.length && data[start].date.getTime() == curDate.getTime()) {
			const downtime = data[start][measureType].downtime;
			color = downtime == 0 ? 'success' : downtime <= 30 ? 'warning' : 'danger';
			if (downtime == 0) {
				text = 'Always operational';
			} else {
				text = `Downtime: <b>${minutesToTime(downtime)}</b>`;
			}
			start++;
		} else {
			text = 'No data';
		}
		const day = dayTemplate.content.cloneNode(true);
		day.querySelector('.day-bar').classList.add(`color-${color}`);
		const tooltiptext = day.querySelector('.tooltiptext');
		tooltiptext.querySelector('.day-title').innerHTML = curDate.toDateString();
		tooltiptext.querySelector('.data-text').innerHTML = text;
		rowDays.appendChild(day);
	}
	document.querySelector('.systems-status').appendChild(row);
}

function setCurrentStatus(stat) {
	const isOk = stat < 300;
	const color = isOk ? 'success' : 'danger';
	document.querySelectorAll('.actual-status-color').forEach(node => node.classList.add('color-'+color));
	let text;
	if (isOk) {
		text = 'All working good!';
	} else {
		text = `Something wrong... Http code ${stat}`;
	}
	document.querySelector('.actual-status').textContent = text;
}

async function retrieveData() {
	return fetch(dataUrl)
		.then(resp => {
			if (!resp.ok) {
				throw new Error(`Cannot load data: error ${resp.status}`);
			}
			return resp.json();
		})
		.then(data => {
			data.records.forEach((d, ind, arr) => {
				arr[ind].date = dateonly(new Date(d.date));
			});
			return data;
		});
}

async function setTotalUptime(data, measureType) {
	let totalUptime = 0, totalTime = 0;
	for (let i = findFirstDay(data); i < data.length; i++) {
		totalUptime += data[i][measureType].uptime;
		totalTime += data[i][measureType].uptime;
		totalTime += data[i][measureType].downtime;
	}
	document.querySelector('.container-data').textContent = (Math.floor(totalUptime / totalTime * 10000) / 100) + '%';
}

async function init() {
	return retrieveData()
		.then(data => {
			setCurrentStatus(data.status);
			document.querySelector('.systems-status').innerHTML = '';
			addStatusRow(data.records, 'homepage');
			setTotalUptime(data.records, 'homepage');
		});
}

init();
setInterval(init, 60*1000);
