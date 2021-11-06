import {NextApiRequest, NextApiResponse} from "next";
import {getSessionManager} from "../_app";
// import {getSessionManager} from "../_middleware";

export default (req: NextApiRequest, res: NextApiResponse) => {

    const session = getSessionManager().getSession(req);

    res.status(200).json({
        sid: req.cookies['sid'],
        values: session?.values(),
        cookies: req.cookies,
        a: 'zmaj',
        type: typeof session,
        sessionStorage: getSessionManager().cache
    });
/*
    res.status(200).json({
        Hello: 'World'
    })*/

}