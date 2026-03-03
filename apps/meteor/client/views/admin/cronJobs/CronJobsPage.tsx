import { Page, PageHeader, PageContent } from '@rocket.chat/ui-client';
import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { Box, Table, TableHead, TableRow, TableCell, TableBody, TextInput, Select, Margins } from '@rocket.chat/fuselage';

const fakeJobs = [
    { name: 'user data dowloaded', status: 'running', nextRun: '10:38', lastRun: '10:36' },
    { name: 'Prune old messages', status: 'failed', nextRun: '-', lastRun: '1 days ago' },
    { name: 'Generate download files', status: 'idle', nextRun: 'today', lastRun: 'Yesterday' },
];

const CronJobsPage = (): ReactElement => {
    const statusOptions = useMemo<[string, string][]>(
        () => [
            ['all', 'All Statuses'],
            ['running', 'Running'],
            ['idle', 'Idle'],
            ['failed', 'Failed'],
        ],
        [],
    );

    const header = useMemo(
        () => [
            <TableCell key='name' is='th'>Name</TableCell>,
            <TableCell key='status' is='th'>Status</TableCell>,
            <TableCell key='lastRun' is='th'>Last run</TableCell>,
            <TableCell key='nextRun' is='th'>Next run</TableCell>,
        ],
        [],
    );

    return (
        <Page flexDirection='row'>
            <Page>
                <PageHeader title='Background Jobs' />
                <PageContent>
                    <Box mb={16} display='flex' flexWrap='wrap' alignItems='center'>
                        <Margins inlineEnd={16}>
                            <TextInput
                                placeholder='Search Jobs'
                                flexGrow={2}
                                minWidth='x220'
                            />
                        </Margins>
                        <Box mb={4} width='unset'>
                            <Select
                                value='all'
                                options={statusOptions}
                                onChange={() => { }}
                            />
                        </Box>
                    </Box>
                    <Box marginBlock='none' marginInline='auto' width='full'>
                        <Table>
                            <TableHead>
                                <TableRow>{header}</TableRow>
                            </TableHead>
                            <TableBody>
                                {fakeJobs.map((job) => (
                                    <TableRow key={job.name} action>
                                        <TableCell>
                                            <Box fontScale='p2' color='default' withTruncatedText>
                                                {job.name}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box display='flex' alignItems='center'>
                                                {job.status}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{job.lastRun}</TableCell>
                                        <TableCell>{job.nextRun}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </PageContent>
            </Page>
        </Page>
    );
};

export default CronJobsPage;
