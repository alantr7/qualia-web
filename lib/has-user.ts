import {NextRequest, NextResponse} from "next/server";
import {getSession} from "../pages/_app";
import {getUser} from "./get-user";
import {NextApiRequest, NextApiResponse} from "next";

export async function hasUser(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {

    const session = await getSession(req, res);

    return !!session.user;

}
