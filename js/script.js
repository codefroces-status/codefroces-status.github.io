const dataUrl = 'data.json';

const minutesPerDay = 24 * 60;
const COLORS = {
	success: '#6ab482',
	warning: '#f0be4e',
	danger:  '#9D3B2F'
};

function addStatusRow(data) {
	const row = document.getElementById('status-row-template').content.cloneNode(true);
	const dayTemplate = document.getElementById('day-status-template');

	const rowDays = row.querySelector('.days');
	for(const dayData of data) {
		const downtime = dayData.downtime;
		const color = downtime == 0 ? 'success' : downtime <= 30 ? 'warning' : 'danger';
		const day = dayTemplate.content.cloneNode(true);
		day.querySelector('.day-bar').classList.add(`color-${color}`);
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
