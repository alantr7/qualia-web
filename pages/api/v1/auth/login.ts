import {NextApiRequest, NextApiResponse} from "next";
import ApiRequest from "../../../../utils/api-request";
import bcrypt from 'bcrypt'

import {Database} from "../../../../lib/database";
import {SessionWrapper} from "../../../../utils/session-wrapper";

export default async (req: ApiRequest, res: NextApiResponse) => {

    if (req.method !== 'POST') {
        res.status(404).end();
    }

    const session = await SessionWrapper.getSession(req);

    if (session.has('user')) {
        res.status(200).json({
            id: session.get('user').id,
            username: session.get('user').username,
            details: 'Already logged in.'
        });
        return;
    }

    const [ email, password ] = [ req.body.email, req.body.password ];

    if (!email || !password) {
        res.status(400).end();
    }

    const user = await Database.getUser("EMAIL", email);
    if (!user) {
        res.status(404).end();
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
        await session.set('user', {
            id: user.id,
            username: user.username
        });
        res.status(200).json({
            id: user.id,
            username: user.username,
            details: 'Successfully logged in.'
        });
    } else {
        res.status(401).end();
    }


}