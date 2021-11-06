import {NextRequest, NextResponse} from "next/server";
import {NextApiRequest, NextApiResponse} from "next";
import {getUser} from "../../../../lib/get-user";
import * as fs from "fs";

const getFile = async (req, res: NextApiResponse, path) => {

    const user = await getUser(req);

    let realPath = `./data/users/${user.id}/drive/${path}`;
    if (realPath.endsWith('/'))
        realPath = realPath.substr(0, realPath.length - 1);

    if (fs.existsSync(realPath) && fs.lstatSync(realPath).isDirectory()) {
        const files = [];
        fs.readdirSync(realPath).forEach(fileName => {
            if (fs.lstatSync(`${realPath}/${fileName}`).isDirectory()) {
                files.push({
                    id: fileName,
                    name: fileName,
                    directory: true
                });
            }
            else {
                if (fileName.endsWith('.file'))
                    return;

                const meta = fs.readFileSync(`${realPath}/${fileName}`).toString();
                files.push({
                    id: fileName.substr(0, fileName.indexOf('.')),
                    ...JSON.parse(meta),
                    directory: false
                });
            }
        });
        res.json({
            files: files
        })
    }
    else if (fs.existsSync(`${realPath}.meta.json`))
    {
        res.json(JSON.parse(fs.readFileSync(`${realPath}.meta.json`).toString()));
    }
    else
    {
        res.status(404).end();
    }

};

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET')
    {
        await getFile(req, res, req.query.path || '');
        return;
    }
}