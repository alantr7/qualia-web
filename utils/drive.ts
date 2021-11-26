import fs from 'fs';

export const createFolder = (path: string, name: string): {
    id: string,
    name: string
} => {

    if (!fs.existsSync(path)) {

    }

    return {
        id: 'id',
        name: name
    };

};