function ArrowNorthEast({ fill = '#000', size = "50" }: { fill?: string; size?: string }) {
  return (
    <svg
      fill="none"
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      width={size}
      height={size}
    >
      <path
        fill={fill}
        fillRule="evenodd"
        d="M6.879 6.464a1 1 0 0 1 1-1h5.657a1 1 0 0 1 1 1v5.657a1 1 0 1 1-2 0V8.88l-5.364 5.364a1 1 0 1 1-1.415-1.415l5.364-5.364H7.88a1 1 0 0 1-1-1Z"
        clipRule="evenodd"
      />
    </svg>

  );
}

export default ArrowNorthEast;
