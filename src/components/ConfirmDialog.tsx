import { useEffect, useRef } from 'react'

interface Props {
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ title, message, confirmLabel, cancelLabel = 'Cancelar', onConfirm, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => dialog.current?.showModal(), [])

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      className="m-auto w-[min(24rem,calc(100%-2rem))] rounded-2xl bg-white p-5 text-slate-900 shadow-xl backdrop:bg-black/60"
    >
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className="cursor-pointer rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm()
            dialog.current?.close()
          }}
          className="cursor-pointer rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
