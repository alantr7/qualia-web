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
    }
};