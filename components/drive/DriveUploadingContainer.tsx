import React, {ReactElement, useEffect, useState} from "react";
import style from './styles/DriveUploadingContainer.module.css';
import Link from "next/link";
import {file} from "@babel/types";
import {withRouter} from "next/router";
import DriveUploadingFile from "./DriveUploadingFile";

type Props = {
    uploads: DriveUploadingFile[]
    router,
    refreshfn(): void,
    addFileUpload(file: ReactElement): void
}

type State = {
    name: string;
    progress: number;
    visible: boolean;
    time: number
}

export default withRouter(class DriveUploadingContainer extends React.Component<Props, State> {

    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
        this.upload = this.upload.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.state = {
            name: '',
            progress: 0,
            visible: true,
            time: 0
        };
    }

    uploadFile(file: File) {
        const upload = (
            <DriveUploadingFile
                key={Date.now()}
                onFileUploaded={() => {
                    this.props.refreshfn();
                }}
                onFileProgress={(loaded, total) => {
                    this.setState({
                        progress: Math.floor(loaded / total * 100)
                    });
                }}
                file={file}
                path={`/api/v1/drive/files/${this.props.router.query.folder ? this.props.router.query.folder : 'root'}`}/>);

        this.props.addFileUpload(upload);
        console.log(file);
    }

    upload() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';

        fileInput.onclick = e => e.stopPropagation();

        fileInput.onchange = (e) => {
            // @ts-ignore
            const file = e.target.files[0] as File;
            this.uploadFile(file);
        };

        document.getElementById('uploading-files').append(fileInput);
        fileInput.click();
    }

    render() {
        return (
            <>
                <div id="uploading-files" style={{display: "none"}} onClick={this.upload}/>
                <div className={style.container + ' ' + (this.state.visible ? style.visible : '')}>
                    {this.props.uploads.map(a => a)}
                </div>
            </>
        );
    }
});