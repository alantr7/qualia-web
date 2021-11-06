import React, {useEffect, useState} from "react";
import style from './DriveContents.module.css'
import {useRouter} from "next/router";

import DirectoryImage from '../../public/images/folder-7-32.png';
import DriveContentsUpload from "./DriveContentsUpload";
import DriveContentsCreateFile from "./DriveContentsCreateFile";
import DriveContentsCreateDirectory from "./DriveContentsCreateDirectory";

export class DriveContentsItem extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            selected: false
        };
        this.focus = this.focus.bind(this);
        this.blur = this.blur.bind(this);
        this.render = this.render.bind(this);
        this.openDirectory = this.openDirectory.bind(this);
    }

    async openDirectory() {
        await this.props.openDirectory(this.props.id);
    }

    focus() {
        this.props.focus(this.props.id, this.props.directory);
    }

    blur() {
        this.props.blur(this.props.id);
    }

    render() {
        return (
            <tr onFocus={this.focus} onDoubleClick={this.openDirectory} onBlur={this.blur} tabIndex={0} className={
                (this.props.selected === this.props.id ? style.selected : '') + ' ' +
                (this.props.directory ? style.directory : '')
            }>
                <td>{this.props.name}</td>
                <td>02 04 21 17:43</td>
                <td>{this.props.created}</td>
                <td>{this.props.owner}</td>
                <td>{this.props.size}</td>
            </tr>
        );
    }

}

type IState = {
    selected: string,
    selectTimestamp: number,
    files: { id: string, name: string }[]
}

type FileDetails = {
    name: string,
    directory: boolean
}

export default function DriveContents(props) {

    const [selected, setSelected] = useState(null);
    const router = useRouter();

    let [files, setFiles] = useState([]);

    useEffect(() => {
        if (!router.isReady)
            return;
        console.log(router.query);
        fetch(`/api/v1/user/drive?path=${router.query.path ? router.query.path : ''}`).then(result => {
            result.json().then(json => {
                setFiles(json.files);
            })
        })
    }, [router.isReady, router.query.path]);

    function focus(id: string) {
        setSelected(id);
    }

    function blur() {
        setSelected(null);
    }

    async function openDirectory(path: string) {
        await router.push(`/drive?path=${router.query.path ? router.query.path : ''}/${path}`);
    }

    return (
        <>
            <input id={style.search}/>
            <div className={style.actions}>
                <DriveContentsUpload/>
                <DriveContentsCreateFile/>
                <DriveContentsCreateDirectory/>
            </div>
            <table className={style.files}>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Updated</th>
                    <th>Created</th>
                    <th>Owner</th>
                    <th>Size</th>
                </tr>
                </thead>
                <tbody>
                {
                    files.sort((a: FileDetails, b: FileDetails) => {
                        if (a.directory !== b.directory) {
                            return a.directory ? -1 : 1;
                        }
                        return a.name.localeCompare(b.name);
                    }).map((object) => {
                        return <DriveContentsItem
                            id={object.id}
                            name={object.name}
                            selected={selected}
                            owner={object.owner}
                            size={object.size}
                            directory={object.directory}
                            openDirectory={object.directory ? openDirectory : () => {}}
                            focus={focus}
                            blur={blur}
                        />
                    })
                }
                </tbody>
            </table>
        </>
    );

}