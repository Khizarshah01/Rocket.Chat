/**
 * Summarised view of a single scheduled job derived from
 * the rocketchat_cron collection metadata fields.
 */
export type CronJobSummary = {
    name: string;
    lastRun: string | null;
    nextRun: string | null;
    repeatInterval?: string;
    lastStatus: 'success' | 'failed' | 'running' | 'idle' | 'stalled' | 'disabled';
    failCount: number;
};

export type CronEndpoints = {
    '/v1/cron.jobs': {
        GET: () => {
            jobs: CronJobSummary[];
        };
    };
};