export default function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer hexagon */}
      <path
        d="M24 3L43.05 13.5V34.5L24 45L4.95 34.5V13.5L24 3Z"
        fill="none"
        stroke="#3D7A72"
        strokeWidth="2"
      />
      {/* Inner hex glow */}
      <path
        d="M24 8L39.5 16.75V34.25L24 43L8.5 34.25V16.75L24 8Z"
        fill="#0D2535"
        stroke="#568F7C"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      {/* Trend line */}
      <polyline
        points="13,30 19,23 25,27 35,14"
        stroke="#6ABFA0"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Arrow head */}
      <polyline
        points="30,13 35,14 34,19"
        stroke="#6ABFA0"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Center dot */}
      <circle cx="25" cy="27" r="2" fill="#BDD1BD" />
    </svg>
  )
}
