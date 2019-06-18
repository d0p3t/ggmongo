import { InsertWriteOpResult } from 'mongodb';
import DbClient from './dbClient';
import { exportDocuments, safeCallback, safeObjectArgument, Wait } from './utils';

const durationAllowed = 100;

async function Insert(params: { collection: string; documents: Array<{}> }, callback) {
  try {
    do {
      await Wait(0);
    } while (!DbClient.initialized);

    const start = Date.now();

    const collection = DbClient.getParamsCollection(params);
    if (!collection) {
      console.info(`[${new Date().toLocaleString()}] [DB] Couldn't find collection in params.`);
      return;
    }

    const documents = params.documents;
    if (!documents || !Array.isArray(documents)) {
      console.info(`[${new Date().toLocaleString()}] [DB] Couldn't find documents in params.`);
      return;
    }

    const result: InsertWriteOpResult = await collection.insertMany(documents);
    safeCallback(callback, true, result.insertedCount, result.insertedIds);

    const duration = Date.now() - start;
    if (duration > durationAllowed) {
      console.warn(`[${new Date().toLocaleString()}] [DB] SLOW QUERY WARNING: Insert query took ${duration}ms.`);
    }
  } catch (error) {
    console.error(`[${new Date().toLocaleString()}] [DB] ${error.stack}`);
  }
}

async function Find(params: { collection; query; options?; limit? }, callback) {
  try {
    do {
      await Wait(0);
    } while (!DbClient.initialized);

    const start = Date.now();

    const collection = DbClient.getParamsCollection(params);
    if (!collection) {
      console.info(`[${new Date().toLocaleString()}] [DB] Couldn't find collection in params.`);
      return;
    }

    const query = safeObjectArgument(params.query);
    const options = safeObjectArgument(params.options);

    let cursor = await collection.find(query, options);
    if (params.limit) {
      cursor = cursor.limit(params.limit);
    }
    let documents: any[] = [];
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      documents.push(doc);
    }
    safeCallback(callback, true, exportDocuments(documents));

    const duration = Date.now() - start;
    if (duration > durationAllowed) {
      console.warn(`[${new Date().toLocaleString()}] [DB] SLOW QUERY WARNING: Find query took ${duration}ms.`);
    }
  } catch (error) {
    console.error(`[${new Date().toLocaleString()}] [DB] ${error.stack}`);
  }
}

async function Update(params: { collection; query; update; options? }, callback, isUpdateOne) {
  try {
    do {
      await Wait(0);
    } while (!DbClient.initialized);

    const start = Date.now();

    const collection = DbClient.getParamsCollection(params);
    if (!collection) {
      console.info(`[${new Date().toLocaleString()}] [DB] Couldn't find collection in params.`);
      return;
    }

    const query = safeObjectArgument(params.query);
    const update = safeObjectArgument(params.update);
    const options = safeObjectArgument(params.options);

    const cb = (err, res) => {
      if (err) {
        console.error(`update: Error ${err.message}`);
        safeCallback(callback, false, err.message);
        return;
      }
      safeCallback(callback, true, res.result.nModified);

      const duration = Date.now() - start;
      if (duration > durationAllowed) {
        console.warn(
          `[${new Date().toLocaleString()}] [DB] SLOW QUERY WARNING: Update query took ${duration}ms.`,
        );
      }
    };

    isUpdateOne
      ? await collection.updateOne(query, update, options, cb)
      : await collection.updateMany(query, update, options, cb);
  } catch (error) {
    console.error(`[${new Date().toLocaleString()}] [DB] ${error.stack}`);
  }
}

async function Count(params: { collection; query; options }, callback) {
  try {
    do {
      await Wait(0);
    } while (!DbClient.initialized);

    const start = Date.now();

    const collection = DbClient.getParamsCollection(params);
    if (!collection) {
      console.log(`[${new Date().toLocaleString()}] [DB] Couldn't find collection in params.`);
      return;
    }

    const query = safeObjectArgument(params.query);
    const options = safeObjectArgument(params.options);

    await collection.countDocuments(query, options, (err, count) => {
      if (err) {
        console.error(`[${new Date().toLocaleString()}] [DB] count: Error ${err.message}`);
        safeCallback(callback, false, err.message);
        return;
      }
      safeCallback(callback, true, count);

      const duration = Date.now() - start;
      if (duration > durationAllowed) {
        console.warn(
          `[${new Date().toLocaleString()}] [DB] SLOW QUERY WARNING: Count query took ${duration}ms.`,
        );
      }
    });
  } catch (error) {
    console.error(`[${new Date().toLocaleString()}] [DB] ${error.stack}`);
  }
}

async function Delete(params: { collection; query; options }, callback, isDeleteOne) {
  try {
    do {
      await Wait(0);
    } while (!DbClient.initialized);

    const start = Date.now();

    const collection = DbClient.getParamsCollection(params);
    if (!collection) {
      console.info(`[${new Date().toLocaleString()}] [DB] Couldn't find collection in params.`);
      return;
    }

    const query = safeObjectArgument(params.query);
    const options = safeObjectArgument(params.options);
    const cb = (err, res) => {
      if (err) {
        console.error(`[${new Date().toLocaleString()}] [DB] delete: Error ${err.message}`);
        safeCallback(callback, false, err.message);
        return;
      }
      safeCallback(callback, true, res.result.n);
      const duration = Date.now() - start;
      if (duration > durationAllowed) {
        console.warn(
          `[${new Date().toLocaleString()}] [DB] SLOW QUERY WARNING: Delete query took ${duration}ms.`,
        );
      }
    };

    isDeleteOne ? await collection.deleteOne(query, options, cb) : await collection.deleteMany(query, options, cb);
  } catch (error) {
    console.error(`[${new Date().toLocaleString()}] [DB] ${error.stack}`);
  }
}

setImmediate(async () => {
  await DbClient.connect();
});

export { Count, Delete, Find, Insert, Update };
