import * as mysql from "mysql";
import {Connection} from "mysql";
import {env} from "../env";
import bcrypt from 'bcrypt'
import {User} from "../models/User";

type Service = {
    id: string,
    name: string,
    description: string
}

export class Database {

    static async getUser(by: 'ID' | 'EMAIL', value: string): Promise<User> {
        const connection = await Database.createConnection();
        return new Promise<User>((resolve, reject) => {
            connection.query(`SELECT * FROM users WHERE ${by.toLowerCase()} = ?`, [value],
                (err, res, fields) => {

                connection.destroy();

                if (err || Object.keys(res).length === 0) {
                    resolve(null);
                    return;
                }

                const user = res[0];
                user.services = JSON.parse(user.services) as {[key: string]: string};

                user.registerService = async (key: string) => {
                    user.services[key] = bcrypt.hashSync(key, 4);
                    await this.setUserServices(user.id, user.services);
                };

                user.unregisterService = async (key: string) => {
                   delete user.services[key];
                    await this.setUserServices(user.id, user.services);
                };

                resolve(user);

            });
        });
    }

    private static async setUserServices(id: string, services) {
        const connection = await Database.createConnection();
        return new Promise((resolve) => {
            connection.query(`UPDATE users SET services = ? WHERE id = ?`, [JSON.stringify(services), id],
                (err, res, fields) => {

                    connection.destroy();

                    resolve(res);

                });
        });
    }

    static async getService(id: string): Promise<Service> {
        const connection = await Database.createConnection();
        return new Promise<Service>((resolve, reject) => {
            connection.query(`SELECT * FROM services WHERE id = ?`, [id],
                (err, res, fields) => {

                    connection.destroy();

                    if (err || Object.keys(res).length === 0) {
                        resolve(null);
                        return;
                    }

                    resolve(res[0]);

                });
        });
    }

    static async createConnection(): Promise<Connection> {
        const connection = mysql.createConnection({
            host: env.DB_HOST,
            user: env.DB_USER,
            password: env.DB_PASS,
            database: 'qualia'
        });
        return new Promise<Connection>((resolve, reject) => {
            connection.connect((err) => {
                if (err) {
                    reject(err);
                }
                resolve(connection);
            });
        });
    }

}