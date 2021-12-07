import React from "react";
import DriveSidebar from "./DriveSidebar";
import {useRouter, withRouter} from "next/router";
import DriveContents from "./DriveContents";
import DriveContentsFiles from "./DriveContentsFiles";

type State = {
    quickAccess: {
        id: string,
        name: string,
        path: string
    }[]
}

export default withRouter(class DriveLayout extends React.Component<any, State> {

    constructor(props) {
        super(props);
        this.state = {
            quickAccess: []
        };
        this.addToQuickAccess = this.addToQuickAccess.bind(this);
        this.removeFromQuickAccess = this.removeFromQuickAccess.bind(this);

        (this.fetchQuickAccess = this.fetchQuickAccess.bind(this))();
        this.render = this.render.bind(this);
    }

    fetchQuickAccess() {
        fetch('/api/v1/user/drive/quickaccess').then(r => {
            r.json().then(json => {
                this.setState({
                    quickAccess: json.map(item => {
                        return {
                            ...item,
                            path: `/drive/folder/${item.id}`
                        }
                    })
                })
            })
        })
    }

    async addToQuickAccess(id: string) {
        await fetch('/api/v1/user/drive/quickaccess', {
            method: 'POST',
            body: JSON.stringify({
                folder: id
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        this.fetchQuickAccess();
    };

    async removeFromQuickAccess(id: string) {
        await fetch('/api/v1/user/drive/quickaccess', {
            method: 'DELETE',
            body: JSON.stringify({
                folder: id
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        this.fetchQuickAccess();
    };

    render() {
        const router = this.props.router;
        if (router.pathname === '/drive/applications') {
            return (
                <>
                    <DriveSidebar
                        quickAccess={this.state.quickAccess}
                        addToQuickAccess={this.addToQuickAccess}
                        removeFromQuickAccess={this.removeFromQuickAccess}
                    />
                    {this.props.Component}
                </>
            )
        }
        return (
            <>
                <DriveSidebar
                    quickAccess={this.state.quickAccess}
                    addToQuickAccess={this.addToQuickAccess}
                    removeFromQuickAccess={this.removeFromQuickAccess}
                />
                <DriveContents
                    quickAccess={this.state.quickAccess}
                    addToQuickAccess={this.addToQuickAccess}
                    removeFromQuickAccess={this.removeFromQuickAccess} />
            </>
        );
    }

});