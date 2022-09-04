import Router, {useRouter} from "next/router";
import DriveSidebar from "../components/drive/DriveSidebar";
import React, { useEffect, useState } from "react";

import BaseApp from 'next/app'
import '../styles/global.css';
import DriveContents from "../components/drive/DriveContents";
import DriveUploadingContainer from "../components/drive/DriveUploadingContainer";
import DriveLayout from "../components/drive/DriveLayout";
import { AuthProvider } from "../context/auth";


function App({Component, ...pageProps}) {
    const router = useRouter();
    const paths = [ '/drive', '/drive/folder/[folder]', '/drive/applications', "/drive/applications/folder/[folder]" ];

    console.log(pageProps);

    if (paths.includes(router.pathname)) {
        return (
            <>
                <link rel="preconnect" href="https://fonts.googleapis.com"/>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin/>
                <link
                    href="https://fonts.googleapis.com/css2?family=Dongle:wght@300&family=Nunito+Sans&display=swap"
                    rel="stylesheet"/>

                <AuthProvider {...pageProps}>
                    <DriveLayout key="layout" {...pageProps} component={Component} />;
                </AuthProvider>
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

App.getInitialProps = async ({ ctx, res }) => {

    console.log('Getting initial props....');

    const request = ctx.req;
    if (!request) {
        console.log('Request is undefined.');
        return {};
    }

    const response = await fetch('http://194.99.22.39:9032/api/v1/user', {
    // const response = await fetch('http://localhost:9032/api/v1/user', {
    headers: {
            'Cookie': request.headers.cookie
        }
    });

    if (response.status !== 200) {
        if (ctx.res) {
            ctx.res.writeHead(302, { Location: 'https://dashboard.myqualia.net/authenticate/app?app=8eba5ad507e845a1b0a64ce9f6ce1f61' });
            ctx.res.end();
        } else {
            Router.replace('https://dashboard.myqualia.net/authenticate/app?app=8eba5ad507e845a1b0a64ce9f6ce1f61');
        }
        return {};
    }

    const user = await response.json();
    
    return {
        user
    }

};

export default App;