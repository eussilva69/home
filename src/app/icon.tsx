import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Home Designer';
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          borderRadius: '100%',
        }}
      >
        <img width="24" height="24" src="https://i.ibb.co/3m8Gg8kr/logo-preta.png" alt="Home Designer Logo" />
      </div>
    ),
    {
      ...size,
    }
  );
}
