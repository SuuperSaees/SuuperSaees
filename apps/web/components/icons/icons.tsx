interface IconProps {
  className?: string;
}

export function CheckboxRoundedFilled({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" fill="#155EEF" />
      <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" stroke="#155EEF" />
      <rect x="6" y="6" width="8" height="8" rx="4" fill="white" />
    </svg>
  );
}

export function CheckboxRounded({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" fill="#F9FAFB" />
      <rect x="0.5" y="0.5" width="19" height="19" rx="9.5" stroke="#E4E7EC" />
      <rect x="6" y="6" width="8" height="8" rx="4" fill="#E4E7EC" />
    </svg>
  );
}

export function ChartPositive({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 221 62"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask
        id="mask0_317_4176"
        style={{ maskType: "alpha" }} // Correct usage
        maskUnits="userSpaceOnUse"
        x="0"
        y="1"
        width="221"
        height="60"
      >
        <rect
          width="219.178"
          height="59.7552"
          transform="translate(0.918457 1.15649)"
          fill="url(#paint0_linear_317_4176)"
        />
      </mask>
      <g mask="url(#mask0_317_4176)">
        <path
          opacity="0.2"
          d="M220.096 1.15649C184.487 2.77455 182.281 41.5117 147.037 45.9729C117.973 49.6518 103.256 28.7688 73.9776 31.0341C42.2203 33.4912 32.0579 55.252 0.918457 60.9117H220.096V1.15649Z"
          fill="#17B26A"
        />
      </g>
      <path
        d="M0.918457 60.9117C32.0579 55.252 42.2203 33.4912 73.9776 31.0341C103.256 28.7688 117.973 49.6518 147.037 45.9729C182.281 41.5117 184.487 2.77455 220.096 1.15649"
        stroke="#17B26A"
        strokeWidth="1.65987"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g opacity="0.2">
        <rect
          x="162.652"
          y="15.0577"
          width="35.9984"
          height="18.881"
          rx="9.4405"
          stroke="#17B26A"
          strokeWidth="1.65987"
        />
      </g>
      <rect
        x="171.211"
        y="19.7262"
        width="18.881"
        height="9.54424"
        rx="4.77212"
        fill="white"
      />
      <rect
        x="171.211"
        y="19.7262"
        width="18.881"
        height="9.54424"
        rx="4.77212"
        stroke="#17B26A"
        strokeWidth="1.65987"
      />
      <defs>
        <linearGradient
          id="paint0_linear_317_4176"
          x1="109.589"
          y1="0"
          x2="109.589"
          y2="59.7552"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ChartNegative({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 222 62"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask
        id="mask0_317_1945"
        style={{ maskType: "alpha" }} // Correct usage
        maskUnits="userSpaceOnUse"
        x="1"
        y="1"
        width="220"
        height="60"
      >
        <rect
          width="219.178"
          height="59.7552"
          transform="translate(1.35791 1.15649)"
          fill="url(#paint0_linear_317_1945)"
        />
      </mask>
      <g mask="url(#mask0_317_1945)">
        <path
          opacity="0.2"
          d="M1.35785 1.15649C36.9672 2.77455 39.1724 41.5117 74.417 45.9729C103.481 49.6518 118.197 28.7688 147.476 31.0341C179.234 33.4912 189.396 55.252 220.535 60.9117H1.35785V1.15649Z"
          fill="#F04438"
        />
      </g>
      <path
        d="M220.535 60.9117C189.396 55.252 179.234 33.4912 147.476 31.0341C118.197 28.7688 103.481 49.6518 74.417 45.9729C39.1724 41.5117 36.9672 2.77455 1.35786 1.15649"
        stroke="#F04438"
        strokeWidth="1.65987"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g opacity="0.2">
        <rect
          x="163.091"
          y="33.7313"
          width="35.9984"
          height="18.881"
          rx="9.4405"
          stroke="#F04438"
          strokeWidth="1.65987"
        />
      </g>
      <rect
        x="171.65"
        y="38.3998"
        width="18.881"
        height="9.54424"
        rx="4.77212"
        fill="white"
      />
      <rect
        x="171.65"
        y="38.3998"
        width="18.881"
        height="9.54424"
        rx="4.77212"
        stroke="#F04438"
        strokeWidth="1.65987"
      />
      <defs>
        <linearGradient
          id="paint0_linear_317_1945"
          x1="109.589"
          y1="0"
          x2="109.589"
          y2="59.7552"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
