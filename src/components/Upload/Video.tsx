import VideoPlayer from '@components/Common/Players/VideoPlayer'
import Tooltip from '@components/UIElements/Tooltip'
import useAppStore from '@lib/store'
import { getSizeFromBytes } from '@utils/functions/getSizeFromBytes'
import useCopyToClipboard from '@utils/hooks/useCopyToClipboard'
import clsx from 'clsx'
import React from 'react'
import toast from 'react-hot-toast'
import { IoCopyOutline } from 'react-icons/io5'

import BundlrInfo from './BundlrInfo'
import ChooseThumbnail from './ChooseThumbnail'

type PlayerProps = {
  source: string
  poster: string
}

const MemoizedVideoPlayer = React.memo(({ source, poster }: PlayerProps) => (
  <VideoPlayer
    source={source}
    poster={poster}
    wrapperClassName="!rounded-b-none"
    autoPlay={false}
    controls={['play', 'progress', 'mute', 'volume', 'fullscreen']}
  />
))

MemoizedVideoPlayer.displayName = 'MemoizedVideoPlayer'

const Video = () => {
  const uploadedVideo = useAppStore((state) => state.uploadedVideo)
  const setUploadedVideo = useAppStore((state) => state.setUploadedVideo)

  const [, copy] = useCopyToClipboard()

  const onCopyKey = async (value: string) => {
    await copy(value)
    toast.success('Video link copied')
  }

  const onThumbnailUpload = (ipfsUrl: string, thumbnailType: string) => {
    setUploadedVideo({ thumbnail: ipfsUrl, thumbnailType })
  }

  return (
    <div className="flex flex-col w-full">
      <div
        className={clsx('overflow-hidden w-full', {
          'rounded-t-xl': uploadedVideo.loading,
          'rounded-xl': !uploadedVideo.loading && uploadedVideo.percent === 0
        })}
      >
        <MemoizedVideoPlayer
          source={uploadedVideo.preview}
          poster={uploadedVideo.thumbnail}
        />
      </div>
      <Tooltip content={`Uploaded (${uploadedVideo.percent}%)`}>
        <div
          className={clsx('w-full overflow-hidden bg-gray-200 rounded-b-full', {
            invisible: uploadedVideo.percent === 0
          })}
        >
          <div
            className={clsx('h-[6px]', {
              'bg-indigo-500': uploadedVideo.percent !== 0
            })}
            style={{
              width: `${uploadedVideo.percent}%`
            }}
          />
        </div>
      </Tooltip>
      <div className="mt-2">
        <ChooseThumbnail
          label="Thumbnail"
          file={uploadedVideo.file}
          afterUpload={(ipfsUrl: string, thumbnailType: string) => {
            if (ipfsUrl) {
              onThumbnailUpload(ipfsUrl, thumbnailType)
            }
          }}
        />
        {!uploadedVideo.thumbnail.length && uploadedVideo.videoSource && (
          <p className="mt-2 text-xs font-medium text-red-500">
            Please choose a thumbnail
          </p>
        )}
      </div>
      <div className="p-1 mt-3 rounded-lg">
        <div className="truncate">
          <div className="text-xs font-semibold opacity-70">Title</div>
          <span title={uploadedVideo.file?.name}>
            {uploadedVideo.file?.name}
          </span>
        </div>
        {uploadedVideo.file?.size && (
          <div className="mt-4">
            <div className="text-xs font-semibold opacity-70">Size</div>
            <span>{getSizeFromBytes(uploadedVideo.file?.size)}</span>
          </div>
        )}
        <div className="mt-4">
          <div className="text-xs font-semibold opacity-70">Arweave Link</div>
          <div className="flex items-center">
            {uploadedVideo.videoSource ? (
              <>
                <span className="truncate">{uploadedVideo.videoSource}</span>
                <button
                  className="pl-2 hover:opacity-60 focus:outline-none"
                  onClick={() => onCopyKey(uploadedVideo.videoSource)}
                  type="button"
                >
                  <IoCopyOutline />
                </button>
              </>
            ) : (
              '-'
            )}
          </div>
        </div>
        {!uploadedVideo.isUploadToIpfs && (
          <div className="mt-4">
            <BundlrInfo />
          </div>
        )}
      </div>
    </div>
  )
}

export default Video
