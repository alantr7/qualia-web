import React from "react";
import style from "./styles/DriveUploadingContainer.module.css";

type Props = {
    path: string,
    file: File;
    onFileUploaded(): void;
    onFileProgress(loaded: number, total: number): void;
}

export default class DriveUploadingFile extends React.Component<Props, {progress: number}> {

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
        };

        xhr.send(fd);
    }

    render() {
        return (
            <div className={style.file}>
                <div className={style.fileIcon}/>
                <p
                    className={style.title}> Uploading
                    file
                    ...</p>
                <p className={style.currentFile}>{this.props.file.name}</p>
                <p className={style.percentage}>{this.state.progress}%</p>
                <div className={style.progressBarContainer}>
                    <div className={style.progressBarBackground}>
                        <a className={style.progressBar} style={{width: this.state.progress + '%'}}/>
                    </div>
                </div>
            </div>
        );
    }
}