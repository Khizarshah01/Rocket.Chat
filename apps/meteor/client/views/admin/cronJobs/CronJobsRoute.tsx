import { usePermission } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';

import CronJobsPage from './CronJobsPage';
import NotAuthorizedPage from '../../notAuthorized/NotAuthorizedPage';

const CronJobsRoute = (): ReactElement => {
    const canViewStatistics = usePermission('view-statistics');

    // here i using the view-statistics permission now becuae this is poc and we need to create seprate permisson for this project like cron-jobs-permissions
    if (!canViewStatistics) {
        return <NotAuthorizedPage />;
    }

    return <CronJobsPage />;
};

export default CronJobsRoute;
