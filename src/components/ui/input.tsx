import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, LabelHTMLAttributes, forwardRef } from "react";

const baseField =
  "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-electric/30 focus:border-electric disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`${baseField} border-slate-200 ${className}`} {...props} />
  )
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", children, ...props }, ref) => (
    <select ref={ref} className={`${baseField} border-slate-200 appearance-none cursor-pointer ${className}`} {...props}>
      {children}
    </select>
  )
);
Select.displayName = "Select";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => (
    <textarea ref={ref} className={`${baseField} border-slate-200 resize-none ${className}`} {...props} />
  )
);
Textarea.displayName = "Textarea";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className = "", ...props }, ref) => (
    <label ref={ref} className={`block text-sm font-medium text-slate-700 mb-1.5 ${className}`} {...props} />
  )
);
Label.displayName = "Label";

export const Field = ({ label, error, children }: { label?: string; error?: string; children: React.ReactNode }) => (
  <div className="mb-4">
    {label && <Label>{label}</Label>}
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);
