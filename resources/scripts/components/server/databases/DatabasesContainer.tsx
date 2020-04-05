import React, { useEffect, useState } from 'react';
import getServerDatabases from '@/api/server/getServerDatabases';
import { ServerContext } from '@/state/server';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';
import DatabaseRow from '@/components/server/databases/DatabaseRow';
import Spinner from '@/components/elements/Spinner';
import { CSSTransition } from 'react-transition-group';
import CreateDatabaseButton from '@/components/server/databases/CreateDatabaseButton';
import Can from '@/components/elements/Can';

export default () => {
    const [ loading, setLoading ] = useState(true);
    const server = ServerContext.useStoreState(state => state.server.data!);
    const databases = ServerContext.useStoreState(state => state.databases.items);
    const { setDatabases, appendDatabase, removeDatabase } = ServerContext.useStoreActions(state => state.databases);
    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    useEffect(() => {
        setLoading(!databases.length);
        clearFlashes('databases');

        getServerDatabases(server.uuid)
            .then(databases => {
                setDatabases(databases);
                setLoading(false);
            })
            .catch(error => addFlash({
                key: 'databases',
                title: 'Error',
                message: httpErrorToHuman(error),
                type: 'error',
            }));
    }, []);

    return (
        <div className={'my-10 mb-6'}>
            <FlashMessageRender byKey={'databases'}/>
            {loading ?
                <Spinner size={'large'} centered={true}/>
                :
                <CSSTransition classNames={'fade'} timeout={250}>
                    <>
                        {databases.length > 0 ?
                            databases.map((database, index) => (
                                <DatabaseRow
                                    key={database.id}
                                    databaseId={database.id}
                                    onDelete={() => removeDatabase(database)}
                                    className={index > 0 ? 'mt-1' : undefined}
                                />
                            ))
                            :
                            <p className={'text-center text-sm text-neutral-400'}>
                                {server.featureLimits.databases > 0 ?
                                    `It looks like you have no databases.`
                                    :
                                    `Databases cannot be created for this server.`
                                }
                            </p>
                        }
                        <Can action={'database.create'}>
                            {server.featureLimits.databases > 0 &&
                            <div className={'mt-6 flex justify-end'}>
                                <CreateDatabaseButton onCreated={appendDatabase}/>
                            </div>
                            }
                        </Can>
                    </>
                </CSSTransition>
            }
        </div>
    );
};
