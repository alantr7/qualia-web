import React, {ReactElement, useEffect, useState} from "react";
import style from './styles/DriveContents.module.css'

import DirectoryImage from '../../public/images/folder-7-32.png';
import DriveUploadingContainer from "./DriveUploadingContainer";
import DriveContentsDetails from "./DriveContentsDetails";
import DriveContentsFiles from "./DriveContentsFiles";
import {useRouter} from "next/router";
import DriveUploadingFile from "./DriveUploadingFile";
import dateFormat from "dateformat";
import { DriveAccount } from "./DriveAccount";

type Props = {
    createContextMenu(evt: MouseEvent | any, id: string);
    openDirectory(id: string): void;
    focus(id: string, isDirectory: boolean): void;
    setRenamed(id: string): void;
    rename(id: string, name: string, isDirectory: boolean): void;
    id: string;
    directory: boolean;
    selected: boolean;
    renamed: string;
    name: string;
    extension: string;
    owner: string;
    size: string;
    creation_time: string;
    last_modified: string;
}

export class DriveContentsItem extends React.Component<Props, {
    selected: boolean;
    name: string;
}> {

    constructor(props) {
        super(props);
        this.state = {
            selected: false,
            name: this.props.name
        };
        this.select = this.select.bind(this);
        this.render = this.render.bind(this);
        this.isRenaming = this.isRenaming.bind(this);
        this.openDirectory = this.openDirectory.bind(this);
    }

    async openDirectory() {
        this.props.openDirectory(this.props.id);
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        if (prevProps.selected && prevProps.renamed === prevProps.id && !this.isRenaming()) {
            this.props.rename(this.props.id, this.state.name, this.props.directory);
        }
    }

    select(evt) {
        evt.stopPropagation();
        this.props.focus(this.props.id, this.props.directory);
    }

    isRenaming() {
        return this.props.selected && this.props.renamed === this.props.id;
    }

    render() {
        let formattedSize = this.props.size;
        if (formattedSize !== undefined) {
            let size = parseInt(this.props.size);
            let timesDivided = 0;
            while (size > 100) {
                size /= 1000;
                timesDivided++;
            }

            const unit = timesDivided === 0
                ? 'B'
                : timesDivided === 1
                ? 'KB'
                : timesDivided === 2
                ? 'MB'
                : timesDivided === 3
                ? 'GB' : '';

            formattedSize = Math.round(size * 10) / 10 + unit;
        }
        return (
            <tr onContextMenu={(evt) => {
                this.select(evt);
                evt.preventDefault();
                this.props.createContextMenu(evt, this.props.id);
            }} onClick={this.select}
                onDoubleClick={this.openDirectory} tabIndex={0}
                className={
                    (this.props.selected ? style.selected : '') + ' ' +
                    (this.props.directory ? style.directory : '')
                }>
                <td className={this.isRenaming() && style.fileRenaming}>
                    <p>
                        <pre>{this.state.name}</pre>
                        {this.isRenaming() &&
                        <input onClick={e => e.stopPropagation()} onKeyDown={e => {
                            if (e.which === 13) {

                            }
                        }} onChange={e => {
                            e.preventDefault();
                            this.setState({
                                name: e.target.value
                            });
                        }} onContextMenu={e => e.stopPropagation()} autoFocus={true} value={this.state.name}/>}
                    </p>
                    <pre>{this.props.extension && '.' + this.props.extension}</pre>
                </td>
                { console.log('Last Modified: ' + this.props.last_modified + ' Is Directory? ' + this.props.directory) }
                <td>{!this.props.directory ? dateFormat(new Date(this.props.last_modified), 'dd mm yy | HH:MM') : ''}</td>
                <td>{!this.props.directory ? dateFormat(new Date(this.props.creation_time), 'dd mm yy | HH:MM') : ''}</td>
                <td>{this.props.owner}</td>
                <td>{formattedSize}</td>
            </tr>
        );
    }

}

type IState = {
    selected: string,
    selectTimestamp: number,
    files: { id: string, name: string }[]
}

export default function DriveContents(props) {

    const [selected, setSelected] = useState(null);
    const [renamed, setRenamed] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(0);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const router = useRouter();

    const [path, setPath] = useState([]);
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);

    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [, setLastUpload] = useState(0);

    const [uploadedFilesCount, setUploadedFilesCount] = useState(0);

    const addFileUpload = (element: ReactElement) => {
        setUploadingFiles(files => {
            files.push(element);
            return files;
        });
        setLastUpload(Date.now());
    };

    function getFile(id: string) {
        return files.find(file => file.id === id);
    }

    useEffect(() => document.onclick = () => setSelected(null), [typeof document]);

    useEffect(() => {
        if (!router.isReady) return;
        console.log(router.query);
        fetch(`/api/v1/files/${router.query.folder ? router.query.folder : ''}?path=true`).then(result => {
            result.json().then(json => {
                if (router.pathname == '/applications' || router.asPath === '/applications/folder/root') {
                    setFolders(json.applications.map(v => {
                        return {
                            ...v,
                            directory: true
                        }
                    }));
                    setPath(json.path.objects);
                    return;
                }
                setFiles(json.children.files.map(v => {
                    return {
                        ...v,
                        directory: false
                    }
                }));
                setFolders(json.children.folders.map(v => {
                    return {
                        ...v,
                        directory: true
                    }
                }));
                setPath(json.path.objects);
            })
        })
    }, [router.isReady, router.pathname, router.query.folder, lastUpdate, renamed]);

    function focus(id: string) {
        setSelected(id);
        setRenamed(null);
    }

    function rename(id: string, name: string, isDirectory: boolean) {
        const fd = new FormData();
        fd.append('name', name);
        fetch(`/api/v1/files/${id}`, {
            method: 'PUT',
            body: fd
        }).then(() => refresh());
    }

    async function openDirectory(path: string) {
        let url = (router.query.path ? router.query.path : '') as string;
        if (!url.endsWith('/')) url += '/';
        const isApplication = router.pathname.startsWith('/drive/applications');
        await router.push(isApplication ? `/drive/applications/folder/${url}${path}` : `/drive/folder/${url}${path}`);
        setSelected(null);
    }

    function refresh() {
        setLastUpdate(Date.now());
    }

    function download(id: string, extension: string) {
        const link = document.createElement('a');
        link.setAttribute('href', `/api/v1/files/${router.query.folder || 'root'}-${id}/download`);
        link.setAttribute('download', `${getFile(id).name}.${extension}`);

        link.click();
        link.remove();
    }

    function upload() {
        document.getElementById('uploading-files').click();
    }

    async function createDirectory() {
        const fd = new FormData();
        fd.append('name', 'New Folder');
        fd.append('type', 'folder');
        fd.append('parent', `${router.query.folder ? router.query.folder : 'root'}`);
        await fetch(`/api/v1/files`, {
            method: 'post',
            body: fd
        });
        refresh();
    }

    async function deleteFile(id: string, isDirectory: boolean) {
        await fetch(`/api/v1/files/${id}`, {
            method: 'DELETE'
        });
        refresh();
    }

    function clearUploads() {
        setUploadedFilesCount(0);
        setUploadingFiles([]);
    }

    return (
        <>
            <title>My Drive</title>
            <div className={style.contents}>
                <input id={style.search} placeholder="Search for files, folders, photos..."/>
                <DriveUploadingContainer key="upload-container"
                                         refreshfn={refresh}
                                         uploads={uploadingFiles}
                                         clearUploads={clearUploads}
                                         addFileUpload={addFileUpload}
                                         uploadedCount={uploadedFilesCount}
                                         setUploadedFilesCount={setUploadedFilesCount}
                />
                <DriveAccount />
                <div className={style.filesSectionContainer}>
                    <div className={style.filesSection}>
                        <div className={style.pathActionsContainer}>
                            <div className={style.path}>
                                <button onClick={_ => openDirectory('root')}>Root</button>
                                {
                                    path.map(item => {
                                        return (
                                            <>
                                                <button onClick={_ => openDirectory(item.id)}>
                                                    {item.name}
                                                </button>
                                            </>
                                        )
                                    })
                                }
                            </div>
                            <div className={style.actions}>
                                {selected && <div className={style.btnGroup}>
                                    <button key="download" className={style.btnDownload} onClick={evt => {
                                        evt.stopPropagation();
                                        download(selected, getFile(selected).extension);
                                    }}>
                                    </button>
                                    <button key="delete" className={style.btnDelete}/>
                                </div>
                                }

                                {!selected && <div className={style.btnGroup}>
                                    <button key="upload" className={style.btnUpload} onClick={upload}/>
                                    <button key="create-file" className={style.btnCreateFile}/>
                                    <button key="create-directory" onClick={createDirectory}
                                            className={style.btnCreateFolder}/>
                                </div>}

                                <div className={style.btnGroup}>
                                    <button
                                        key="details"
                                        className={style.btnDetails + (detailsVisible ? (' ' + style.btnDetailsActive) : '')}
                                        onClick={evt => {
                                            evt.stopPropagation();
                                            setDetailsVisible(v => !v);
                                        }}/>
                                </div>

                            </div>
                        </div>
                        <DriveContentsFiles refreshfn={refresh} addFileUpload={addFileUpload} files={files}
                                            download={download}
                                            folders={folders} renamed={renamed} setRenamed={setRenamed}
                                            selected={selected} openDirectory={openDirectory}
                                            deleteFile={deleteFile}
                                            focus={focus}
                                            rename={rename}
                                            quickAccess={props.quickAccess}
                                            addToQuickAccess={props.addToQuickAccess}
                                            removeFromQuickAccess={props.removeFromQuickAccess}
                                            setUploadedFilesCount={setUploadedFilesCount}
                        />
                    </div>
                    {detailsVisible && <DriveContentsDetails/>}
                </div>
            </div>
        </>
    );

=======
import React, {ReactElement, useEffect, useState} from "react";
import style from './styles/DriveContents.module.css'

import DirectoryImage from '../../public/images/folder-7-32.png';
import DriveUploadingContainer from "./DriveUploadingContainer";
import DriveContentsDetails from "./DriveContentsDetails";
import DriveContentsFiles from "./DriveContentsFiles";
import {useRouter} from "next/router";
import DriveUploadingFile from "./DriveUploadingFile";
import dateFormat from "dateformat";

type Props = {
    createContextMenu(evt: MouseEvent | any, id: string);
    openDirectory(id: string): void;
    focus(id: string, isDirectory: boolean): void;
    setRenamed(id: string): void;
    rename(id: string, name: string, isDirectory: boolean): void;
    id: string;
    directory: boolean;
    selected: boolean;
    renamed: string;
    name: string;
    extension: string;
    owner: string;
    size: string;
    birth_time: string;
    last_modified: string;
}

export class DriveContentsItem extends React.Component<Props, {
    selected: boolean;
    name: string;
}> {

    constructor(props) {
        super(props);
        this.state = {
            selected: false,
            name: this.props.name
        };
        this.select = this.select.bind(this);
        this.render = this.render.bind(this);
        this.isRenaming = this.isRenaming.bind(this);
        this.openDirectory = this.openDirectory.bind(this);
    }

    async openDirectory() {
        this.props.openDirectory(this.props.id);
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        if (prevProps.selected && prevProps.renamed === prevProps.id && !this.isRenaming()) {
            this.props.rename(this.props.id, this.state.name, this.props.directory);
        }
    }

    select(evt) {
        evt.stopPropagation();
        this.props.focus(this.props.id, this.props.directory);
    }

    isRenaming() {
        return this.props.selected && this.props.renamed === this.props.id;
    }

    render() {
        return (
            <tr onContextMenu={(evt) => {
                this.select(evt);
                evt.preventDefault();
                this.props.createContextMenu(evt, this.props.id);
            }} onClick={this.select}
                onDoubleClick={this.openDirectory} tabIndex={0}
                className={
                    (this.props.selected ? style.selected : '') + ' ' +
                    (this.props.directory ? style.directory : '')
                }>
                <td className={this.isRenaming() && style.fileRenaming}>
                    <p>
                        <pre>{this.state.name}</pre>
                        {this.isRenaming() &&
                        <input onClick={e => e.stopPropagation()} onKeyDown={e => {
                            if (e.which === 13) {

                            }
                        }} onChange={e => {
                            e.preventDefault();
                            this.setState({
                                name: e.target.value
                            });
                        }} onContextMenu={e => e.stopPropagation()} autoFocus={true} value={this.state.name}/>}
                    </p>
                    <pre>{this.props.extension && '.' + this.props.extension}</pre>
                </td>
                <td>{!this.props.directory ? dateFormat(new Date(this.props.last_modified), 'dd mm yy | HH:MM') : ''}</td>
                <td>{!this.props.directory ? dateFormat(new Date(this.props.birth_time), 'dd mm yy | HH:MM') : ''}</td>
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

export default function DriveContents(props) {

    const [selected, setSelected] = useState(null);
    const [renamed, setRenamed] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(0);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const router = useRouter();

    const [path, setPath] = useState([]);
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);

    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [, setLastUpload] = useState(0);

    const [uploadedFilesCount, setUploadedFilesCount] = useState(0);

    const addFileUpload = (element: ReactElement) => {
        setUploadingFiles(files => {
            files.push(element);
            return files;
        });
        setLastUpload(Date.now());
    };

    function getFile(id: string) {
        return files.find(file => file.id === id);
    }

    useEffect(() => document.onclick = () => setSelected(null), [typeof document]);

    useEffect(() => {
        if (!router.isReady) return;
        console.log(router.query);
        fetch(`/api/v1/drive/files/${router.query.folder ? router.query.folder : ''}?path=true`).then(result => {
            result.json().then(json => {
                if (router.pathname == '/drive/applications' || router.asPath === '/drive/applications/folder/root') {
                    setFolders(json.applications.map(v => {
                        return {
                            ...v,
                            directory: true
                        }
                    }));
                    setPath(json.path.objects);
                    return;
                }
                setFiles(json.files.map(v => {
                    return {
                        ...v,
                        directory: false
                    }
                }));
                setFolders(json.folders.map(v => {
                    return {
                        ...v,
                        directory: true
                    }
                }));
                setPath(json.path.objects);
            })
        })
    }, [router.isReady, router.pathname, router.query.folder, lastUpdate, renamed]);

    function focus(id: string) {
        setSelected(id);
        setRenamed(null);
    }

    function rename(id: string, name: string, isDirectory: boolean) {
        const fd = new FormData();
        fd.append('name', name);
        fetch(`/api/v1/drive/files/` + (isDirectory ? id : (router.query.folder + '-' + id)), {
            method: 'PUT',
            body: fd
        }).then(() => refresh());
    }

    async function openDirectory(path: string) {
        let url = (router.query.path ? router.query.path : '') as string;
        if (!url.endsWith('/')) url += '/';
        const isApplication = router.pathname.startsWith('/drive/applications');
        await router.push(isApplication ? `/drive/applications/folder/${url}${path}` : `/drive/folder/${url}${path}`);
        setSelected(null);
    }

    function refresh() {
        setLastUpdate(Date.now());
    }

    function download(id: string, extension: string) {
        const link = document.createElement('a');
        link.setAttribute('href', `/api/v1/drive/files/${router.query.folder || 'root'}-${id}/download`);
        link.setAttribute('download', `${getFile(id).name}.${extension}`);

        link.click();
        link.remove();
    }

    function upload() {
        document.getElementById('uploading-files').click();
    }

    async function createDirectory() {
        await fetch(`/api/v1/drive/files/${router.query.folder ? router.query.folder : 'root'}`, {
            method: 'post',
            body: JSON.stringify({
                name: "New Folder",
                directory: true
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        refresh();
    }

    async function deleteFile(id: string, isDirectory: boolean) {
        const path = isDirectory ?
            `/api/v1/drive/files/${id}` :
            `/api/v1/drive/files/${router.query.folder ? router.query.folder : 'root'}-${id}`;

        await fetch(path, {
            method: 'DELETE'
        });
        refresh();
    }

    function clearUploads() {
        setUploadedFilesCount(0);
        setUploadingFiles([]);
    }

    return (
        <>
            <title>My Drive</title>
            <div className={style.contents}>
                <input id={style.search} placeholder="Search for files, folders, photos..."/>
                <DriveUploadingContainer key="upload-container"
                                         refreshfn={refresh}
                                         uploads={uploadingFiles}
                                         clearUploads={clearUploads}
                                         addFileUpload={addFileUpload}
                                         uploadedCount={uploadedFilesCount}
                                         setUploadedFilesCount={setUploadedFilesCount}
                />
                <div className={style.filesSectionContainer}>
                    <div className={style.filesSection}>
                        <div className={style.pathActionsContainer}>
                            <div className={style.path}>
                                <button onClick={_ => openDirectory('root')}>Root</button>
                                {
                                    path.map(item => {
                                        return <button onClick={_ => openDirectory(item.id)}>
                                            {item.name}
                                        </button>
                                    })
                                }
                            </div>
                            <div className={style.actions}>
                                {selected && <div className={style.btnGroup}>
                                    <button key="download" className={style.btnDownload} onClick={evt => {
                                        evt.stopPropagation();
                                        download(selected, getFile(selected).extension);
                                    }}>
                                    </button>
                                    <button key="delete" className={style.btnDelete}/>
                                </div>
                                }

                                {!selected && <div className={style.btnGroup}>
                                    <button key="upload" className={style.btnUpload} onClick={upload}/>
                                    <button key="create-file" className={style.btnCreateFile}/>
                                    <button key="create-directory" onClick={createDirectory}
                                            className={style.btnCreateFolder}/>
                                </div>}

                                <div className={style.btnGroup}>
                                    <button
                                        key="details"
                                        className={style.btnDetails + (detailsVisible ? (' ' + style.btnDetailsActive) : '')}
                                        onClick={evt => {
                                            evt.stopPropagation();
                                            setDetailsVisible(v => !v);
                                        }}/>
                                </div>

                            </div>
                        </div>
                        <DriveContentsFiles refreshfn={refresh} addFileUpload={addFileUpload} files={files}
                                            download={download}
                                            folders={folders} renamed={renamed} setRenamed={setRenamed}
                                            selected={selected} openDirectory={openDirectory}
                                            deleteFile={deleteFile}
                                            focus={focus}
                                            rename={rename}
                                            quickAccess={props.quickAccess}
                                            addToQuickAccess={props.addToQuickAccess}
                                            removeFromQuickAccess={props.removeFromQuickAccess}
                                            setUploadedFilesCount={setUploadedFilesCount}
                        />
                    </div>
                    {detailsVisible && <DriveContentsDetails/>}
                </div>
            </div>
        </>
    );
}