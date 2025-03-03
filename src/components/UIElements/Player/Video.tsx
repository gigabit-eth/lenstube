import usePlayerStore from '@lib/store/player'
import React, { FC, RefObject } from 'react'

export type VideoRefOnly = {
  videoRef: RefObject<HTMLVideoElement>
}

const Video: FC<VideoRefOnly> = ({ videoRef }) => {
  const togglePlay = usePlayerStore((state) => state.togglePlay)

  const onClickVideo = () => {
    togglePlay({ videoRef })
  }

  return (
    <div id="lenstube-player-container">
      <video
        controlsList="nodownload"
        id="lenstube-player"
        className="w-full aspect-video rounded-xl"
        ref={videoRef}
        onClick={onClickVideo}
        onContextMenu={(event) => event.preventDefault()}
      >
        <source
          src="https://livepeercdn.com/asset/f57br80ajsnzxotu/video"
          type="video/mp4"
        />
      </video>
    </div>
  )
}

export default Video
