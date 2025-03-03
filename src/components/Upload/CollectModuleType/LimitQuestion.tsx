import clsx from 'clsx'
import React, { FC } from 'react'
import { AiOutlineCheck } from 'react-icons/ai'
import { CollectModuleType, UploadedVideo } from 'src/types/local'

type Props = {
  uploadedVideo: UploadedVideo
  // eslint-disable-next-line no-unused-vars
  setCollectType: (data: CollectModuleType) => void
}

const LimitQuestion: FC<Props> = ({ uploadedVideo, setCollectType }) => {
  return (
    <div className="space-y-2">
      <h6>Would you like to limit the mints?</h6>
      <div className="flex flex-wrap gap-1.5 md:flex-nowrap">
        <button
          type="button"
          onClick={() =>
            setCollectType({
              isLimitedFeeCollect: false,
              isLimitedTimeFeeCollect: false,
              isFeeCollect: false,
              isFreeCollect: uploadedVideo.collectModule.isTimedFeeCollect
                ? false
                : true
            })
          }
          className={clsx(
            'flex items-center justify-between w-full px-4 py-2 text-sm border border-gray-200 hover:!border-indigo-500 focus:outline-none dark:border-gray-800 rounded-xl',
            {
              '!border-indigo-500':
                !uploadedVideo.collectModule.isLimitedFeeCollect
            }
          )}
        >
          <span>Unlimited mints</span>
          {!uploadedVideo.collectModule.isLimitedFeeCollect && (
            <AiOutlineCheck />
          )}
        </button>
        <button
          type="button"
          onClick={() =>
            setCollectType({
              isFeeCollect: true,
              isFreeCollect: false,
              isLimitedFeeCollect: true,
              isLimitedTimeFeeCollect: uploadedVideo.collectModule
                .isTimedFeeCollect
                ? true
                : false
            })
          }
          className={clsx(
            'flex items-center justify-between w-full px-4 py-2 text-sm border border-gray-200 hover:!border-indigo-500 focus:outline-none dark:border-gray-800 rounded-xl',
            {
              '!border-indigo-500':
                uploadedVideo.collectModule.isLimitedFeeCollect
            }
          )}
        >
          <span>Limited mint</span>
          {uploadedVideo.collectModule.isLimitedFeeCollect && (
            <AiOutlineCheck />
          )}
        </button>
      </div>
    </div>
  )
}

export default LimitQuestion
