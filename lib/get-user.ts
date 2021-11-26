import {NextApiRequest, NextApiResponse} from "next";
import {Database} from "./database";
import {NextRequest} from "next/server";
import {SessionWrapper} from "../utils/session-wrapper";
import {User} from "../models/User";

export const getUser = async (req: NextRequest | NextApiRequest): Promise<User> => {

    const session = await SessionWrapper.getSession(req);

    if (session.has('user')) {
        return Database.getUser("ID", session.get('user').id);
    }

    return null;

};