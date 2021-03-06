import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import styleTest from './login/login.module.css'
import Link from 'next/link'
import Date from '../components/date'

export default function Home() {
    return (
        <Layout home>
            <Head>
                <title>{siteTitle}</title>
            </Head>
        </Layout>
    )
};