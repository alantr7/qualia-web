import {NextApiRequest, NextApiResponse} from "next";
import * as fs from 'fs';
import {getUser} from "../../../../../lib/get-user";

export default async (req: NextApiRequest, res: NextApiResponse) => {

    const path = req.query.path;

    if (path === undefined) {
        res.status(400).end();
        return;
    }

    const user = await getUser(req);

    const realPath = `./data/users/${user.id}/drive/${path}`;

    if (fs.existsSync(`${realPath}.meta.json`)) {
        const stat = fs.statSync(`${realPath}.file`);

        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Length': stat.size
        });
        fs.createReadStream(`${realPath}.file`).pipe(res);
        return;
    }

    res.status(404).end();

}