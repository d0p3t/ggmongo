import { Db, MongoClient } from 'mongodb';

class DbClient {
  public client: MongoClient;
  public db: Db;
  public initialized: boolean;

  public constructor() {
    this.client = new MongoClient('mongodb://localhost:27017/gungame', { useNewUrlParser: true });
    this.initialized = false;
  }

  public async connect(): Promise<boolean> {
    if (!this.db) {
      try {
        await this.client.connect();
        this.db = this.client.db('gungame');
        this.initialized = true;
        console.info(`[${new Date().toLocaleString()}] [DB] Connected to Database`);
      } catch (error) {
        console.error(error.stack);
      }
    }
    return this.initialized;
  }

  public async close() {
    try {
      await this.client.close();
      console.info(`[${new Date().toLocaleString()}] [DB] Disconnected from Database`);
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] [DB] close: Error ${error.message}`);
    }
  }

  public getParamsCollection(params) {
    if (!params.collection) {
      return;
    }
    return this.db.collection(params.collection);
  }
}

export default new DbClient();
