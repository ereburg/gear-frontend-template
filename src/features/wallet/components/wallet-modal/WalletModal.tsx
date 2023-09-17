import { decodeAddress } from '@gear-js/api'
import { useAccount, useAlert } from '@gear-js/react-hooks'
import { Button } from '@/components/ui/button'
import { WALLETS } from '../../consts'
import { useWallet } from '../../hooks'
import { WalletItem } from '../wallet-item'
import styles from './WalletModal.module.scss'
import { copyToClipboard } from '@/app/utils'
import { ScrollArea } from '@/components/ui/scroll-area/scroll-area'
import { AccountIcon } from '@/components/ui/account-icon'
import { AnimatePresence, motion } from 'framer-motion'
import { Dialog } from '@headlessui/react'
import {
  variantsOverlay,
  variantsPanel,
} from '@/components/ui/modal/modal.variants'
import clsx from 'clsx'
import { useEffect } from 'react'
import { Sprite } from '@/components/ui/sprite'

export type WalletModalProps = {
  open: boolean
  setOpen(value: boolean): void
  onClose?(): void
}

export function WalletModal({ onClose, open, setOpen }: WalletModalProps) {
  const alert = useAlert()
  const { extensions, account, accounts, login, logout } = useAccount()

  const {
    wallet,
    walletAccounts,
    setWalletId,
    resetWalletId,
    getWalletAccounts,
  } = useWallet()

  useEffect(() => {
    // @ts-ignore
    const isNovaWallet = !!window?.walletExtension?.isNovaWallet

    if (isNovaWallet) {
      setWalletId('polkadot-js')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getWallets = () =>
    WALLETS.map(([id, { SVG, name }]) => {
      const isEnabled = extensions.some((extension) => extension.name === id)
      const status = isEnabled ? 'Enabled' : 'Disabled'

      const accountsCount = getWalletAccounts(id).length
      const accountsStatus = `${accountsCount} ${
        accountsCount === 1 ? 'account' : 'accounts'
      }`

      const onClick = () => setWalletId(id)

      return (
        <li key={id}>
          <Button
            variant="white"
            className={styles.walletButton}
            onClick={onClick}
            disabled={!isEnabled}
          >
            <WalletItem icon={SVG} name={name} />

            <span className={styles.status}>
              <span className={styles.statusText}>{status}</span>

              {isEnabled && (
                <span className={styles.statusAccounts}>{accountsStatus}</span>
              )}
            </span>
          </Button>
        </li>
      )
    })

  const getAccounts = () =>
    walletAccounts?.map((_account) => {
      const { address, meta } = _account

      const isActive = address === account?.address

      const handleClick = async () => {
        await login(_account)
        setOpen(false)
        onClose && onClose()
      }

      const handleCopyClick = async () => {
        const decodedAddress = decodeAddress(address)
        await copyToClipboard({ value: decodedAddress, alert })
        setOpen(false)
        onClose && onClose()
      }

      return (
        <li key={address}>
          <div className={styles.account}>
            <Button
              variant={isActive ? 'primary' : 'white'}
              className={styles.accountButton}
              onClick={handleClick}
              disabled={isActive}
            >
              <AccountIcon address={address} className={styles.accountIcon} />
              <span>{meta.name}</span>
            </Button>

            <Button
              variant="text"
              className={styles.textButton}
              onClick={handleCopyClick}
            >
              <Sprite name="copy" size={16} />
            </Button>
          </div>
        </li>
      )
    })

  const handleLogoutButtonClick = () => {
    logout()
    setOpen(false)
    onClose && onClose()
  }

  const isScrollable = (walletAccounts?.length || 0) > 6

  return (
    <AnimatePresence initial={false}>
      {open && (
        <Dialog
          as={motion.div}
          initial="closed"
          animate="open"
          exit="closed"
          static
          className={styles.modal}
          open={open}
          onClose={setOpen}
        >
          <motion.div
            variants={variantsOverlay}
            className={styles.modal__backdrop}
          />

          <div className={styles.modal__wrapper}>
            <div className={styles.modal__container}>
              <Dialog.Panel
                as={motion.div}
                variants={variantsPanel}
                className={styles.modal__content}
              >
                <div className={styles.modal__header}>
                  <Dialog.Title as={'h2'} className={styles.modal__title}>
                    Wallet connection
                  </Dialog.Title>
                  <Button
                    variant="text"
                    onClick={() => setOpen(false)}
                    className={styles.modal__close}
                  >
                    <Sprite name="close" width={25} height={24} />
                  </Button>
                </div>
                {accounts.length ? (
                  <ScrollArea
                    className={styles.content}
                    type={isScrollable ? 'always' : undefined}
                  >
                    <ul
                      className={clsx(
                        styles.list,
                        isScrollable && styles['list--scroll']
                      )}
                    >
                      {getAccounts() || getWallets()}
                    </ul>
                  </ScrollArea>
                ) : (
                  <p>
                    A compatible wallet was not found or is disabled. Install it
                    following the{' '}
                    <a
                      href="https://wiki.vara-network.io/docs/account/create-account/"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.external}
                    >
                      instructions
                    </a>
                    .
                  </p>
                )}

                {wallet && (
                  <div className={styles.footer}>
                    <button
                      type="button"
                      className={styles.walletButton}
                      onClick={resetWalletId}
                    >
                      <WalletItem icon={wallet.SVG} name={wallet.name} />

                      <Sprite name="edit" width="12" height="13" />
                    </button>

                    {account && (
                      <Button
                        variant="text"
                        className={styles.textButton}
                        onClick={handleLogoutButtonClick}
                      >
                        <Sprite name="exit" size={14} />
                        <span>Exit</span>
                      </Button>
                    )}
                  </div>
                )}
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
