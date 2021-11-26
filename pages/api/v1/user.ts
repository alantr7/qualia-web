import ApiRequest from "../../../utils/api-request";
import {NextApiResponse} from "next";
import {getUser} from "../../../lib/get-user";

export default async (req: ApiRequest, res: NextApiResponse) => {

    const user = await getUser(req, res);

    if (user === null) {
        res.status(401).end();
        return;
    }

    delete user.password;

    delete user.services;

    res.status(200).json(user);

}