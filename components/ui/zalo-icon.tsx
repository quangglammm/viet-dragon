import { type ComponentProps } from "react";

interface ZaloIconProps extends ComponentProps<"svg"> {
  variant?: "badge" | "plain";
}

export function ZaloIcon({
  variant = "badge",
  className,
  ...props
}: Readonly<ZaloIconProps>) {
  if (variant === "plain") {
    return (
      <svg
        viewBox="0 0 48 48"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <text
          x="50%"
          y="53%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="19"
          fontWeight="800"
          fontFamily="var(--font-sans), Arial, sans-serif"
          fill="currentColor"
        >
          Zalo
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M24 4C12.954 4 4 12.507 4 23c0 4.148 1.417 7.973 3.832 11.077L5.12 41.528a1.5 1.5 0 001.916 1.916l7.451-2.714C17.588 41.583 20.692 42 24 42c11.046 0 20-8.507 20-19S35.046 4 24 4z"
        fill="#0068ff"
      />
      <text
        x="50%"
        y="53%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="16"
        fontWeight="900"
        fontFamily="var(--font-sans), Arial, sans-serif"
        fill="#ffffff"
        letterSpacing="-0.3"
      >
        Zalo
      </text>
    </svg>
  );
}
