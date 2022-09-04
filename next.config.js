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
                destination: 'http://194.99.22.39:9032/api/:path*'
                // destination: 'http://localhost:9032/api/:path*'
            },
            {
                source: '/auth',
                destination: 'http://194.99.22.39:9032/auth'
            }
        ]
    }
};