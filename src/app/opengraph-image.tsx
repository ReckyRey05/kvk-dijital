import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'KVK Digital | Premium Dijital Ajans';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #050505, #111111)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Glow Effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(100,100,255,0.1) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
          }}
        />
        
        <h1
          style={{
            fontSize: '84px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          KVK Digital
        </h1>
        <p
          style={{
            fontSize: '42px',
            color: '#a0a0a0',
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          Premium Dijital Ajans
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <span style={{ fontSize: '28px', color: '#4a90e2', border: '2px solid #4a90e2', padding: '10px 20px', borderRadius: '30px' }}>
            Web Tasarım
          </span>
          <span style={{ fontSize: '28px', color: '#4a90e2', border: '2px solid #4a90e2', padding: '10px 20px', borderRadius: '30px' }}>
            Özel Yazılım
          </span>
          <span style={{ fontSize: '28px', color: '#4a90e2', border: '2px solid #4a90e2', padding: '10px 20px', borderRadius: '30px' }}>
            Yapay Zeka
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
