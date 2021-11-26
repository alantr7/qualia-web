/*
export default class QualiaApp extends App {

  render() {

    const { Component, pageProps, router } = this.props;

    return (
        <Component {...pageProps} />
    );

  }

}*/

import {useRouter} from "next/router";
import DriveSidebar from "../components/drive/DriveSidebar";
import React from "react";

import '../styles/global.css';
import DriveContents from "../components/drive/DriveContents";
import DriveUploadingContainer from "../components/drive/DriveUploadingContainer";

export default function app({Component, pageProps}) {
    const router = useRouter();
    console.log(router);
    if (router.pathname === '/drive') {
        return (
            <>
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin/>
                <link
                    href="https://fonts.googleapis.com/css2?family=Dongle:wght@300&family=Nunito+Sans&display=swap"
                    rel="stylesheet"/>
                <DriveSidebar />
                <DriveContents />
            </>
        )
    }
    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin/>
            <link href="https://fonts.googleapis.com/css2?family=Dongle:wght@300&display=swap" rel="stylesheet"/>
            <Component {...pageProps} />
        </>
    )
}