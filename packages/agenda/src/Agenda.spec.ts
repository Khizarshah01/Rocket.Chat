import type { Db } from 'mongodb';

import { Agenda } from './Agenda';

describe('Agenda', () => {
	let spySetInterval: jest.SpyInstance;
	let spyClearInterval: jest.SpyInstance;

	beforeEach(() => {
		spySetInterval = jest.spyOn(global, 'setInterval');
		spyClearInterval = jest.spyOn(global, 'clearInterval');
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should create only one interval when start() is called concurrently', async () => {
		const mockDb = {
			collection: () => ({
				createIndex: async () => {
					// mock
				},
			}),
		} as unknown as Db;

		const agenda = new Agenda({
			mongo: mockDb,
			db: { collection: 'agendaJobs' },
		});

		// Call start() concurrently 3 times to trigger the race condition
		await Promise.all([agenda.start(), agenda.start(), agenda.start()]);

		expect(spySetInterval).toHaveBeenCalledTimes(1);

		const intervalHandle = spySetInterval.mock.results[0].value;

		await agenda.stop();

		expect(spyClearInterval).toHaveBeenCalledWith(intervalHandle);
	});
});
