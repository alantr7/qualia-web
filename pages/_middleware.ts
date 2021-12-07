import {NextFetchEvent, NextRequest, NextResponse} from "next/server";

export default async function middleware(req: NextRequest, evt: NextFetchEvent) {

    let res = NextResponse.next();

    const response = await fetch('/api/auth/get_user', {
        headers: {
            'Cookie': 'sid=' + req.cookies['sid']
        }
    });

    res.headers.set('set-cookie', response.headers.get('set-cookie'));

    if (response.status === 200) {
        return res;
    }

    // Handle API authorization
    if (req.nextUrl.pathname.startsWith('/api/'))
    {
        if (req.nextUrl.pathname.startsWith('/api/auth/*')) {
            return res;
        }
        return NextResponse.redirect(`/login?return=${req.nextUrl.pathname}`);
    }
    else if (req.nextUrl.pathname !== '/login')
    {
        if (response.status === 401) {
            return NextResponse.redirect(`/login?return=${req.nextUrl.pathname}`);
        }
    }

    return res;

}