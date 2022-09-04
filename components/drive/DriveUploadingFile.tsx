import React from "react";
import style from "./styles/DriveUploadingContainer.module.css";

type Props = {
    path: string,
    parent: string,
    file: File;
    onFileUploaded(): void;
    onFileProgress(loaded: number, total: number): void;
}

export default class DriveUploadingFile extends React.Component<Props, {progress: number, loaded: number, total: number}> {

    private _isUploaded: boolean = false;

    constructor(props) {
        super(props);
        this.state = {
            progress: 0,
            loaded: 0,
            total: 0
        };
        (this.upload = this.upload.bind(this))();
    }

    private upload() {
        const fd = new FormData();
        fd.append('name', this.props.file.name);
        fd.append('type', 'file');
        fd.append('parent', this.props.parent);
        fd.append('file', this.props.file);
        fd.append('overwrite', 'true');

        const xhr = new XMLHttpRequest();
       
        xhr.upload.addEventListener('progress', ({loaded, total}) => {
            this.props.onFileProgress(loaded, total);
            this.setState({
                progress: Math.round(loaded / total * 100),
                loaded,
                total
            })
        });

        xhr.addEventListener('load', () => {
            this.props.onFileUploaded();
            this.setState({
                ...this.state,
                progress: 100
            });
            this._isUploaded = true;
        });

        xhr.addEventListener('error', () => {
            this.setState({
                ...this.state,
                progress: 100,
            });

            alert('Could not upload your file due to an error.');
        });

        xhr.open('post', this.props.path);
        xhr.send(fd);
    }

    isUploaded = () => {
        return this.isUploaded;
    };

    render() {
        function formatMemory(input) {
            if (input !== undefined) {
                let size = parseInt(input);
                let timesDivided = 0;
                while (size > 100) {
                    size /= 1024;
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
    
                return Math.round(size * 10) / 10 + unit;
            }
            return 0;
        };

        return (
            <div className={style.file}>
                <div className={style.fileIcon}/>
                <p className={style.title}>{this.props.file.name}</p>
                <p className={style.uploadProgress}>{formatMemory(this.state.loaded)} / {formatMemory(this.state.loaded)} | Remaining Time: 15m</p>
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