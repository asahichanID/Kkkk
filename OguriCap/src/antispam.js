import { checkIncomingSpam } from './botGuard.js';

const usedCommandRecently = new Set();

const isFiltered = (from) => !!usedCommandRecently.has(from);

const addFilter = (from) => {
	usedCommandRecently.add(from);
	setTimeout(() => usedCommandRecently.delete(from), 3000);
};

export const antiSpam = {
	isFiltered,
	addFilter,
	check: checkIncomingSpam
};

export { checkIncomingSpam };
