import {NextApiResponse} from "next";
import {SessionWrapper} from "../../../../utils/session-wrapper";

export default async (req, res: NextApiResponse) => {

    const session = await SessionWrapper.getSession(req);

    if (session) {
        await session.destroy();
    }

    res.status(200).end();

}