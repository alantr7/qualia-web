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

export default function app({ Component, pageProps }) {
  const router = useRouter();
  console.log(router);
  if (router.pathname === '/drive') {
    return (
        <>
          <DriveSidebar />
          <DriveContents />
        </>
    )
  }
  return (
      <Component {...pageProps} />
  )
}