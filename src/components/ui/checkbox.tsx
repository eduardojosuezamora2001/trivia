type CheckboxProps = {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

export function Checkbox({ checked = false, onCheckedChange, className = "", disabled = false }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      className={[
        "h-5 w-5 rounded border-2 border-slate-500 bg-slate-900 text-violet-500",
        "focus:ring-2 focus:ring-violet-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ].join(" ")}
    />
  )
}
