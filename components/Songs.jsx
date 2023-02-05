import React from 'react'
import { useRecoilValue } from 'recoil'
import { playlistState } from '../atoms/playlistAtom'
import Song from './Song'

function Songs() {
  const playlist = useRecoilValue(playlistState)

  //   console.log('Playlist: ', playlist)

  return (
    <div className="flex-col space-y-1 px-8 pb-28 text-white">
      {playlist?.tracks.items.map((el, index) => (
        <Song key={el.track.id} track={el.track} order={index} />
      ))}
    </div>
  )
}

export default Songs
