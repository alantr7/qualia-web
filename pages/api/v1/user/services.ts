import {NextApiRequest, NextApiResponse} from "next";
import {getUser} from "../../../../lib/get-user";
import {Database} from "../../../../lib/database";

export default async (req: NextApiRequest, res: NextApiResponse) => {

    const user = await getUser(req, res);

    if (!user) {
        res.status(401).end();
    }

    if (req.method === 'POST')
    {
        const service = await Database.getService(req.body.id);
        if (!service) {
            res.status(400).json({
                details: 'Service not found.'
            });
        }
        if (!(req.body.id in user.services)) {
            await user.registerService('devices')
        }
        res.status(200).json({
            id: service.id,
            name: service.name,
            description: service.description,
            endpoint: `/api/v1/user/services/${service.id}/`
        })
    }
    else if (req.method === 'GET')
    {
        let services = {};
        for (const id in user.services) {
            const service = await Database.getService(id);
            services[id] = {
                id: id,
                name: service.name,
                description: service.description,
                endpoint: `/api/v1/user/services/${id}/`
            }
        }
        res.status(200).json(services);
    }
    else
    {
        res.status(404).end()
    }

}