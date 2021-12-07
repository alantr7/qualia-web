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
                destination: 'http://localhost:25002/api/:path*'
            },
            {
                source: '/auth/:path*',
                destination: 'http://localhost:25002/auth/:path*'
            }
        ]
    }
};