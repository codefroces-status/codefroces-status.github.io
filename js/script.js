const dataUrl = 'data.json';

const daysToShow = 90;
const minutesPerDay = 24 * 60;
const msPerDay = minutesPerDay * 60 * 1000;
const COLORS = {
	success: '#6ab482',
	warning: '#f0be4e',
	danger:  '#9D3B2F'
};

function dateonly(date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addStatusRow(data) {
	const row = document.getElementById('status-row-template').content.cloneNode(true);
	const dayTemplate = document.getElementById('day-status-template');

	const rowDays = row.querySelector('.days');
	let curDate = dateonly(new Date()) - daysToShow * msPerDay;
	let start;
	for (start = 0; start < data.length && data[start] < curDate; start++);
	for (let i = 0; i < daysToShow; i++, curDate += msPerDay) {
		let color = 'nothing';
		let text = new Date(curDate).toDateString() + '<br>';
		if (start < data.length && data[start] === curDate) {
			const downtime = dayData.downtime;
			color = downtime == 0 ? 'success' : downtime <= 30 ? 'warning' : 'danger';
			text += `Downtime: ${downtime} minutes`;
			start++;
		} else {
			text += 'No data';
		}
		const day = dayTemplate.content.cloneNode(true);
		day.querySelector('.day-bar').classList.add(`color-${color}`);
		day.querySelector('.tooltiptext').textContent = text;
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
