import React from "react";
import style from "./styles/DriveContents.module.css";
import Swal from 'sweetalert2'

export default class DriveFileContextMenu extends React.Component<{
    selected: string;
    quickAccess;
    folders;
    isDirectory: boolean;
    download(id: string, extension: string): void;
    setRenamed(id: string): void;
    addToQuickAccess(id: string): void;
    removeFromQuickAccess(id: string): void;
    deleteFile(id: string, isDirectory: boolean): void;
    closeContextMenu(): void;
    x: number;
    y: number;
}> {

    constructor(props) {
        super(props);
        this.promptDelete = this.promptDelete.bind(this);
    }

    promptDelete() {

        Swal.mixin({reverseButtons: true}).fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                this.props.deleteFile(this.props.selected, this.props.isDirectory);
            }
        })

    }

    render() {
        return (
            <div className={style.fileContext} onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}
                 onContextMenu={e => e.preventDefault()}
                 style={{
                     left: `${this.props.x}px`,
                     top: `${this.props.y}px`
                 }}>
                <div className={style.fileContextItem + ' ' + style.contextDownload}
                     onClick={() => this.props.download(this.props.selected, 'png')}>
                    Download
                </div>
                <div className={style.fileContextItem + ' ' + style.contextShare}>
                    Share
                </div>
                <div className={style.fileContextItem + ' ' + style.contextRename} onClick={e => {
                    this.props.setRenamed(this.props.selected);
                    this.props.closeContextMenu();
                }}>
                    Rename
                </div>
                {this.props.isDirectory && <>
                    <hr color='#C4C4C4' style={{margin: '4px auto', border: 0, borderTop: '1px solid #c4c4c4'}}/>
                    {this.props.quickAccess.find(item => item.id === this.props.selected)
                        ?
                        <div className={style.fileContextItem + ' ' + style.contextQuickAccessRemove}
                             onClick={async () => this.props.removeFromQuickAccess(this.props.selected)}>
                            Remove from Quick Access
                        </div>
                        :
                        <div className={style.fileContextItem + ' ' + style.contextQuickAccessAdd}
                             onClick={async () => this.props.addToQuickAccess(this.props.selected)}>
                            Add to Quick Access
                        </div>
                    }
                </>}
                {/* @ts-ignore*/}
                <hr color='#C4C4C4' style={{margin: '4px auto', border: 0, borderTop: '1px solid #c4c4c4'}}/>
                <div className={style.fileContextItem + ' ' + style.contextDelete} onClick={this.promptDelete}>
                    Delete
                </div>
            </div>
        );
    }

}