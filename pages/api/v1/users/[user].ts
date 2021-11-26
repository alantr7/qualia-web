import {NextApiRequest, NextApiResponse} from "next";
import {Database} from "../../../../lib/database";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const user = req.query.user as string;
    const userObject = await Database.getUser("ID", user);

    if (userObject === null) {
        res.status(404).end();
    } else {
        res.json({
            username: userObject.username,
            last_activity: userObject.last_activity
        });
    }
}