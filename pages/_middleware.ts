import {NextFetchEvent, NextRequest, NextResponse} from "next/server";
import {SessionWrapper} from "../utils/session-wrapper";
import {getUser} from "../lib/get-user";


export default async function middleware(req: NextRequest, evt: NextFetchEvent) {

    let res = NextResponse.next();

    let sid = {
        value: null
    };

    if (!await SessionWrapper.hasSession(req)) {
        res = await SessionWrapper.createSession(req, res, sid);
    }
    else
    {
        sid.value = (await SessionWrapper.getSession(req)).sid;
    }

    // Handle API authorization
    if (req.nextUrl.pathname.startsWith('/api/'))
    {

    }
    else if (req.nextUrl.pathname !== '/login')
    {
        if (!(await SessionWrapper.getSession(sid.value)).has('user')) {
            return NextResponse.redirect(`/login?return=${req.nextUrl.pathname}`);
        }
    }

    return res;

}