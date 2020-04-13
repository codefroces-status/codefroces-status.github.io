const dataUrl = 'data.json';

const daysToShow = 90;
const minutesPerDay = 24 * 60;
const msPerDay = minutesPerDay * 60 * 1000;
const COLORS = {
	success: '#6ab482',
	warning: '#f0be4e',
	danger:  '#9D3B2F'
};

function minutesToTime(minutes) {
	const hours = ('0' + Math.floor(minutes / 60)).slice(-2);
	minutes = ('0' + (minutes % 60)).slice(-2);
	return `${hours}:${minutes}`;
}

function dateonly(date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addStatusRow(data) {
	console.log(data);
	const row = document.getElementById('status-row-template').content.cloneNode(true);
	const dayTemplate = document.getElementById('day-status-template');

	const rowDays = row.querySelector('.days');
	let curDate = new Date(dateonly(new Date()) - (daysToShow-1) * msPerDay);
	let start;
	for (start = 0; start < data.length && data[start].time < curDate; start++);
	for (let i = 0; i < daysToShow; i++, curDate = new Date(curDate.getTime() + msPerDay)) {
		let color = 'nothing';
		let text;
		if (start < data.length && data[start].time.getTime() == curDate.getTime()) {
			console.log(data[start].time, curDate);
			const downtime = data[start].downtime;
			color = downtime == 0 ? 'success' : downtime <= 30 ? 'warning' : 'danger';
			text = `Downtime: <b>${minutesToTime(downtime)}</b>`;
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
	document.querySelector('.container').appendChild(row);
}

function setCurrentStatus(stat) {
	const color = stat < 300 ? COLORS.success : COLORS.danger;
	document.querySelectorAll('.current-status-color').forEach(node => node.style.background = color);
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
				arr[ind].time = dateonly(new Date(d.time));
			});
			return data;
		});
}

async function init() {
	return retrieveData()
		.then(data => {
			setCurrentStatus(data.status);
			addStatusRow(data.records);
		});
}

init();
