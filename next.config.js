module.exports = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/user',
                permanent: true
            },
            {
                source: '/user/devices/:device',
                destination: '/user/devices/:device/console',
                permanent: true
            }
        ]
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:25003/api/:path*'
            },
            {
                source: '/sign-in',
                destination: 'http://localhost:4567/sign-in'
            }
        ]
    }
};