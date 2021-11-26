import {NextApiRequest} from "next";

export default interface ApiRequest extends NextApiRequest {

    method: string

}