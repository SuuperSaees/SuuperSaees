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
      viewBox="0 0 95 49"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask
        id="mask0_235_4148"
        // style="mask-type:alpha"
        maskUnits="userSpaceOnUse"
        x="1"
        y="1"
        width="94"
        height="48"
      >
        <rect
          width="92.9526"
          height="46.4763"
          transform="translate(1.06848 1.63965)"
          fill="url(#paint0_linear_235_4148)"
        />
      </mask>
      <g mask="url(#mask0_235_4148)">
        <path
          opacity="0.2"
          d="M4.41337 42.5067L1.06848 48.116H94.0211V1.63965L92.7007 9.65281H90.9403C90.4708 10.9883 89.4967 13.6594 89.3559 13.6594C89.215 13.6594 88.2996 15.262 87.8595 16.0633L84.0745 18.4673L81.8739 21.6725L78.3529 18.4673L76.5045 16.0633L73.8638 21.6725H71.135L68.8464 16.0633C67.9662 15.262 66.1705 13.6594 66.0297 13.6594C65.8888 13.6594 64.7387 12.0568 64.1812 11.2554H62.7728L59.4279 13.6594L56.5232 16.0633L55.2028 21.6725L51.2418 24.0765L49.2172 26.4804L46.9286 30.487L44.728 35.7456H43.7598L41.1191 36.2465L38.5664 30.487L36.3658 26.4804H35.0455L32.7569 24.0765L29.5 26.4804H26.4192L23.3384 30.487L20.2576 35.2949L17.969 40.1028L15.5043 42.5067L12.1594 40.1028L9.51872 42.5067L6.87802 44.9107L4.41337 42.5067Z"
          fill="#17B26A"
        />
      </g>
      <path
        d="M1.06848 48.116L4.41337 42.5067L6.87802 44.9107L9.51872 42.5067L12.1594 40.1028L15.5043 42.5067L17.969 40.1028L20.2576 35.2949L23.3384 30.487L26.4192 26.4804H29.5L32.7569 24.0765L35.0455 26.4804H36.3658L38.5664 30.487L41.1191 36.2465L43.7598 35.7456H44.728L46.9286 30.487L49.2172 26.4804L51.2418 24.0765L55.2028 21.6725L56.5232 16.0633L59.4279 13.6594L62.7728 11.2554H64.1812C64.7387 12.0568 65.8888 13.6594 66.0297 13.6594C66.1705 13.6594 67.9662 15.262 68.8464 16.0633L71.135 21.6725H73.8638L76.5045 16.0633L78.3529 18.4673L81.8739 21.6725L84.0745 18.4673L87.8595 16.0633C88.2996 15.262 89.215 13.6594 89.3558 13.6594C89.4967 13.6594 90.4708 10.9883 90.9403 9.6528H92.7007L94.0211 1.63965"
        stroke="#17B26A"
        strokeWidth="1.65987"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_235_4148"
          x1="46.4763"
          y1="0"
          x2="46.4763"
          y2="46.4763"
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
      viewBox="0 0 96 49"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M94.4605 48.116L91.7909 45.6209H89.283L86.6943 42.2941L84.1055 45.6209L81.0314 39.7991L78.7662 42.2941L73.9123 37.304L70.8381 39.7991L68.573 37.304L66.4696 42.4644L63.6381 27.3237L60.8067 19.1051L57.9752 23.1653L54.982 28.7906L52.8786 23.1653H51.6651L49.6427 27.3237L47.2966 28.7186L44.8696 23.0933H43.9798L41.9573 27.3237L39.8539 23.1653L37.9932 20.6702L34.3528 18.1752L33.1393 12.3534L30.4697 12.9034L27.3955 7.36322H26.1011C25.5888 8.19491 24.5317 9.85829 24.4023 9.85829C24.2728 9.85829 22.6225 11.5217 21.8135 12.3534L19.7101 18.1752H17.2023L14.7753 7.2781L13.0765 9.77317L9.84051 18.1752L7.81804 7.74307L4.3394 5.24801C3.93491 4.41632 3.09356 9.85829 2.96412 9.85829C2.83468 9.85829 1.93939 3.0258 1.50793 1.63965"
        stroke="#F04438"
        strokeWidth="1.65987"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
