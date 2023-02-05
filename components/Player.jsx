import { useSession } from 'next-auth/react'
import React, { useCallback, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { currentTrackIDState, isPlayingState } from '../atoms/songAtom'
import useSpotify from '../hooks/useSpotify'
import useSongInfo from '../hooks/useSongInfo'
import { debounce } from 'lodash'
import {
  PauseIcon,
  PlayIcon,
  RewindIcon,
  SwitchHorizontalIcon,
  VolumeUpIcon as VolumeUpSolid,
} from '@heroicons/react/solid'
import {
  FastForwardIcon,
  ReplyIcon,
  VolumeUpIcon as VolumeUpOutline,
} from '@heroicons/react/outline'

function Player() {
  const spotifyAPI = useSpotify()
  const { data: session, status } = useSession()
  const [currentTrackID, setCurrentTrackID] =
    useRecoilState(currentTrackIDState)
  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState)
  const [volume, setVolume] = useState(50)
  const songInfo = useSongInfo()

  const fetchCurrentSong = () => {
    if (!songInfo) {
      spotifyAPI.getMyCurrentPlayingTrack().then((data) => {
        setCurrentTrackID(data.body?.item?.id)
        spotifyAPI.getMyCurrentPlaybackState().then((data) => {
          setIsPlaying(data.body?.is_playing)
        })
      })
    }
  }

  const handlePlayPause = () => {
    spotifyAPI.getMyCurrentPlaybackState().then((data) => {
      if (data.body.is_playing) {
        spotifyAPI.pause()
        setIsPlaying(false)
      } else {
        spotifyAPI.play()
        setIsPlaying(true)
      }
    })
  }

  useEffect(() => {
    if (spotifyAPI.getAccessToken() && !currentTrackID) {
      fetchCurrentSong()
      setVolume(50)
    }
  }, [currentTrackID, spotifyAPI, session])

  useEffect(() => {
    if (volume > 0 && volume < 100) {
      debouncedAdjustVolume(volume)
    }
  }, [volume])

  const debouncedAdjustVolume = useCallback(
    debounce((volume) => {
      spotifyAPI.setVolume(volume).catch((err) => {})
    }, 250),
    []
  )

  return (
    <div className="grid h-24 grid-cols-3 bg-gradient-to-b from-black to-gray-900 px-2 text-xs text-white md:px-8 md:text-base">
      {/* Left Side */}
      <div className=" flex items-center space-x-4 ">
        <img
          className="hidden h-10 w-10 md:inline"
          src={songInfo?.album.images?.[0]?.url}
          alt=""
        />

        <div>
          <h3>{songInfo?.name}</h3>
          <p>{songInfo?.artists?.[0]?.name}</p>
        </div>
      </div>

      {/* Center */}
      <div className="flex items-center justify-evenly">
        <SwitchHorizontalIcon className="button" />

        <RewindIcon
          onClick={() => spotifyAPI.skipToPrevious()}
          className="button"
        />

        {isPlaying ? (
          <PauseIcon onClick={handlePlayPause} className="button h-10 w-10" />
        ) : (
          <PlayIcon onClick={handlePlayPause} className="button h-10 w-10" />
        )}

        <FastForwardIcon
          onClick={() => spotifyAPI.skipToNext()}
          className="button"
        />

        <ReplyIcon className="button" />
      </div>

      {/* Right */}
      <div className="flex items-center justify-end space-x-3 md:space-x-4">
        <VolumeUpOutline
          onClick={() => volume > 0 && setVolume(volume - 10)}
          className="button"
        />
        <input
          className="w-14 md:w-28"
          type="range"
          onChange={(e) => setVolume(Number(e.target.value))}
          value={volume}
          min={0}
          max={100}
        />
        <VolumeUpSolid
          onClick={() => volume < 100 && setVolume(volume + 10)}
          className="button"
        />
      </div>
    </div>
  )
}

export default Player
