import style from "./styles/DriveContents.module.css";
import React, {ReactElement} from "react";
import {DriveContentsItem} from "./DriveContents";
import DriveUploadingFile from "./DriveUploadingFile";
import {Router, withRouter} from "next/router";
import DriveFileContextMenu from "./DriveFileContextMenu";

type Props = {
    folders: any[],
    files: any[],
    quickAccess: { id: string, name: string, path: string }[];
    openDirectory(path: string): Promise<void>;
    addFileUpload(file: ReactElement): void;
    focus(id: string);
    refreshfn(): void;
    rename(id: string, name: string, isDirectory: boolean): void;
    download(id: string, extension: string): void;
    addToQuickAccess(id: string): void;
    removeFromQuickAccess(id: string): void;
    setRenamed(id: string): void;
    deleteFile(id: string): void;
    setUploadedFilesCount(c: (c: number) => number): void;
    renamed: string;
    selected;
    router: Router
}

type State = {
    dragAndDrop: boolean,
    context: {
        x: number,
        y: number,
        isVisible: boolean,
        fileId: string
    },
    selection: {
        active: boolean,
        originX: number,
        originY: number,
        x: number,
        y: number,
        width: number,
        height: number,
        elements: {
            from: number,
            to: number
        }
    }
}

type FileDetails = {
    name: string,
    directory: boolean
}

export default withRouter(class DriveContentsFiles extends React.Component<Props, State> {

    counter = 0;

    constructor(props) {
        super(props);
        this.render = this.render.bind(this);
        this.state = {
            dragAndDrop: false,
            context: {
                fileId: undefined,
                isVisible: false,
                x: 0,
                y: 0
            },
            selection: {
                active: false,
                originX: 0,
                originY: 0,
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                elements: { from: -1, to: 0 }
            }
        };
        this.handleFileDragEnd = this.handleFileDragEnd.bind(this);
        this.handleFileDragEnter = this.handleFileDragEnter.bind(this);
        this.handleFileDrop = this.handleFileDrop.bind(this);
        this.createContextMenu = this.createContextMenu.bind(this);
        this.closeContextMenu = this.closeContextMenu.bind(this);
    }

    handleFileDragEnter(ev) {
        ev.preventDefault();
        if (this.counter++ === 0)
            this.setState({
                dragAndDrop: true
            })
    }

    async handleFileDrop(ev: DragEvent | any) {
        ev.preventDefault();
        ev.stopPropagation();
        this.handleFileDragEnd();

        const uploadDirectory = async (folder: string, entry: FileSystemEntry) => {
            if (entry.isFile) {
                const fileEntry = entry as FileSystemFileEntry;
                fileEntry.file(async (file: File) => {
                    this.props.addFileUpload(<DriveUploadingFile
                        key={Date.now()}
                        path={`/api/v1/drive/files/${folder}`}
                        file={file}
                        onFileUploaded={() => {
                            this.props.refreshfn();
                            this.props.setUploadedFilesCount(c => c + 1);
                        }}
                        onFileProgress={() => {
                        }}/>);
                });
            } else {
                const directory = entry as FileSystemDirectoryEntry;
                const folderJson = await (await fetch(`/api/v1/drive/files/${folder}`, {
                    method: 'POST',
                    body: JSON.stringify({
                        name: directory.name,
                        directory: true
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })).json();
                directory.createReader().readEntries(async (entries) => {
                    for (let entry of entries) {
                        await uploadDirectory(folderJson.id, entry);
                    }
                });
            }
        };

        for (let i = 0; i < ev.dataTransfer.items.length; i++) {
            const item = ev.dataTransfer.items[i];
            if (item.kind !== 'file')
                continue;

            await uploadDirectory((this.props.router.query.folder ? this.props.router.query.folder : 'root') as string, item.webkitGetAsEntry());
        }
    }

    handleFileDragEnd() {
        if (--this.counter === 0)
            this.setState({
                dragAndDrop: false
            })
    };

    createContextMenu(evt: MouseEvent, id: string): void {
        this.setState({
            context: {
                x: evt.clientX,
                y: evt.clientY,
                fileId: id,
                isVisible: true
            }
        });
    }

    closeContextMenu(): void {
        this.setState({
            context: {
                x: 0, y: 0, fileId: null, isVisible: false
            }
        });
    }

    beginSelection = (e) => {
        this.setState({
            selection: {
                active: true,
                originX: e.clientX,
                originY: e.clientY,
                x: e.clientX,
                y: e.clientY,
                width: 0,
                height: 0,
                elements: { from: -1, to: 0 }
            }
        });
        window.addEventListener('mouseup', this.mouseReleaseListener = (e) => {
            this.stopSelection();
        });
        window.addEventListener('mousemove', this.mouseMoveListener = this.updateSelection);
    };

    private mouseReleaseListener;
    private mouseMoveListener;

    stopSelection = () => {
        this.setState({
            selection: {
                active: false,
                originX: 0, originY: 0, x: 0, y: 0, width: 0, height: 0,
                elements: this.state.selection.elements
            }
        });
        window.removeEventListener('mouseup', this.mouseReleaseListener);
        window.removeEventListener('mousemove', this.mouseMoveListener);
    };

    clearSelection = () => {
        this.setState({
            selection: {
                active: false,
                originX: 0, originY: 0, x: 0, y: 0, width: 0, height: 0,
                elements: {
                    from: -1,
                    to: 0
                }
            }
        });
    };

    updateSelection = (e) => {
        if (!this.state.selection.active)
            return;

        const xS = Math.min(e.clientX, this.state.selection.originX) - 324;
        const yS = Math.min(e.clientY, this.state.selection.originY) - 98;

        const xE = Math.max(e.clientX, this.state.selection.originX) - 324;
        const yE = Math.max(e.clientY, this.state.selection.originY) - 98;

        // Checks selected folders
        let indexFrom = -1;
        let indexTo = 0;
        document.querySelectorAll(`.${style.filesSection} div:nth-child(2) table tbody tr`).forEach((it: Element & {offsetTop: number}, index) => {

            if (yS <= it.offsetTop + 98 && yE >= it.offsetTop + 58) {
                if (indexFrom === -1)
                    indexFrom = index;

                indexTo = index;
            }

        });

        this.setState({
            selection: {
                ...this.state.selection,
                x: xS,
                y: yS,
                width: xE - xS,
                height: yE - yS,
                elements: {
                    from: indexFrom,
                    to: indexTo
                }
            }
        });
    };

    render() {
        return (
            <div style={{height: 'calc(100% - 64px)', overflow: "auto"}} onDragEnter={this.handleFileDragEnter}
                 onMouseDown={this.beginSelection} onDragOver={e => e.preventDefault()}
                 onDrop={this.handleFileDrop} onDragLeave={this.handleFileDragEnd}>
                {this.state.dragAndDrop && <div className={style.filesDnD}>
                    <p>Drag and drop your files here.</p>
                </div>}
                {this.state.context.isVisible && this.props.selected &&
                <DriveFileContextMenu
                    selected={this.props.selected}
                    quickAccess={this.props.quickAccess}
                    folders={this.props.folders}
                    download={this.props.download}
                    deleteFile={this.props.deleteFile}
                    setRenamed={this.props.setRenamed}
                    isDirectory={this.props.folders.findIndex(i => i.id === this.props.selected) !== -1}
                    removeFromQuickAccess={this.props.removeFromQuickAccess}
                    addToQuickAccess={this.props.addToQuickAccess}
                    closeContextMenu={this.closeContextMenu}
                    x={this.state.context.x}
                    y={this.state.context.y}
                />}
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
                        [
                            ...this.props.folders.sort((a: FileDetails, b: FileDetails) => {
                                return a.name.localeCompare(b.name);
                            }),
                            ...this.props.files.sort((a: FileDetails, b: FileDetails) => {
                                return a.name.localeCompare(b.name);
                            }),
                        ].map((object, index) => {
                            const isSelected = this.state.selection.elements.from !== -1 &&
                                this.state.selection.elements.from <= index && this.state.selection.elements.to >= index;

                            console.log(this.state.selection.elements.from);

                            return <DriveContentsItem
                                key={object.id}
                                id={object.id}
                                name={object.name}
                                extension={object.extension}
                                selected={isSelected}
                                renamed={this.props.renamed}
                                setRenamed={this.props.setRenamed}
                                rename={this.props.rename}
                                owner={object.owner}
                                size={object.size}
                                directory={object.directory}
                                openDirectory={async (path: string) => {
                                    this.clearSelection();
                                    this.closeContextMenu();
                                    if (object.directory)
                                        await this.props.openDirectory(path);
                                }}
                                createContextMenu={this.createContextMenu}
                                birth_time={object.birth_time}
                                last_modified={object.last_modified}
                                focus={() => {
                                    this.setState({
                                        context: {
                                            isVisible: false, x: 0, y: 0, fileId: undefined
                                        },
                                        selection: {
                                            ...this.state.selection,
                                            elements: {
                                                from: index,
                                                to: index
                                            }
                                        }
                                    });
                                    this.props.focus(object.id);
                                }}
                            />
                        })
                    }
                    {this.state.selection.active &&
                    <div className={style.selectionRect} style={
                        {
                            left: this.state.selection.x + 'px',
                            top: this.state.selection.y + 'px',
                            width: this.state.selection.width + 'px',
                            height: this.state.selection.height + 'px'
                        }
                    }/>}
                    </tbody>
                </table>

            </div>
        );
    }
});