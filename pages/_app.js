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
import DriveLayout from "../components/drive/DriveLayout";

export default function app({Component, pageProps}) {
    const router = useRouter();
    if (router.pathname === '/drive' || router.pathname === '/drive/folder/[folder]' || router.pathname === '/drive/applications') {
        return (
            <>
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin/>
                <link
                    href="https://fonts.googleapis.com/css2?family=Dongle:wght@300&family=Nunito+Sans&display=swap"
                    rel="stylesheet"/>
                <DriveLayout {...pageProps} component={Component} />;
            </>
        );
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