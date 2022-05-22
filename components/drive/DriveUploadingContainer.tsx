import React, {ReactElement, useEffect, useState} from "react";
import style from './styles/DriveUploadingContainer.module.css';
import Link from "next/link";
import {file} from "@babel/types";
import {withRouter} from "next/router";
import DriveUploadingFile from "./DriveUploadingFile";

type Props = {
    uploads: DriveUploadingFile[]
    router,
    uploadedCount: number,
    clearUploads(): void,
    refreshfn(): void,
    addFileUpload(file: ReactElement): void,
    setUploadedFilesCount(c: (c: number) => number): void
}

type State = {
    name: string;
    progress: number;
    minimized: boolean;
    visible: boolean;
    closed: boolean;
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
            minimized: false,
            time: 0,
            visible: false,
            closed: false
        };
    }

    uploadFile(file: File) {
        const upload = (
            <DriveUploadingFile
                key={Date.now()}
                onFileUploaded={() => {
                    this.props.refreshfn();
                    this.props.setUploadedFilesCount(c => c + 1);
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

    closeContainer = () => {
        this.props.clearUploads();
        this.setState({
            closed: true
        });
    };

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        if (this.props.uploads.length > 0 && (!prevState.visible || prevState.closed)) {
            this.setState({
                visible: true,
                closed: false
            })
        }
    }

    render() {
        const isUploadCompleted = this.props.uploadedCount === this.props.uploads.length;
        return (
            <>
                <div id="uploading-files" style={{display: "none"}} onClick={this.upload}/>
                <div
                    className={style.container + ' ' + (this.state.visible ? style.visible : '') + ' ' + (this.state.closed ? style.closed : '') + ' ' + (this.state.minimized ? style.minimized : '')}>
                    <p className={style.containerTitle} onClick={_ => this.setState({
                        minimized: !this.state.minimized
                    })}>
                        {!isUploadCompleted && `Uploading files... (${this.props.uploadedCount} of ${this.props.uploads.length})`}
                        {isUploadCompleted && `All files are uploaded (${this.props.uploadedCount})`}

                        {isUploadCompleted && <span className={style.closeContainer} onClick={e => {
                            e.stopPropagation();
                            this.closeContainer();
                        }} />}
                    </p>
                    <div className={style.uploads}>
                        {this.props.uploads.map(a => a)}
                    </div>
                </div>
            </>
        );
    }
});