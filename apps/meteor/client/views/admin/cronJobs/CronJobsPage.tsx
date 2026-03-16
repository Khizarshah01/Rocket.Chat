import { States, StatesIcon, StatesTitle, StatesActions, StatesAction } from '@rocket.chat/fuselage';
import { Page, PageHeader, PageContent } from '@rocket.chat/ui-client';
import { useEndpoint } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { Box, Icon, Table, TableHead, TableRow, TableCell, TableBody, TextInput, Select, Margins } from '@rocket.chat/fuselage';

import type { CronJobSummary } from '@rocket.chat/rest-typings';

const CronJobsPage = (): ReactElement => {
    const [filter, setFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | CronJobSummary['lastStatus']>('all');

    const getCronJobs = useEndpoint('GET', '/v1/cron.jobs');

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['cron.jobs'],
        queryFn: () => getCronJobs(),
    });

    const statusOptions = useMemo<[string, string][]>(
        () => [
            ['all', 'All Statuses'],
            ['running', 'Running'],
            ['success', 'Success'],
            ['failed', 'Failed'],
            ['idle', 'Idle'],
        ],
        [],
    );

    const filteredJobs = useMemo(() => {
        if (!data?.jobs) return [];

        return data.jobs.filter((job) => {
            const matchesName = job.name.toLowerCase().includes(filter.toLowerCase());
            const matchesStatus = statusFilter === 'all' || job.lastStatus === statusFilter;
            return matchesName && matchesStatus;
        });
    }, [data?.jobs, filter, statusFilter]);

    const header = useMemo(
        () => [
            <TableCell key='name' is='th'>Name</TableCell>,
            <TableCell key='status' is='th'>Status</TableCell>,
            <TableCell key='lastRun' is='th'>Last Run</TableCell>,
            <TableCell key='nextRun' is='th'>Next Run</TableCell>,
        ],
        [],
    );

    const formatDate = (iso: string | null): string => {
        if (!iso) return '—';
        return new Date(iso).toLocaleString();
    };

    return (
        <Page flexDirection='row'>
            <Page>
                <PageHeader title='Background Jobs' />
                <PageContent>
                    <Box mb={16} display='flex' flexWrap='wrap' alignItems='center'>
                        <Margins inlineEnd={16}>
                            <TextInput
                                placeholder='Search jobs'
                                value={filter}
                                onChange={(e) => setFilter((e.target as HTMLInputElement).value)}
                                addon={<Icon name='magnifier' size='x20' />}
                                flexGrow={2}
                                minWidth='x220'
                            />
                        </Margins>
                        <Box mb={4} width='unset'>
                            <Select
                                value={statusFilter}
                                options={statusOptions}
                                onChange={(val) => setStatusFilter(val as typeof statusFilter)}
                            />
                        </Box>
                    </Box>

                    {isLoading && (
                        <Box display='flex' justifyContent='center' p={24} color='hint'>
                            Loading jobs…
                        </Box>
                    )}

                    {isError && (
                        <States>
                            <StatesIcon name='warning' variation='danger' />
                            <StatesTitle>Something went wrong</StatesTitle>
                            <StatesActions>
                                <StatesAction onClick={() => refetch()}>Retry</StatesAction>
                            </StatesActions>
                        </States>
                    )}

                    {!isLoading && !isError && (
                        <Box marginBlock='none' marginInline='auto' width='full'>
                            <Table>
                                <TableHead>
                                    <TableRow>{header}</TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredJobs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <Box display='flex' justifyContent='center' color='hint' p={16}>
                                                    No jobs found.
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredJobs.map((job) => (
                                            <TableRow key={job.name} action>
                                                <TableCell>
                                                    <Box fontScale='p2' color='default' withTruncatedText>
                                                        {job.name}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display='flex' alignItems='center'>
                                                        {job.lastStatus}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{formatDate(job.lastRun)}</TableCell>
                                                <TableCell>
                                                    <Box display='flex' alignItems='center'>
                                                        {formatDate(job.nextRun)}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </PageContent>
            </Page>
        </Page>
    );
};

export default CronJobsPage;
