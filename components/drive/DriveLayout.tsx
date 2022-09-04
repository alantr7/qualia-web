import React from "react";
import DriveSidebar from "./DriveSidebar";
import {withRouter} from "next/router";
import DriveContents from "./DriveContents";
import useSWR from "swr";

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
        console.log(props.user);
        this.addToQuickAccess = this.addToQuickAccess.bind(this);
        this.removeFromQuickAccess = this.removeFromQuickAccess.bind(this);

        this.fetchQuickAccess = this.fetchQuickAccess.bind(this);
        this.render = this.render.bind(this);
    }

    fetchQuickAccess() {
        fetch('/api/v1/quickaccess').then(r => {
            r.json().then(json => {
                console.log(json);
                this.setState({
                    quickAccess: json.folders.map(item => {
                        return {
                            ...item,
                            path: `/drive/folder/${item.id}`
                        }
                    })
                });
            });
            console.log('Loaded quick access.');
        });
    }

    async addToQuickAccess(id: string) {
        const fd = new FormData();
        fd.append('id', id);

        await fetch('/api/v1/quickaccess', {
            method: 'POST',
            body: fd
        });
        this.fetchQuickAccess();
    };

    async removeFromQuickAccess(id: string) {
        const fd = new FormData();
        fd.append('id', id);

        await fetch('/api/v1/quickaccess', {
            method: 'DELETE',
            body: fd
        });
        this.fetchQuickAccess();
    };

    componentDidMount(): void {
        this.fetchQuickAccess();
    }

    render() {
        return (
            <>
                <DriveSidebar
                    key="sidebar"
                    {...this.props}
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