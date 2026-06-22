export default function LogoIcon({ size = 32 }: { size?: number }) {
  const radius = Math.round(size * 0.27);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'linear-gradient(135deg, #6a5cf0, #8b7bf5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg viewBox="0 0 24 24" width="64%" height="64%" style={{ display: 'block' }}>
        <path d="M12 3.2 21.8 7.7 12 12.2 2.2 7.7Z" fill="#fff" />
        <path d="M6.7 9.8v4.1s1.9 2.6 5.3 2.6 5.3-2.6 5.3-2.6V9.8L12 12.5Z" fill="#fff" />
        <path d="M21.6 8.1v4.2" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="21.6" cy="13.5" r="1.15" fill="#fff" />
      </svg>
    </div>
  );
}
