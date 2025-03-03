import { NoDataFound } from '@components/UIElements/NoDataFound'
import usePersistStore from '@lib/store/persist'
import { RECENTS_LIBRARY } from '@utils/url-path'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { BiChevronRight } from 'react-icons/bi'
import { MdHistory } from 'react-icons/md'
import { LenstubePublication } from 'src/types/local'

const VideoCard = dynamic(() => import('../../Common/VideoCard'))

const Recents = () => {
  const [videos, setVideos] = useState<LenstubePublication[]>([])
  const recentlyWatched = usePersistStore((state) => state.recentlyWatched)

  useEffect(() => {
    setVideos(recentlyWatched)
  }, [recentlyWatched])

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="inline-flex items-center space-x-2 text-lg font-semibold">
          <MdHistory />
          <span>Recents</span>
        </h1>
        <Link href={RECENTS_LIBRARY}>
          <a className="flex items-center space-x-0.5 text-xs text-indigo-500">
            <span>See all</span> <BiChevronRight />
          </a>
        </Link>
      </div>
      {!videos.length && <NoDataFound text="No recently watched videos" />}
      <div className="grid gap-x-4 lg:grid-cols-4 gap-y-1 md:gap-y-6 2xl:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 xs:grid-col-1">
        {videos.map((video: LenstubePublication) => (
          <VideoCard key={`${video.id}_${video.createdAt}`} video={video} />
        ))}
      </div>
    </div>
  )
}

export default Recents
