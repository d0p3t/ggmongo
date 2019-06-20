import { BulkUpdate, Count, Delete, Find, Insert, Update } from './common/crud';

const exp = (global as any).exports;

exp('insert', Insert);
exp('insertOne', (params, callback) => {
  if (params !== null && typeof params === 'object') {
    params.documents = [params.document];
    params.document = null;
  } else if (params !== null && typeof params === 'string') {
    params = JSON.parse(params);
    params.documents = [params.document];
    params.document = null;
  }
  return Insert(params, callback);
});

exp('find', Find);
exp('findOne', (params, callback) => {
  if (params !== null && typeof params === 'object') {
    params.limit = 1;
  } else if (params !== null && typeof params === 'string') {
    params = JSON.parse(params);
    params.limit = 1;
  }
  return Find(params, callback);
});

exp('update', Update);
exp('updateOne', (params, callback) => {
  return Update(params, callback, true);
});

exp('delete', Delete);
exp('deleteOne', (params, callback) => {
  return Delete(params, callback, true);
});

exp('count', Count);

exp('bulkUpdate', BulkUpdate);

on('onServerResourceStart', async (resourceName: string) => {
  if (GetCurrentResourceName() !== resourceName) {
    return;
  }
  await Count({ collection: 'user', query: {}, options: {} }, () => {
    console.warn(`[${new Date().toLocaleString()}] [DB] IGNORE SLOW QUERY WARNING: First query`);
  });
});
