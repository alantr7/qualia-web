import {NextApiRequest, NextApiResponse} from "next";
import {createFolder} from "../../../../../../utils/drive";

export default async (req: NextApiRequest, res: NextApiResponse) => {

    const folder = req.body.folder;

    // Create a new directory
    if (req.method === 'POST')
    {

        createFolder(folder, req.body.name);

    }

}