import { LENSHUB_PROXY_ABI } from '@abis/LensHubProxy'
import { useMutation } from '@apollo/client'
import { Loader } from '@components/UIElements/Loader'
import Tooltip from '@components/UIElements/Tooltip'
import logger from '@lib/logger'
import usePersistStore from '@lib/store/persist'
import {
  LENSHUB_PROXY_ADDRESS,
  RELAYER_ENABLED,
  SIGN_IN_REQUIRED_MESSAGE
} from '@utils/constants'
import omitKey from '@utils/functions/omitKey'
import {
  BROADCAST_MUTATION,
  CREATE_MIRROR_TYPED_DATA
} from '@utils/gql/queries'
import { utils } from 'ethers'
import React, { FC, useState } from 'react'
import toast from 'react-hot-toast'
import { AiOutlineRetweet } from 'react-icons/ai'
import { CreateMirrorBroadcastItemResult } from 'src/types'
import { LenstubePublication } from 'src/types/local'
import { useContractWrite, useSignTypedData } from 'wagmi'

type Props = {
  video: LenstubePublication
  onMirrorSuccess: () => void
}

const MirrorVideo: FC<Props> = ({ video, onMirrorSuccess }) => {
  const [loading, setLoading] = useState(false)
  const isAuthenticated = usePersistStore((state) => state.isAuthenticated)
  const selectedChannel = usePersistStore((state) => state.selectedChannel)

  const onlySubscribersCanMirror =
    video?.referenceModule?.__typename === 'FollowOnlyReferenceModuleSettings'

  const { signTypedDataAsync } = useSignTypedData({
    onError(error: any) {
      toast.error(error?.data?.message || error?.message)
      setLoading(false)
    }
  })

  // const { config: prepareMirror } = usePrepareContractWrite({
  //   addressOrName: LENSHUB_PROXY_ADDRESS,
  //   contractInterface: LENSHUB_PROXY_ABI,
  //   functionName: 'mirrorWithSig',
  //   enabled: false
  // })
  const { write: mirrorWithSig } = useContractWrite({
    addressOrName: LENSHUB_PROXY_ADDRESS,
    contractInterface: LENSHUB_PROXY_ABI,
    functionName: 'mirrorWithSig',
    mode: 'recklesslyUnprepared',
    onError(error: any) {
      toast.error(error?.data?.message || error?.message)
      setLoading(false)
    },
    onSuccess() {
      onMirrorSuccess()
      toast.success('Mirrored video across lens.')
      setLoading(false)
    }
  })

  const [broadcast] = useMutation(BROADCAST_MUTATION, {
    onError(error) {
      toast.error(error?.message)
      setLoading(false)
    },
    onCompleted() {
      onMirrorSuccess()
      toast.success('Mirrored video across lens.')
      setLoading(false)
    }
  })

  const [createMirrorTypedData] = useMutation(CREATE_MIRROR_TYPED_DATA, {
    async onCompleted(data) {
      const { id, typedData } =
        data.createMirrorTypedData as CreateMirrorBroadcastItemResult
      const {
        profileId,
        profileIdPointed,
        pubIdPointed,
        referenceModule,
        referenceModuleData,
        referenceModuleInitData
      } = typedData?.value
      try {
        const signature = await signTypedDataAsync({
          domain: omitKey(typedData?.domain, '__typename'),
          types: omitKey(typedData?.types, '__typename'),
          value: omitKey(typedData?.value, '__typename')
        })
        const { v, r, s } = utils.splitSignature(signature)
        const sig = { v, r, s, deadline: typedData.value.deadline }
        const inputStruct = {
          profileId,
          profileIdPointed,
          pubIdPointed,
          referenceModule,
          referenceModuleData,
          referenceModuleInitData,
          sig
        }
        if (RELAYER_ENABLED) {
          const { data } = await broadcast({
            variables: { request: { id, signature } }
          })
          if (data?.broadcast?.reason)
            mirrorWithSig?.({ recklesslySetUnpreparedArgs: inputStruct })
        } else {
          mirrorWithSig?.({ recklesslySetUnpreparedArgs: inputStruct })
        }
      } catch (error) {
        setLoading(false)
        logger.error('[Error Mirror]', error)
      }
    },
    onError(error) {
      toast.error(error?.message)
      setLoading(false)
    }
  })

  const mirrorVideo = () => {
    if (!isAuthenticated) return toast.error(SIGN_IN_REQUIRED_MESSAGE)
    setLoading(true)
    createMirrorTypedData({
      variables: {
        request: {
          profileId: selectedChannel?.id,
          publicationId: video?.id,
          referenceModule: {
            followerOnlyReferenceModule: false
          }
        }
      }
    })
  }

  if (onlySubscribersCanMirror && !video.profile.isFollowedByMe) return null

  return (
    <Tooltip placement="top-start" content="Mirror video across Lens">
      <button
        type="button"
        disabled={loading}
        onClick={() => mirrorVideo()}
        className="p-3.5 bg-gray-200 dark:bg-gray-800 rounded-full"
      >
        {loading ? (
          <Loader size="sm" className="m-[1px]" />
        ) : (
          <AiOutlineRetweet />
        )}
      </button>
    </Tooltip>
  )
}

export default MirrorVideo
