type Props = {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
        onChange={onChange}
        value={value}
      />
    </div>
  );
}