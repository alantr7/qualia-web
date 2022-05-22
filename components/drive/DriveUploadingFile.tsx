import React from "react";
import style from "./styles/DriveUploadingContainer.module.css";

type Props = {
    path: string,
    file: File;
    onFileUploaded(): void;
    onFileProgress(loaded: number, total: number): void;
}

export default class DriveUploadingFile extends React.Component<Props, {progress: number}> {

    private _isUploaded: boolean = false;

    constructor(props) {
        super(props);
        this.state = {
            progress: 0
        };
        (this.upload = this.upload.bind(this))();
    }

    private upload() {
        const xhr = new XMLHttpRequest();
        xhr.open('post', this.props.path);

        const fd = new FormData();
        fd.append('file', this.props.file);
        fd.append('overwrite', 'true');

        xhr.onprogress = ({loaded, total}) => {
            this.props.onFileProgress(loaded, total);
            this.setState({
                progress: loaded / total * 100
            })
        };

        xhr.onloadend = () => {
            this.props.onFileUploaded();
            this._isUploaded = true;
        };

        xhr.send(fd);
    }

    isUploaded = () => {
        return this.isUploaded;
    };

    render() {
        return (
            <div className={style.file}>
                <div className={style.fileIcon}/>
                <p className={style.title}>{this.props.file.name}</p>
                <p className={style.uploadProgress}>13kB / 64kB | Remaining Time: 15m</p>
                <div className={style.percentageContainer}>
                    <svg height="38" width="38" style={{strokeDashoffset: (1 - this.state.progress / 100) * 251}}>
                        <circle cx="19" cy="19" r="16" stroke="#428bca" stroke-width="3" fill="transparent" />
                    </svg>
                    <p className={style.percentage}>{this.state.progress}</p>
                </div>
            </div>
        );
    }
}