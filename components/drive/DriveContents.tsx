import React, {useEffect, useState} from "react";
import style from './DriveContents.module.css'
import {useRouter} from "next/router";

import DirectoryImage from '../../public/images/folder-7-32.png';
import DriveUploadingContainer from "./DriveUploadingContainer";
import DriveContentsDetails from "./DriveContentsDetails";

export class DriveContentsItem extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            selected: false
        };
        this.select = this.select.bind(this);
        this.render = this.render.bind(this);
        this.openDirectory = this.openDirectory.bind(this);
    }

    async openDirectory() {
        await this.props.openDirectory(this.props.id);
    }

    select(evt) {
        evt.stopPropagation();
        this.props.focus(this.props.id, this.props.directory);
    }

    render() {
        return (
            <tr onClick={this.select} onContextMenu={this.select} onDoubleClick={this.openDirectory} tabIndex={0}
                className={
                    (this.props.selected === this.props.id ? style.selected : '') + ' ' +
                    (this.props.directory ? style.directory : '')
                }>
                <td>{this.props.name}.{this.props.extension}</td>
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
    const [lastUpdate, setLastUpdate] = useState(0);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const router = useRouter();

    let [files, setFiles] = useState([]);

    function getFile(id: string) {
        return files.find(file => file.id === id);
    }

    useEffect(() => document.onclick = () => setSelected(null), [typeof document]);

    useEffect(() => {
        if (!router.isReady) return;
        console.log(router.query);
        fetch(`/api/v1/user/drive?path=${router.query.path ? router.query.path : ''}`).then(result => {
            result.json().then(json => {
                setFiles(json.files);
            })
        })
    }, [router.isReady, router.query.path, lastUpdate]);

    function focus(id: string) {
        setSelected(id);
    }

    async function openDirectory(path: string) {
        let url = (router.query.path ? router.query.path : '') as string;
        if (!url.endsWith('/')) url += '/';
        await router.push(`/drive?path=${url}${path}`);
        setSelected(null);
    }

    function refresh() {
        setLastUpdate(Date.now());
    }

    function download(id: string, extension: string) {
        const link = document.createElement('a');
        link.setAttribute('href', `/api/v1/user/drive/download?path=${router.query.path ? router.query.path + '/' : ''}${id}`);
        link.setAttribute('download', `${getFile(id).name}.${extension}`);

        link.click();
        link.remove();
    }

    function upload() {
        document.getElementById('uploading-files').click();
    }

    async function createDirectory() {
        await fetch('/api/v1/user/drive', {
            method: 'post',
            body: JSON.stringify({
                directory: true,
                name: "New Folder"
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        refresh();
    }

    async function deleteFile(id: string) {

    }

    return (
        <>
            <div className={style.contents}>
                <input id={style.search} placeholder="Search for files, folders, photos..."/>
                <DriveUploadingContainer key="uploading-container" refreshfn={refresh}/>
                <div className={style.filesSectionContainer}>

                    <div className={style.filesSection}>
                        <div className={style.pathActionsContainer}>
                            <div className={style.path}>
                                <button>Root</button>
                            </div>
                            <div className={style.actions}>

                                {selected && <div className={style.btnGroup}>
                                    <button key="download" onClick={evt => {
                                        evt.stopPropagation();
                                        download(selected, getFile(selected).extension);
                                    }}>Download
                                    </button>
                                    <button key="delete" className={style.btnDelete}/>
                                </div>
                                }

                                <div className={style.btnGroup}>
                                    {!selected && <button key="upload" className={style.btnUpload} onClick={upload}/>}
                                    {!selected && <button key="create-file" className={style.btnCreateFile}/>}
                                    {!selected && <button key="create-directory" onClick={createDirectory}
                                                          className={style.btnCreateFolder}/>}
                                </div>

                                <div className={style.btnGroup}>
                                    <button
                                        key="details"
                                        className={style.btnDetails + (detailsVisible ? (' ' + style.btnDetailsActive) : '')}
                                        onClick={evt => {
                                            evt.stopPropagation();
                                            setDetailsVisible(v => !v);
                                    }} />
                                </div>

                            </div>
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
                                        key={object.id}
                                        id={object.id}
                                        name={object.name}
                                        extension={object.extension}
                                        selected={selected}
                                        owner={object.owner}
                                        size={object.size}
                                        directory={object.directory}
                                        openDirectory={object.directory ? openDirectory : () => {
                                        }}
                                        focus={focus}
                                    />
                                })
                            }
                            </tbody>
                        </table>
                    </div>
                    {detailsVisible && <DriveContentsDetails/>}
                </div>
            </div>
        </>
    );

}