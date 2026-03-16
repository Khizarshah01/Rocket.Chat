import type { CronJobSummary } from '@rocket.chat/rest-typings';
import { ajv, validateUnauthorizedErrorResponse, validateForbiddenErrorResponse } from '@rocket.chat/rest-typings';

import { API } from '../api';

type CronJobDocument = {
    name: string;
    lockedAt?: Date | null;
    disabled?: boolean;
    failedAt?: Date;
    lastFinishedAt?: Date;
    lastRunAt?: Date;
    nextRunAt?: Date | null;
    repeatInterval?: string | number;
    failCount?: number;
};

/*
 Derive job status from Agenda metadata fields stored in rocketchat_cron.
 Priority order:
   1. lockedAt present + age > 10min -> 'stalled'
   2. lockedAt present -> 'running'
   3. disabled === true -> 'disabled'
   4. failedAt >= lastFinishedAt && failedAt > 0 -> 'failed'
   5. lastFinishedAt > 0 -> 'success'
   6. Otherwise -> 'idle'
 */
function deriveStatus(job: CronJobDocument): 'success' | 'failed' | 'running' | 'idle' | 'stalled' | 'disabled' {
    if (job.lockedAt) {
        const lockAge = Date.now() - new Date(job.lockedAt).getTime();
        if (lockAge > 10 * 60 * 1000) return 'stalled';
        return 'running';
    }
    if (job.disabled === true) return 'disabled';

    const failedAt = job.failedAt ? new Date(job.failedAt).getTime() : 0;
    const lastFinishedAt = job.lastFinishedAt ? new Date(job.lastFinishedAt).getTime() : 0;

    if (failedAt >= lastFinishedAt && failedAt > 0) {
        return 'failed';
    }
    if (lastFinishedAt > 0) {
        return 'success';
    }
    return 'idle';
}

API.v1.get(
    'cron.jobs',
    {
        authRequired: true,
        permissionsRequired: ['view-statistics'],
        response: {
            200: ajv.compile<{
                jobs: CronJobSummary[];
                success: true;
            }>({
                type: 'object',
                properties: {
                    jobs: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                lastRun: { type: ['string', 'null'] },
                                nextRun: { type: ['string', 'null'] },
                                repeatInterval: { type: 'string' },
                                lastStatus: {
                                    type: 'string',
                                    enum: ['success', 'failed', 'running', 'idle', 'stalled', 'disabled'],
                                },
                                failCount: { type: 'number' },
                            },
                            required: ['name', 'lastRun', 'nextRun', 'lastStatus', 'failCount'],
                            additionalProperties: false,
                        },
                    },
                    success: {
                        type: 'boolean',
                        enum: [true],
                    },
                },
                required: ['jobs', 'success'],
                additionalProperties: false,
            }),
            401: validateUnauthorizedErrorResponse,
            403: validateForbiddenErrorResponse,
        },
    },
    async function action() {
        // querying rocketchat_cron directly via MongoInternals.
        // During GSoC this i will be replaced by CoreJobsService
        // which accesses the collection through the proper service layer.
        const { MongoInternals } = await import('meteor/mongo');
        const rocketchatCron = MongoInternals.defaultRemoteCollectionDriver().mongo.db.collection('rocketchat_cron');

        const records = await rocketchatCron.find<CronJobDocument>({}).sort({ name: 1 }).toArray();

        const jobs = records.map((record): CronJobSummary => ({
            name: record.name,
            lastRun: record.lastRunAt ? new Date(record.lastRunAt).toISOString() : null,
            nextRun: record.nextRunAt ? new Date(record.nextRunAt).toISOString() : null,
            ...(record.repeatInterval !== undefined && { repeatInterval: String(record.repeatInterval) }),
            lastStatus: deriveStatus(record),
            failCount: typeof record.failCount === 'number' ? record.failCount : 0,
        }));

        return API.v1.success({ jobs });
    },
);