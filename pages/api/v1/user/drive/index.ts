import {NextRequest, NextResponse} from "next/server";
import {NextApiRequest, NextApiResponse} from "next";
import {getUser} from "../../../../../lib/get-user";
import * as fs from "fs";
import formidable, {Files} from "formidable";
import PersistentFile from "formidable/PersistentFile";

export const config = {
    api: {
        bodyParser: false
    }
};

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

const uploadFile = async (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise((async (resolve) => {

        const path = (req.query.path ? req.query.path : '') as string;
        const user = await getUser(req);

        console.log(user.id);

        let name;
        let extension;

        if (req.headers["content-type"] === 'application/json') {
            const body = req.body;
            console.log(req.body);
            if (body.directory) {
                fs.mkdirSync(path + '/' + body.name);

                res.status(200).end();
                resolve(body);
                return;
            }
        }

        const form = new formidable.IncomingForm({
            uploadDir: `./data/users/${user.id}/drive/${path}`,
            filename: ((_name, _ext) => {
                name = _name;
                extension = _ext;
                return Date.now() + '.file';
            })
        });

        form.parse(req, (err, fields, files) => {

            const file = files.file as {
                filepath,
                originalFilename,
                newFilename,
                size
            };

            const id = file.newFilename.substr(0, file.newFilename.indexOf('.'));

            fs.writeFileSync(`./data/users/${user.id}/drive/${path}/${id}.meta.json`, JSON.stringify({
                id: id,
                name: name,
                extension: file.originalFilename.length !== name.length
                    ? file.originalFilename.substr(name.length + 1)
                    : name,
                size: file.size
            }));

            resolve(files);

        });

    }));
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET')
    {
        await getFile(req, res, req.query.path || '');
        return;
    }
    else if (req.method === 'POST')
    {
        await uploadFile(req, res);
        res.json({});
        return;
    }
}