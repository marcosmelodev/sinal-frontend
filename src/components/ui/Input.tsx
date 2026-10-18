import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-erro`

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-lg font-semibold text-gray-900">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-errormessage={error ? errorId : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`w-full rounded-md border-2 p-3 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 ${
            error ? 'border-red-700' : 'border-gray-500 focus:border-blue-600'
          } ${className}`}
          {...props}
        />
        {/* Espaço reservado para que a mensagem não desloque o layout */}
        <p id={errorId} className="min-h-6 text-base font-medium text-red-800">
          {error}
        </p>
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
