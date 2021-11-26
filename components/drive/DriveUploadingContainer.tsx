import React, {useEffect, useState} from "react";
import style from './DriveUploadingContainer.module.css';
import Link from "next/link";
import {useRouter, withRouter} from "next/router";
import {router} from "next/client";
import {file} from "@babel/types";

type State = {
    uploads: File[];
    name: string;
    progress: number;
    visible: boolean
}

export default withRouter(class DriveUploadingContainer extends React.Component<any, State> {

    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
        this.upload = this.upload.bind(this);
        this.state = {
            uploads: [],
            name: '',
            progress: 0,
            visible: false
        };
    }

    upload() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';

        fileInput.onclick = e => e.stopPropagation();

        fileInput.onchange = (e) => {
            // @ts-ignore
            const file = e.target.files[0] as File;

            this.setState({
                uploads: [
                    ...this.state.uploads
                ],
                name: file.name,
                visible: true
            });

            const xhr = new XMLHttpRequest();
            xhr.open('post', '/api/v1/user/drive?path=' + (this.props.router.query.path ? this.props.router.query.path : ''));

            const fd = new FormData();
            fd.append('file', file);
            fd.append('overwrite', 'true');

            xhr.onprogress = ({loaded, total}) => {
                this.setState({
                    progress: Math.floor(loaded / total * 100)
                });
            };

            xhr.onloadend = () => {
                this.props.refreshfn();
                setTimeout(() => {
                    this.setState({
                        visible: false
                    })
                }, 2000);
            };

            xhr.send(fd);
            console.log(file);
        };

        document.getElementById('uploading-files').append(fileInput);
        fileInput.click();
    }

    render() {

        return (
            <>
                <div id="uploading-files" style={{display: "none"}} onClick={this.upload} />
                <div className={style.container + ' ' + (this.state.visible ? style.visible : '')}>
                    <div className={style.fileIcon}/>
                    <p className={style.title}>Uploading file...</p>
                    <p className={style.currentFile}>{this.state.name}</p>
                    <p className={style.percentage}>{this.state.progress}%</p>
                    <div className={style.progressBarContainer}>
                        <div className={style.progressBarBackground}>
                            <a className={style.progressBar} style={{width: this.state.progress + '%'}}/>
                        </div>
                    </div>
                </div>
            </>
        );
    }
});