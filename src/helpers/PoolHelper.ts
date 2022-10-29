import dotenv from "dotenv";
import mysql from "mysql";
import { ArrayHelper } from "../apiBase/helpers";

dotenv.config();

export class PoolHelper {
  public static pools: { name: string, pool: mysql.Pool }[] = [];

  public static getPool(databaseName: string) {
    let result = ArrayHelper.getOne(PoolHelper.pools, "name", databaseName);
    if (!result) {
      this.initPool(databaseName);
      result = ArrayHelper.getOne(PoolHelper.pools, "name", databaseName);
    }
    return result.pool;
  }

  public static initPool(databaseName: string) {
    const connectionString = process.env["CONNECTION_STRING_" + databaseName.toUpperCase()]
    const config = this.getConfig(connectionString);

    const pool = mysql.createPool({
      connectionLimit: 3,
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.userName,
      password: config.password,
      multipleStatements: true,
      waitForConnections: true,
      queueLimit: 50,
      typeCast: function castField(field, useDefaultTypeCasting) {
        // convert bit(1) to bool
        if ((field.type === "BIT") && (field.length === 1)) {
          try {
            const bytes = field.buffer();
            return (bytes[0] === 1);
          } catch (e) { return false; }
        }
        return (useDefaultTypeCasting());
      }
    });
    PoolHelper.pools.push({ name: databaseName, pool })
  }

  // a bit of a hack
  private static getConfig = (connectionString: string) => {
    // mysql://user:password@host:port/dbName
    const firstSplit = connectionString.replace("mysql://", "").split("@");
    const userPass = firstSplit[0].split(":");
    const userName = userPass[0];
    const password = userPass[1];

    const hostDb = firstSplit[1].split("/");
    const database = hostDb[1];
    const hostPort = hostDb[0].split(':');
    const host = hostPort[0];
    const port = parseInt(hostPort[1], 0)

    return { host, port, database, userName, password }

  }

}


