interface ProgressBarProps {
  fillPercentage: number
}

const ProgressBar = ({ fillPercentage }: ProgressBarProps) => (
  <div className="w-full bg-gray-200 rounded-full h-3">
    <div
      className={`h-3 rounded-full transition-all ${
        fillPercentage > 80
          ? 'bg-green-500'
          : fillPercentage > 50
            ? 'bg-yellow-500'
            : 'bg-red-500'
      }`}
      style={{ width: `${fillPercentage}%` }}
    />
  </div>
)

export { ProgressBar, type ProgressBarProps }
