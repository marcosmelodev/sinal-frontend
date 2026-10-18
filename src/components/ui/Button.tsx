import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

function Button({ type = 'button', className = '', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`min-h-[56px] w-full rounded-md bg-blue-700 px-6 text-lg font-bold text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-700 ${className}`}
      {...props}
    />
  )
}

export default Button
