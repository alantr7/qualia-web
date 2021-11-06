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

                <button className={style.createNew}>Create New</button>

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