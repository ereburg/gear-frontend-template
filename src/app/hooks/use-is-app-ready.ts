import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useAccount, useApi } from '@gear-js/react-hooks'
import {
  useAccountAvailableBalance,
  useAccountAvailableBalanceSync,
} from '@/features/account-available-balance/hooks'
import { useEffect } from 'react'

const isAppReadyAtom = atom<boolean>(false)

export function useIsAppReady() {
  const isAppReady = useAtomValue(isAppReadyAtom)
  const setIsAppReady = useSetAtom(isAppReadyAtom)

  return { isAppReady, setIsAppReady }
}

export function useIsAppReadySync() {
  const { isApiReady } = useApi()
  const { isAccountReady } = useAccount()
  const { isAvailableBalanceReady } = useAccountAvailableBalance()

  const { setIsAppReady } = useIsAppReady()

  useAccountAvailableBalanceSync()

  useEffect(() => {
    setIsAppReady(isApiReady && isAccountReady && isAvailableBalanceReady)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAccountReady, isApiReady, isAvailableBalanceReady])
}
