import React from "react";
import style from './styles/DriveSidebar.module.css';
import Link from "next/link";
import {Router, withRouter} from "next/router";

type Props = {
    router: Router,
    quickAccess: {
        id: string,
        name: string,
        path: string
    }[]
}

export default withRouter(class DriveSidebar extends React.Component<Props, any> {

    constructor(props) {
        super(props);
        this.render.bind(this);
    }

    render() {
        let isDrivePage = !this.props.router.pathname.startsWith('/drive/applications');
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
                    <p>Using 30.6GB of 50GB</p>
                    <div>
                        <a style={{width: 60 + '%'}}/>
                    </div>
                </div>
            </div>
        );
    }

});