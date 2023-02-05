import type { NextPage } from 'next'
import Head from 'next/head'
import Sidebar from '../components/Sidebar'
import Center from '../components/Center'
import Player from '../components/Player'
import { getSession, GetSessionParams } from 'next-auth/react'

const Home: NextPage = () => {
  return (
    <div className="h-screen overflow-hidden bg-black">
      <Head>
        <title>Spotify Client</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>Spotify Client!!</h1>

      <main className="flex">
        {/* Sidebar */}
        <Sidebar />
        {/* Center */}
        <Center />
      </main>

      <div className="sticky bottom-0">
        {/* Player */}
        <Player />
      </div>
    </div>
  )
}

export default Home

export async function getServerSideProps(sessionParams: GetSessionParams) {
  const session = await getSession(sessionParams)

  return {
    props: {
      session,
    },
  }
}
