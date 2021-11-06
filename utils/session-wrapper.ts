import {NextRequest, NextResponse} from "next/server";
import {NextApiRequest} from "next";
import {env} from "../env";
/*
import * as fs from 'fs'
*/
export class SessionWrapper {

    static async getSession(req: NextRequest | NextApiRequest | string): Promise<Session> {
        let sid: string;
        if (typeof req !== 'string') {
            console.log(typeof req);
            // @ts-ignore
            const {cookies} = req;
            if (!('sid' in cookies)) {
                return null;
            }
            sid = cookies['sid'];
        }
        else
        {
            // @ts-ignore
            sid = req as string;
        }

        const r = await fetch(`${env.SESSION_URL}/sessions/${sid}`);
        if (r.status !== 200) {
            return null;
        }

        const json = await r.json();
        return new Session(json);
    }

    static async hasSession(req: NextRequest): Promise<boolean> {
        const { cookies } = req;
        if (!('sid' in cookies)) {
            return false;
        }

        const r = await fetch(`${env.SESSION_URL}/sessions/${cookies['sid']}`);
        return r.status === 200;
    }

    static async createSession(req: NextRequest, res: NextResponse, sid?: {value: string}): Promise<NextResponse> {

        const r = await fetch(`${env.SESSION_URL}/sessions`, {
            method: 'POST'
        });

        const json = await r.json();

        if (sid)
            sid.value = json.sid;

        return res.cookie('sid', json.sid);

    }

}

export class Session {

    readonly sid: string;

    private _values: {[key: string]: any};

    constructor(json: {sid: string, [key: string]: any}) {
        this.sid = json.sid;
        delete json['sid'];
        this._values = json.values;
        this.set.bind(this);
        this.get.bind(this);
        this.values.bind(this);
        this.destroy.bind(this);
    }

    async set(name: string, value: any) {
        this._values[name] = value;
        console.log('New values: ' + JSON.stringify(this._values));
        const result = await fetch(`${env.SESSION_URL}/sessions/${this.sid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this._values)
        });
        if (result.status === 200)
        {
            this._values = await result.json();
            delete this._values['sid'];
        }
    }

    get(name: string): any {
        return this._values[name];
    }

    has(name: string): boolean {
        return name in this._values;
    }

    values(): {[key: string]: any} {
        return this._values;
    }

    async destroy() {
        this._values = {sid: null};
        await fetch(`${env.SESSION_URL}/sessions/${this.sid}`, {
            method: 'DELETE'
        })
    }

}