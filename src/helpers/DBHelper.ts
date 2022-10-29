import { PoolHelper } from "./PoolHelper";
import { PoolConnection, MysqlError, queryCallback } from "mysql";
import { LoggingHelper } from "../apiBase";

export class DBHelper {

  // wraps in promise
  static async getConnection(databaseName: string) {
    const promise: Promise<PoolConnection> = new Promise((resolve, reject) => {
      PoolHelper.getPool(databaseName).getConnection((ex: MysqlError, conn: PoolConnection) => { if (ex) reject(ex); else resolve(conn); });
    });;
    const connection: PoolConnection = await promise;
    return connection;
  }

  // wraps in promise
  static async getQuery(connection: PoolConnection, sql: string, params: any[]) {
    const promise: Promise<queryCallback> = new Promise((resolve, reject) => {
      connection.query(sql, params, async (ex, rows) => {
        if (ex) { LoggingHelper.getCurrent().error(ex); reject(ex); }
        else { resolve(rows); }
      });
    });
    const query: queryCallback = await promise;
    return query;
  }

  public static async query(db: string, sql: string, params: any[]) {
    let result: any = null;
    const connection = await this.getConnection(db);
    try { result = await this.getQuery(connection, sql, params); }
    catch (ex) { LoggingHelper.getCurrent().error(ex); }
    finally { connection.release(); }
    return result;
  }


}