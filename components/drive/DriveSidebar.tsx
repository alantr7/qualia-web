import React, { useEffect, useState } from "react";
import style from './styles/DriveSidebar.module.css';
import Link from "next/link";
import { Router, useRouter, withRouter } from "next/router";
import { fetchUser, useAuth, useAuthDispatch } from "../../context/auth";

type Props = {
    quickAccess: {
        id: string,
        name: string,
        path: string
    }[],
    addToQuickAccess(string): Promise<void>,
    removeFromQuickAccess(string): Promise<void>
}
/*
export default withRouter(class DriveSidebar extends React.Component<Props, any> {

    constructor(props) {
        super(props);
        this.render.bind(this);
    }

    render() {
        let isDrivePage = !this.props.router.pathname.startsWith('/drive/applications');
        const auth = useAuthState();

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
            <div className={style.sidebar}>
                <p className={style.logo}>Drive</p>
                <div className={style.quickAccess}>
                    <p className={style.title}>Quick Access</p>
                    {this.props.quickAccess.map(item => {
                        return (
                            <div className={style.quickAccessItem} onClick={e => this.props.router.push(item.path)}>
                                <a className={style.iconFolder}/>
                                <p>{item.name}</p>
                            </div>
                        );
                    })}
                </div>
                <div className={style.separator}/>
                <div className={style.navigation}>
                    <div key="nav-drive-link" className={isDrivePage ? style.selected : ''}
                         onClick={() => this.props.router.push('/drive')}>
                        <a/>
                        <p>My Drive</p>
                    </div>
                    <div key="nav-apps-link" className={!isDrivePage ? style.selected : ''}
                         onClick={() => this.props.router.push('/drive/applications')}>
                        <a/>
                        <p>Applications</p>
                    </div>
                </div>
                <div className={style.storageUsed}>
                    <p>Using {formatMemory(this.props.user?.drive.used)} of {formatMemory(this.props.user?.drive.capacity)}</p>
                    <div>
                        <a style={{width: (parseInt(this.props.user?.drive.used) / parseInt(this.props.user?.drive.capacity)) * 100 + '%'}}/>
                    </div>
                </div>
            </div>
        );
    }

});*/

function DriveSidebar(props: Props) {

    const router = useRouter();

    let isDrivePage = !router.pathname.startsWith('/drive/applications');
    const { user } = useAuth();

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
        <div className={style.sidebar}>
            <p className={style.logo}>Drive</p>
            <div className={style.quickAccess}>
                <p className={style.title}>Quick Access</p>
                {props.quickAccess.map(item => {
                    return (
                        <div className={style.quickAccessItem} onClick={e => router.push(item.path)}>
                            <a className={style.iconFolder} />
                            <p>{item.name}</p>
                        </div>
                    );
                })}
            </div>
            <div className={style.separator} />
            <div className={style.navigation}>
                <div key="nav-drive-link" className={isDrivePage ? style.selected : ''}
                    onClick={() => router.push('/drive')}>
                    <a />
                    <p>My Drive</p>
                </div>
                <div key="nav-apps-link" className={!isDrivePage ? style.selected : ''}
                    onClick={() => router.push('/drive/applications')}>
                    <a />
                    <p>Applications</p>
                </div>
            </div>
            <div className={style.storageUsed}>
                <p>Using {formatMemory(user.drive.used)} of {formatMemory(user.drive.capacity)}</p>
                <div>
                    <a style={{ width: (parseInt(user.drive.used) / parseInt(user.drive.capacity)) * 100 + '%' }} />
                </div>
            </div>
        </div>
    );

}

export default DriveSidebar;