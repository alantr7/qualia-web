import React from "react";
import style from './DriveSidebar.module.css';
import Link from "next/link";

export default class DriveSidebar extends React.Component<any , any> {

    constructor(props) {
        super(props);
        this.render.bind(this);
    }

    render() {
        return (
            <div className={style.sidebar}>
                <p className={style.logo}>Drive</p>

                <div className={style.quickAccess}>
                    <p className={style.title}>Quick Access</p>
                    <div>
                        <p>I</p>
                        <p>Files</p>
                    </div>
                    <div>
                        <p>I</p>
                        <p>Files</p>
                    </div>
                    <div>
                        <p>I</p>
                        <p>Files</p>
                    </div>
                </div>
                <div className={style.separator} />
                <div className={style.storageUsed}>
                    <p>Using 30.6GB of 50GB</p>
                    <div>
                        <a style = {{width: 60 + '%'}}/>
                    </div>
                </div>
            </div>
        );
    }

}